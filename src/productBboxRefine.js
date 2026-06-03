import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { getImageDimensions } from './assets.js'
import { sourcePixelsToTreeBox } from './frameLock.js'
import { estimateProductBBox } from './segmentation.js'

const REFINE_SYSTEM = `You refine bounding boxes for ad reconstruction.
Output ONLY JSON: {"patches":[{"element":"node_id","changes":{"x":0,"y":0,"width":0,"height":0}}]}

Rules:
- EXPAND the bbox to include the FULL product packshot: cap/lid top to base/shadow bottom.
- Include full silhouette width; do NOT crop through the label or product body.
- NEVER shrink the bbox below the current values — only expand or shift to reveal hidden parts.
- Reject bbox if height < 45% of visible product area or if bbox cuts through the subject.
- Do NOT include headline text, price banners, footer bars, or badge strips in the product bbox.
- Preserve original horizontal position — do not center unless product is centered in source.
- Integer pixels in frame coordinates (same size as user message).
- Max 3 patches, product node ids only.`

async function visionJson(prompt, system, imagePath, llm) {
  const apiKey = llm?.apiKey || process.env.ANTHROPIC_API_KEY
  const model = llm?.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'
  if (!apiKey) return { patches: [] }

  const client = new Anthropic({ apiKey, baseURL: llm?.baseURL })
  const ext = path.extname(imagePath).toLowerCase()
  const media =
    ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  const data = fs.readFileSync(imagePath).toString('base64')

  const resp = await client.messages.create({
    model,
    max_tokens: 1024,
    system,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: media, data } },
          { type: 'text', text: prompt },
        ],
      },
    ],
  })
  const text = resp.content?.find((b) => b.type === 'text')?.text || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return { patches: [] }
  return JSON.parse(match[0])
}

function findProductNode(tree) {
  return (tree.children || []).find(
    (n) =>
      n.role === 'product' ||
      n.id === 'product' ||
      String(n.id || '').includes('product') ||
      String(n.id || '').includes('bottle'),
  )
}

function bboxArea(node) {
  return Math.max(0, node.width ?? 0) * Math.max(0, node.height ?? 0)
}

function unionTreeBoxes(a, b) {
  const x1 = Math.min(a.x ?? 0, b.x ?? 0)
  const y1 = Math.min(a.y ?? 0, b.y ?? 0)
  const x2 = Math.max((a.x ?? 0) + (a.width ?? 0), (b.x ?? 0) + (b.width ?? 0))
  const y2 = Math.max((a.y ?? 0) + (a.height ?? 0), (b.y ?? 0) + (b.height ?? 0))
  return { x: x1, y: y1, width: Math.max(1, x2 - x1), height: Math.max(1, y2 - y1) }
}

function applyExpandOnlyPatch(node, changes, { frameH, minHeightRatio = 0.22 }) {
  const before = { x: node.x ?? 0, y: node.y ?? 0, width: node.width ?? 0, height: node.height ?? 0 }
  const proposed = {
    x: changes.x != null ? Math.round(Number(changes.x)) : before.x,
    y: changes.y != null ? Math.round(Number(changes.y)) : before.y,
    width: changes.width != null ? Math.max(1, Math.round(Number(changes.width))) : before.width,
    height: changes.height != null ? Math.max(1, Math.round(Number(changes.height))) : before.height,
  }

  const merged = unionTreeBoxes(before, proposed)
  const minH = Math.round(frameH * minHeightRatio)
  if (merged.height < minH) merged.height = Math.max(merged.height, minH)
  if (merged.height < before.height * 0.92 && bboxArea(merged) < bboxArea(before) * 0.95) {
    return false
  }

  node.x = merged.x
  node.y = merged.y
  node.width = merged.width
  node.height = merged.height
  return true
}

/** Deterministic guard: expand product bbox using image segmentation when too small. */
export async function ensureProductBBoxFidelity(tree, imagePath) {
  const product = findProductNode(tree)
  if (!product) return tree

  const [srcW, srcH] = await getImageDimensions(imagePath)
  const frameH = tree.height ?? srcH
  const estimated = await estimateProductBBox(imagePath)
  if (!estimated) return tree

  const updated = JSON.parse(JSON.stringify(tree))
  const node = updated.children.find((n) => n.id === product.id)
  if (!node) return tree

  const estBox = sourcePixelsToTreeBox(estimated, srcW, srcH, updated)
  const merged = unionTreeBoxes(node, estBox)
  const minH = Math.round(frameH * 0.22)

  if ((node.height ?? 0) < minH || (node.height ?? 0) < merged.height * 0.85) {
    node.x = merged.x
    node.y = merged.y
    node.width = merged.width
    node.height = Math.max(merged.height, minH)
    node.objectFit = 'contain'
    node.segmentationSource = node.segmentationSource || 'product_isolation'
  }

  return updated
}

/** Vision pass: expand product crop bbox on the source image (never shrink). */
export async function refineProductBboxWithVision(imagePath, tree, llm = null) {
  const product = findProductNode(tree)
  if (!product) return tree

  const [imgW, imgH] = await getImageDimensions(imagePath)
  const frameH = tree.height ?? imgH
  const prompt =
    `Frame ${tree.width}x${tree.height}px (must match source ${imgW}x${imgH}).\n` +
    `Current product node "${product.id}": x=${product.x}, y=${product.y}, width=${product.width}, height=${product.height}.\n` +
    'Return patches to EXPAND the bbox so the full jar/bottle is visible (cap to base shadow). Do NOT shrink.'

  try {
    const data = await visionJson(prompt, REFINE_SYSTEM, imagePath, llm)
    const patches = data?.patches || []
    let updated = JSON.parse(JSON.stringify(tree))
    const node = updated.children.find((n) => n.id === product.id)
    if (!node) return tree

    const p = patches.find((x) => x.element === product.id)
    if (p?.changes) {
      applyExpandOnlyPatch(node, p.changes, { frameH })
      node.objectFit = 'contain'
    }

    updated = await ensureProductBBoxFidelity(updated, imagePath)
    return updated
  } catch (e) {
    console.warn('Product bbox refine failed:', e?.message || e)
    return ensureProductBBoxFidelity(tree, imagePath)
  }
}
