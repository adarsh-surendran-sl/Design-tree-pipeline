import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import Anthropic from '@anthropic-ai/sdk'

import { capabilityPromptBlock, heuristicAudit, applyConvertToImage, normalizeTreeStrategies, buildRetryPrompt } from './capabilities.js'
import { regionsToChildren } from './composition.js'
import { parseDesignTree, parsePatches } from './schemas.js'
import { mergePatches } from './patchUtils.js'
import { buildCompareStrip, getImageDimensions } from './assets.js'

function mediaTypeForPath(p) {
  const ext = path.extname(String(p)).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  // default fallback
  return 'image/jpeg'
}

function readBase64(p) {
  return fs.readFileSync(p).toString('base64')
}

function extractJson(text) {
  let t = String(text ?? '').trim()
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '')
    t = t.replace(/\s*```$/i, '')
  }
  const match = t.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
  if (!match) throw new Error('No JSON found in model output')
  return JSON.parse(match[1])
}

function claudeTextFromResponse(resp) {
  const parts = (resp?.content ?? []).filter((b) => b?.type === 'text').map((b) => b.text)
  if (parts.length) return parts.join('\n')
  if (resp?.content?.[0]?.text) return resp.content[0].text
  return ''
}

function getDefaultClaudeConfig() {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
    maxTokens: process.env.ANTHROPIC_MAX_TOKENS ? Number(process.env.ANTHROPIC_MAX_TOKENS) : 8192,
  }
}

function createClaudeClient(llm) {
  const cfg = llm || getDefaultClaudeConfig()
  if (!cfg.apiKey) throw new Error('Missing ANTHROPIC_API_KEY (env) or provide llm.apiKey')
  return {
    client: new Anthropic({ apiKey: cfg.apiKey, baseURL: cfg.baseURL }),
    cfg,
  }
}

async function visionAask(prompt, system, imagePaths, llm) {
  const { client, cfg } = createClaudeClient(llm)
  const paths = imagePaths.map((p) => path.resolve(String(p)))

  const blocks = []
  for (const p of paths) {
    const ext = path.extname(p).toLowerCase()
    if (ext === '.svg') {
      throw new Error('SVG vision not supported in this JS pipeline. Render SVG to PNG first.')
    }
    blocks.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: mediaTypeForPath(p),
        data: readBase64(p),
      },
    })
  }
  blocks.push({ type: 'text', text: prompt })

  const resp = await client.messages.create({
    model: cfg.model,
    max_tokens: cfg.maxTokens,
    system,
    messages: [{ role: 'user', content: blocks }],
  })
  return claudeTextFromResponse(resp)
}

async function visionJson(prompt, system, imagePaths, llm) {
  let extra = ''
  let lastErr = null
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const rsp = await visionAask(prompt + extra, system, imagePaths, llm)
    try {
      return extractJson(rsp)
    } catch (e) {
      lastErr = e
      extra =
        '\n\nYour previous reply was not valid JSON. Reply with ONLY a single JSON object, no markdown.'
    }
  }
  throw new Error(`Model did not return valid JSON: ${lastErr?.message || lastErr}`)
}

function imageToTreeSystem() {
  return (
    'You analyze advertisement / marketing images and output ONLY valid JSON for a Design Tree.\n' +
    'No markdown, no explanation.\n\n' +
    capabilityPromptBlock() +
    `
Rules:
1. Use the EXACT frame width and height from the user message (pixels).
2. DECOMPOSE the ad into separate layers — do NOT use one full-frame image crop of the entire ad.
3. Frame backgroundColor = flat base color only. Decorative backgrounds (sunburst, radial rays, stripes, mesh): add a type shape child at zIndex 0–2 covering that region with cssBackground (e.g. repeating-conic-gradient). Do NOT leave patterned areas as frame backgroundColor alone.
4. Separate nodes for: product/hero (type image, role product), logo (type logo), headline/tagline/CTA (type text), badge/sale (type image or badge), rating (type rating or image crop).
5. Set role on every node: background_fill|product|logo|headline|tagline|body_text|cta|badge|price|rating|icon|decorative|overlay.
6. Integer pixel coordinates; zIndex 0 = back.
7. renderStrategy "crop" + type image|logo for photos, logos, badges, icons, complex chrome.
8. renderStrategy "primitive" for plain text on solid color (type text|button) and simple shapes.
9. ONE crop per unified visual region (product+reflection, sale badge circle) — not the whole ad.
10. Plain text lines (even on sunburst/gradient/pattern backgrounds): type "text" with exact string — NEVER crop typography as image. Pattern is behind text; text is primitive.
11. Product/hero crops: objectFit "contain", bbox tightly around the product; center horizontally when the original is centered.
12. Do not duplicate text that is already inside a photographic crop.
13. shape polygon + points[] for flat diagonal panels; gradientFrom/gradientTo for simple two-color linear gradients; cssBackground for conic/radial/repeating patterns (prefer repeating-conic-gradient for sunburst rays, full frame, zIndex 0–1).
14. renderChoice "css"|"crop"|"ambiguous". If ambiguous, include renderOptions: {"css":{...node fields...},"crop":{...}} with same id/bbox. Use ambiguous when unsure if CSS can match the original.
15. Do NOT add a narrow vertical panel behind the product unless the original clearly has one — use one full-frame background layer.
16. Describe ONLY what appears in the uploaded image — never add logos, products, or backgrounds from other ads or brands.
17. Match background style to THIS image: flat solid color → frame backgroundColor only (no sunburst); radial rays / stripes → shape + cssBackground with colors sampled from the image (not generic lime green).

Schema:
{"type":"frame","width":W,"height":H,"backgroundColor":"#hex","children":[
  {"id":"unique_id","type":"text|button|shape|image|badge|logo|background|overlay|rating",
   "renderStrategy":"auto|crop|primitive","renderChoice":"css|crop|ambiguous","role":"...",
   "text":"...","x":0,"y":0,"width":0,"height":0,"fontSize":0,"color":"#hex",
   "backgroundColor":"#hex","fill":"#hex","cssBackground":"repeating-conic-gradient(...)",
   "zIndex":0,"textAlign":"left|center|right","fontWeight":"bold","objectFit":"cover|contain",
   "ratingValue":4.5,"shape":"rect|ellipse|polygon","points":[x1,y1,...],
   "gradientFrom":"#hex","gradientTo":"#hex","gradientAngle":90,
   "renderOptions":{"css":{"type":"shape","cssBackground":"...","summary":"sunburst"},
    "crop":{"type":"image","role":"background_fill","summary":"pattern crop"}}}
]}`
  )
}

function compareSystem() {
  return (
    imageToTreeSystem().split('Schema:')[0] +
    `
COMPARE TASK:
Output ONLY JSON: {"patches":[{"element":"node_id","changes":{"field":value}}]}

Images: (1) ORIGINAL (2) RECONSTRUCTED (3) optional side-by-side.

Fix priority:
1. Wrong renderStrategy — set type "image" + renderStrategy "crop" for mismatched complex regions
2. image/logo/background bounds (x,y,width,height)
3. Merge failed primitive clusters into one image crop (delete duplicates via patches changing type)
4. frame backgroundColor, text, buttons, shapes, cssBackground, gradients, polygon points
5. rating type + ratingValue OR crop as image
6. zIndex

Patches may set: type, renderStrategy, x, y, width, height, and all style fields.
Up to 20 patches. Existing ids only.`
  )
}

function regionSegmentSystem() {
  return `You segment an advertisement image into logical layers for reconstruction.
Output ONLY valid JSON (no markdown):

${capabilityPromptBlock()}

OUTPUT SCHEMA:
{"type":"frame","width":W,"height":H,"backgroundColor":"#hex",
  "regions":[
    {"id":"unique_id","renderStrategy":"crop|primitive","suggestedType":"image|text|button|shape|rating|logo|background|badge",
      "role":"short label","x":0,"y":0,"width":0,"height":0,"zIndex":0}
  ]}

SEGMENTATION RULES:
1. Use exact frame dimensions from the user message.
2. List EVERY visible layer (typically 4–20 regions).
3. Default renderStrategy to "crop" when unsure.
4. ONE region per unified visual: product+reflection, full footer strip, hero photo, logo mark.
5. Do NOT split complex UI chrome into many small rectangles.
6. Plain text on flat color only → renderStrategy "primitive", suggestedType "text".
7. Simple star row only → primitive + suggestedType "rating"; else crop the strip.
8. Sunburst / radial-ray / striped backgrounds → suggestedType shape, role background_fill, renderStrategy primitive (or ambiguous with css+crop options).`
}

function enrichRegionsSystem() {
  return `You build a complete Design Tree from a region plan and the source image.
Output ONLY valid JSON Design Tree (full children[]), no markdown.

${capabilityPromptBlock()}

RULES:
1. Keep the same region ids, bounding boxes, and zIndex from the plan.
2. Honor each region's renderStrategy (crop → type image|logo|background; primitive → text|shape|button|rating).
3. Add all fields needed to render: text, fontSize, color, fill, cssBackground, ratingValue, points, gradients, renderChoice/renderOptions when unsure.
4. Patterned backgrounds: shape + cssBackground (sunburst → repeating-conic-gradient from center behind product).
5. Do not add or remove regions. Do not duplicate text inside photographic crops.`
}

const AUDIT_RENDER_SYSTEM = `You audit whether a Design Tree can be reproduced by a limited renderer.
Given the ORIGINAL image and the Design Tree JSON, output ONLY JSON:
{"convert_to_image":["node_id",...]}

List node ids that MUST use type image (crop from original) because primitives cannot match:
photos, textures, shadows, custom icons, reflections, labels on products, multi-panel UI chrome, photographic noise.

Do NOT list nodes that are plain text on flat color, simple solid shapes, or shapes with a valid cssBackground / linear gradient already specified.
NEVER convert type text nodes to image — headlines on patterned backgrounds must stay text.
Do NOT list background_fill nodes that use repeating-conic-gradient or conic-gradient in cssBackground unless the pattern is clearly photographic.
Max 15 ids.`

const LAYOUT_FINE_SYSTEM = `You perform a final pixel-alignment pass on an ad reconstruction.
Output ONLY JSON: {"patches":[{"element":"id","changes":{...}}]}

Use the side-by-side image: LEFT=original, RIGHT=reconstruction.
For each visible mismatch, estimate pixel deltas and output ONLY numeric/style keys:
x, y, width, height, fontSize, color, backgroundColor, fill, cssBackground, opacity, borderRadius, textAlign, objectFit, zIndex.

Do not change text content unless clearly wrong. Prefer small bounded adjustments (typical 2-40px).
Prioritize product position/size and headline vertical placement. Up to 15 patches.`

const TARGETED_COMPARE_SYSTEM = `You compare ORIGINAL vs RECONSTRUCTED ad renders.
Output ONLY JSON: {"patches":[{"element":"node_id","changes":{...}}]}

Focus ONLY on the layers mentioned in the user message (background, product, headline, CTA).
Fix bbox and style fields: x, y, width, height, cssBackground, textAlign, objectFit, fontSize, color.
For background sunburst mismatch, set cssBackground to repeating-conic-gradient OR switch type to image with full-frame crop.
Up to 10 patches.`

function nodeIdSummary(tree) {
  const lines = []
  for (const n of tree.children || []) {
    lines.push(
      `- ${n.id}: type=${n.type} role=${n.role || ''} box=(${Math.floor(n.x)},${Math.floor(n.y)},${Math.floor(
        n.width,
      )},${Math.floor(n.height)}) z=${n.zIndex}`,
    )
  }
  return lines.join('\n') || '(no children)'
}

function parseTree(data, frameDefaults) {
  return parseDesignTree(data, frameDefaults)
}

function mergeFrameFromPlan(target, plan) {
  if (!plan || typeof plan !== 'object') return target
  const out = { ...(target ?? {}) }
  if (out.width == null && plan.width != null) out.width = plan.width
  if (out.height == null && plan.height != null) out.height = plan.height
  if (!out.backgroundColor && plan.backgroundColor) out.backgroundColor = plan.backgroundColor
  if (!out.type && plan.type) out.type = plan.type
  return out
}

async function visionAuditRenderStrategy(imagePath, tree, llm) {
  const prompt = `Frame ${tree.width}x${tree.height}px.\nTree:\n${JSON.stringify(tree, null, 2)}\n\nWhich nodes must convert to image crops?`
  try {
    const data = await visionJson(prompt, AUDIT_RENDER_SYSTEM, [imagePath], llm)
    const ids = data?.convert_to_image || []
    return (Array.isArray(ids) ? ids : []).map(String).filter((id) => (tree.children || []).some((n) => n.id === id))
  } catch {
    return []
  }
}

export async function imageToTree(imagePath, llm, { runVisionAudit = true, twoStage = true } = {}) {
  const [imgW, imgH] = await getImageDimensions(imagePath)
  const frameDefaults = { width: imgW, height: imgH }
  const basePrompt =
    `Source image: ${imgW}x${imgH} px. Frame width=${imgW}, height=${imgH}. ` +
    'Reconstruct this ad for maximum visual fidelity.'

  const tree = twoStage
    ? await (async () => {
        const segPrompt =
          `Source image: ${imgW}x${imgH} px. Frame width=${imgW}, height=${imgH}. ` +
          'Segment this ad into regions with renderStrategy per capability rules.'

        const segData = await visionJson(segPrompt, regionSegmentSystem(), [imagePath], llm)
        const regions = segData?.regions || []
        if (!regions.length) {
          const system = imageToTreeSystem()
          const prompt =
            `Source image: ${imgW}x${imgH} px. Frame width=${imgW}, height=${imgH}. Return a complete Design Tree that reconstructs this ad using crop vs primitive per capability rules.`
          const data = await visionJson(prompt, system, [imagePath], llm)
          return parseTree(data, frameDefaults)
        }

        const planJson = JSON.stringify(segData, null, 2)
        const enrichPrompt =
          `Frame ${imgW}x${imgH}px.\nREGION PLAN:\n${planJson}\n\n` +
          `Build the full Design Tree JSON with type frame, width ${imgW}, height ${imgH}, backgroundColor, and children[] from this plan and the image.`

        const enrichData = await visionJson(enrichPrompt, enrichRegionsSystem(), [imagePath], llm)
        let merged = mergeFrameFromPlan(enrichData, segData)
        if (!merged?.children?.length && regions.length) {
          merged = {
            ...merged,
            type: 'frame',
            width: imgW,
            height: imgH,
            backgroundColor: segData.backgroundColor || merged.backgroundColor || '#ffffff',
            children: regionsToChildren(regions, frameDefaults),
          }
        }
        return parseTree(merged, frameDefaults)
      })()
    : await (async () => {
        const system = imageToTreeSystem()
        const prompt =
          `Source image: ${imgW}x${imgH} px. Frame width=${imgW}, height=${imgH}. ` +
          'Return a complete Design Tree that reconstructs this ad using crop vs primitive per capability rules.'
        const data = await visionJson(prompt, system, [imagePath], llm)
        return parseTree(data, frameDefaults)
      })()

  let refined = tree
  const system = imageToTreeSystem()
  for (let retry = 0; retry < 2; retry += 1) {
    const issues = heuristicAudit(refined)
    if (!issues.length) break
    const prompt = buildRetryPrompt(basePrompt, issues)
    const data = await visionJson(prompt, system, [imagePath], llm)
    refined = parseTree(data, frameDefaults)
  }

  if (runVisionAudit) {
    const convertIds = await visionAuditRenderStrategy(imagePath, refined, llm)
    if (convertIds.length) {
      refined = applyConvertToImage(refined, convertIds)
    }
  }

  const { promoteTextRasters } = await import('./textRasterPromote.js')
  refined = await promoteTextRasters(refined, imagePath, llm, { useVision: true })

  refined = normalizeTreeStrategies(refined)

  if (!(refined.children || []).length) {
    const system = imageToTreeSystem()
    const prompt =
      `Source image: ${imgW}x${imgH} px. Frame width=${imgW}, height=${imgH}. ` +
      'Return a complete Design Tree with at least 5 children (logo, product, headline, badge, footer text). ' +
      'Do NOT use one full-frame image crop.'
    const data = await visionJson(prompt, system, [imagePath], llm)
    refined = parseTree(data, frameDefaults)
    refined = normalizeTreeStrategies(refined)
  }

  return refined
}

export async function compareAndPatch(originalPath, renderedPath, tree, llm, { compareDir = null, highAccuracy = true } = {}) {
  const orig = path.resolve(originalPath)
  const rendered = path.resolve(renderedPath)
  const summary = nodeIdSummary(tree)

  let prompt =
    `Frame size: ${tree.width}x${tree.height}px.\n` +
    `Node index:\n${summary}\n\n` +
    `Design Tree JSON:\n${JSON.stringify(tree, null, 2)}\n\n` +
    'Align the RECONSTRUCTION to match the ORIGINAL.'

  const imagePaths = [orig]
  const renderedExt = path.extname(rendered).toLowerCase()

  if (renderedExt === '.svg') {
    prompt += '\n\nReconstruction is SVG-only — use the Design Tree JSON and ORIGINAL image only.'
  } else {
    imagePaths.push(rendered)
    if (compareDir) {
      const strip = path.join(compareDir, '_compare_strip.png')
      await buildCompareStrip(orig, rendered, strip)
      imagePaths.push(strip)
      prompt +=
        '\n\nImage 3 is a side-by-side panel (left=ORIGINAL, right=RECONSTRUCTED). ' +
        'Use it to judge horizontal/vertical alignment.'
    }
  }

  const data = await visionJson(prompt, compareSystem(), imagePaths, llm)
  let patches = mergePatches(parsePatches(data))

  if (highAccuracy && renderedExt !== '.svg' && compareDir) {
    const strip = path.join(compareDir, '_compare_fine.png')
    await buildCompareStrip(orig, rendered, strip)
    const finePrompt =
      `Frame: ${tree.width}x${tree.height}px.\n` + `Nodes:\n${summary}\n\n` + 'Side-by-side panel attached. Output pixel-level layout patches only.'
    const fineData = await visionJson(finePrompt, LAYOUT_FINE_SYSTEM, [strip], llm)
    patches = mergePatches(patches.concat(parsePatches(fineData)))
  }

  return patches
}

export async function layoutFinePass(originalPath, renderedPath, tree, llm, compareDir = null) {
  const orig = path.resolve(originalPath)
  const rendered = path.resolve(renderedPath)
  if (path.extname(rendered).toLowerCase() === '.svg') return []

  const strip = compareDir
    ? path.join(compareDir, '_compare_fine.png')
    : path.join(path.dirname(rendered), '_compare_fine.png')
  await buildCompareStrip(orig, rendered, strip)

  const summary = nodeIdSummary(tree)
  const finePrompt =
    `Frame: ${tree.width}x${tree.height}px.\nNodes:\n${summary}\n\n` +
    'Side-by-side: LEFT=ORIGINAL, RIGHT=RECONSTRUCTION. Output pixel-level layout patches only.'

  try {
    const fineData = await visionJson(finePrompt, LAYOUT_FINE_SYSTEM, [strip], llm)
    return mergePatches(parsePatches(fineData))
  } catch (e) {
    console.warn('layoutFinePass failed:', e?.message || e)
    return []
  }
}

export async function compareAndPatchTargeted(
  originalPath,
  renderedPath,
  tree,
  llm,
  { compareDir = null, focus = [] } = {},
) {
  const orig = path.resolve(originalPath)
  const rendered = path.resolve(renderedPath)
  const strip = compareDir
    ? path.join(compareDir, '_compare_targeted.png')
    : path.join(path.dirname(rendered), '_compare_targeted.png')
  await buildCompareStrip(orig, rendered, strip)

  const focusStr = (focus || []).join(', ') || 'background, product, headline, cta'
  const prompt =
    `Frame ${tree.width}x${tree.height}px.\nFocus layers: ${focusStr}.\n` +
    `Tree nodes:\n${nodeIdSummary(tree)}\n\n` +
    'Side-by-side: LEFT=ORIGINAL, RIGHT=RECONSTRUCTION.'

  try {
    const data = await visionJson(prompt, TARGETED_COMPARE_SYSTEM, [strip], llm)
    return mergePatches(parsePatches(data))
  } catch (e) {
    console.warn('compareAndPatchTargeted failed:', e?.message || e)
    return []
  }
}

