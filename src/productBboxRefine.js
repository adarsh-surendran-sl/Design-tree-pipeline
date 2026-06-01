import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { getImageDimensions } from './assets.js'

const REFINE_SYSTEM = `You refine bounding boxes for ad reconstruction.
Output ONLY JSON: {"patches":[{"element":"node_id","changes":{"x":0,"y":0,"width":0,"height":0}}]}

Rules:
- Tight box around the product bottle/pack only (include pump cap and base shadow edge).
- Do NOT include headline text or background.
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

/** Vision pass: tighten product crop bbox on the source image. */
export async function refineProductBboxWithVision(imagePath, tree, llm = null) {
  const product = findProductNode(tree)
  if (!product) return tree

  const [imgW, imgH] = await getImageDimensions(imagePath)
  const prompt =
    `Frame ${tree.width}x${tree.height}px (must match source ${imgW}x${imgH}).\n` +
    `Current product node "${product.id}": x=${product.x}, y=${product.y}, width=${product.width}, height=${product.height}.\n` +
    'Return patches to tightly bound the product only.'

  try {
    const data = await visionJson(prompt, REFINE_SYSTEM, imagePath, llm)
    const patches = data?.patches || []
    const updated = JSON.parse(JSON.stringify(tree))
    const node = updated.children.find((n) => n.id === product.id)
    if (!node) return tree

    const p = patches.find((x) => x.element === product.id)
    if (p?.changes) {
      for (const k of ['x', 'y', 'width', 'height']) {
        if (p.changes[k] != null) node[k] = Math.round(Number(p.changes[k]))
      }
      node.objectFit = 'contain'
    }
    return updated
  } catch (e) {
    console.warn('Product bbox refine failed:', e?.message || e)
    return tree
  }
}
