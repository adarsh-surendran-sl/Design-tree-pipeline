import path from 'path'

import { capabilityPromptBlock, heuristicAudit, applyConvertToImage, normalizeTreeStrategies, buildRetryPrompt } from './capabilities.js'
import { regionsToChildren } from './composition.js'
import { parseDesignTree, parsePatches } from './schemas.js'
import { mergePatches } from './patchUtils.js'
import { buildCompareStrip, getImageDimensions } from './assets.js'
import { lockFrameToSource } from './frameLock.js'
import { classifyAdLayout, archetypePromptSuffix } from './layoutArchetype.js'
import { visionJson, visionJsonStructured, visionDesignTreeJson } from './llmClient.js'
import {
  RegionPlanJsonSchema,
  PatchResponseJsonSchema,
  AuditRenderJsonSchema,
} from './llmSchemas.js'
import { buildRegionalCompareStrips } from './compareRegions.js'
import { comparePassPlan, shouldSkipCompareLlm } from './comparePolicy.js'
import { rescalePatchesToSource } from './visionCoords.js'
import { analyzeLayout } from './layoutClient.js'
import {
  mergeLayoutIntoTreePlan,
  enforceProductBboxFromLayout,
  applyOcrFromLayout,
} from './mergeLayoutRegions.js'

function imageToTreeSystem(archetypeSuffix = '') {
  return (
    'You analyze advertisement / marketing images and output ONLY valid JSON for a Design Tree.\n' +
    'No markdown, no explanation.\n\n' +
    capabilityPromptBlock() +
    (archetypeSuffix ? `\nLAYOUT GUIDANCE:\n${archetypeSuffix}\n` : '') +
    `
Before outputting JSON, verify:
1) Frame = exact source pixels from user message.
2) List every visible region: background, product, overlays, text blocks, footer bars.
3) Each visible text string → type "text" with exact copy (not image crop unless logo mark).
4) Product bbox: cap/lid top to base/shadow bottom; full silhouette width.
5) Price/offers → role price or badge; colored panel → shape + text child.
6) Angled panel → shape polygon with points[].
7) Do not add layers not visible in this image.

Rules:
1. Use the EXACT frame width and height from the user message (pixels).
2. DECOMPOSE the ad into separate layers — do NOT use one full-frame image crop of the entire ad.
3. Frame backgroundColor = flat base color only. Decorative backgrounds (sunburst, radial rays, stripes, mesh): add a type shape child at zIndex 0–2 covering that region with cssBackground (e.g. repeating-conic-gradient). Do NOT leave patterned areas as frame backgroundColor alone.
4. Separate nodes for: product/hero (type image, role product), logo (type logo), headline/tagline/CTA (type text), badge/sale (type image or badge), price (type text, role price), rating (type rating or image crop).
5. Set role on every node: background_fill|product|logo|headline|tagline|body_text|cta|badge|price|rating|icon|decorative|overlay.
6. Integer pixel coordinates; zIndex 0 = back.
7. renderStrategy "crop" + type image|logo for photos, logos, badges, icons, complex chrome.
8. renderStrategy "primitive" for plain text on solid color (type text|button) and simple shapes.
9. ONE crop per unified visual region (product+reflection, sale badge circle) — not the whole ad.
10. Plain text lines (even on sunburst/gradient/pattern backgrounds): type "text" with exact string — NEVER crop typography as image. Pattern is behind text; text is primitive.
11. Product/hero crops: objectFit "contain", bbox from top of cap to bottom of shadow; preserve original horizontal position.
12. Do not duplicate text that is already inside a photographic crop.
13. shape polygon + points[] for flat diagonal panels and parallelogram price tags; cssBackground for conic/radial/repeating patterns.
14. renderChoice "css"|"crop"|"ambiguous". If ambiguous, include renderOptions with both variants.
15. Do NOT add a narrow vertical panel behind the product unless the original clearly has one.
16. Describe ONLY what appears in the uploaded image — never add logos, products, or backgrounds from other ads or brands.
17. Match background style to THIS image: flat solid color → backgroundColor only (no sunburst); patterned → shape cssBackground with colors from the image.

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
1. Missing or extra layers — add/remove nodes via type + bbox patches
2. Product bbox — if product appears cropped/clipped, expand width/height; include cap to shadow
3. Price/banner position, panel colors, polygon points[]
4. Wrong renderStrategy — crop for photos/textures
5. Text content, fontSize, color
6. Background type (flat vs pattern vs photo)
7. zIndex

Do NOT center elements unless the original is centered.
Patches may set: type, renderStrategy, x, y, width, height, points, and all style fields.
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
2. List EVERY visible layer based on content (not a fixed count). Product-only ads may have 3–6 regions.
3. Default renderStrategy to "crop" when unsure.
4. ONE region per unified visual: product+reflection, full footer strip, hero photo, logo mark.
5. Do NOT split complex UI chrome into many small rectangles.
6. Plain text on flat color only → renderStrategy "primitive", suggestedType "text".
7. Price text on colored bar → primitive text role price + shape panel region.
8. Small overlay badges (e.g. 15ml) → overlay role, positioned relative to product not frame center.
9. Angled price tag → suggestedType shape, shape polygon, points[] in enrich step.
10. Simple star row only → primitive + suggestedType "rating"; else crop the strip.
11. Sunburst / striped backgrounds → shape background_fill; flat white/color → no extra bg region.
12. zIndex back-to-front: background 0-2, product 5-10, overlays 11-15, text 16+.`
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

Use the side-by-side image: LEFT=original, RIGHT=reconstruction (aspect preserved, letterboxed).
For each visible mismatch, estimate pixel deltas and output numeric/style keys:
x, y, width, height, fontSize, color, backgroundColor, fill, cssBackground, opacity, borderRadius, textAlign, objectFit, zIndex, points (polygon arrays).

Do not change text content unless clearly wrong. Prefer small bounded adjustments (typical 2-40px).
Prioritize product position/size, price banner, and overlay badges. Do not center unless original is centered.
Up to 15 patches.`

const TARGETED_COMPARE_SYSTEM = `You compare ORIGINAL vs RECONSTRUCTED ad renders.
Output ONLY JSON: {"patches":[{"element":"node_id","changes":{...}}]}

Focus ONLY on the layers mentioned in the user message (background, product, headline, CTA, price, badge, overlay).
Fix bbox and style fields: x, y, width, height, cssBackground, textAlign, objectFit, fontSize, color, points[].
For background mismatch on flat ads, use frame backgroundColor only — remove spurious sunburst layers.
For patterned bg mismatch, set cssBackground OR switch type to image crop.
Do not center elements unless original is centered. Up to 10 patches.`

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
    const data = await visionJsonStructured(prompt, AUDIT_RENDER_SYSTEM, [imagePath], AuditRenderJsonSchema, llm)
    const ids = data?.convert_to_image || []
    return (Array.isArray(ids) ? ids : []).map(String).filter((id) => (tree.children || []).some((n) => n.id === id))
  } catch {
    return []
  }
}

export async function imageToTree(
  imagePath,
  llm,
  { runVisionAudit = true, twoStage = true, layoutMeta = null, jobDir = null, onProgress = null } = {},
) {
  const step = (msg) => {
    if (typeof onProgress === 'function') onProgress(msg)
  }

  const [imgW, imgH] = await getImageDimensions(imagePath)
  const frameDefaults = { width: imgW, height: imgH }
  const archetypeSuffix = layoutMeta?.archetype ? archetypePromptSuffix(layoutMeta.archetype) : ''
  const basePrompt =
    `Source image: ${imgW}x${imgH} px. Frame width=${imgW}, height=${imgH}. ` +
    'Reconstruct this ad for maximum visual fidelity.'

  step('Layout sidecar: detecting regions…')
  const layoutAnalysis = await analyzeLayout(imagePath, { jobDir })
  const hasLayoutSeed = Boolean(layoutAnalysis?.regions?.length)

  const tree = twoStage
    ? await (async () => {
        if (hasLayoutSeed) {
          step('Claude: enriching layout regions (semantics + styles)…')
          const merged = mergeLayoutIntoTreePlan(layoutAnalysis, frameDefaults)
          const planJson = JSON.stringify(merged.plan, null, 2)
          const enrichPrompt =
            `Frame ${imgW}x${imgH}px.\nLAYOUT ANALYSIS (authoritative bboxes — do NOT shrink product or footer regions):\n${planJson}\n\n` +
            (archetypeSuffix ? `${archetypeSuffix}\n\n` : '') +
            `Build the full Design Tree JSON. Keep region ids and bboxes from the plan; add text, colors, renderStrategy, cssBackground, points[] as needed.`

          const enrichData = await visionDesignTreeJson(enrichPrompt, enrichRegionsSystem(), [imagePath], llm)
          let result = mergeFrameFromPlan(enrichData, merged.plan)
          if (!result?.children?.length) {
            result = {
              type: 'frame',
              width: imgW,
              height: imgH,
              backgroundColor: layoutAnalysis.backgroundColor || '#ffffff',
              children: merged.children,
            }
          }
          result = enforceProductBboxFromLayout(parseTree(result, frameDefaults), layoutAnalysis)
          result = applyOcrFromLayout(result, layoutAnalysis)
          return lockFrameToSource(result, imgW, imgH)
        }

        step('Claude: segmenting ad into regions…')
        const segPrompt =
          `Source image: ${imgW}x${imgH} px. Frame width=${imgW}, height=${imgH}. ` +
          (archetypeSuffix ? `${archetypeSuffix}\n` : '') +
          'Segment this ad into regions with renderStrategy per capability rules.'

        const segData = await visionJsonStructured(
          segPrompt,
          regionSegmentSystem(),
          [imagePath],
          RegionPlanJsonSchema,
          llm,
        )
        const regions = segData?.regions || []
        if (!regions.length) {
          const system = imageToTreeSystem(archetypeSuffix)
          const prompt =
            `Source image: ${imgW}x${imgH} px. Frame width=${imgW}, height=${imgH}. Return a complete Design Tree that reconstructs this ad using crop vs primitive per capability rules.`
          const data = await visionJson(prompt, system, [imagePath], llm)
          return lockFrameToSource(parseTree(data, frameDefaults), imgW, imgH)
        }

        step('Claude: building design tree from regions…')
        const planJson = JSON.stringify(segData, null, 2)
        const enrichPrompt =
          `Frame ${imgW}x${imgH}px.\nREGION PLAN:\n${planJson}\n\n` +
          (archetypeSuffix ? `${archetypeSuffix}\n\n` : '') +
          `Build the full Design Tree JSON with type frame, width ${imgW}, height ${imgH}, backgroundColor, and children[] from this plan and the image.`

        const enrichData = await visionDesignTreeJson(enrichPrompt, enrichRegionsSystem(), [imagePath], llm)
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
        return lockFrameToSource(parseTree(merged, frameDefaults), imgW, imgH)
      })()
    : await (async () => {
        const system = imageToTreeSystem(archetypeSuffix)
        const prompt =
          `Source image: ${imgW}x${imgH} px. Frame width=${imgW}, height=${imgH}. ` +
          'Return a complete Design Tree that reconstructs this ad using crop vs primitive per capability rules.'
        const data = await visionJson(prompt, system, [imagePath], llm)
        return lockFrameToSource(parseTree(data, frameDefaults), imgW, imgH)
      })()

  let refined = tree
  const system = imageToTreeSystem(archetypeSuffix)
  const auditOpts = { skipBackgroundAudit: layoutMeta?.skipBackgroundAudit ?? false }
  const skipHeuristicRetries = hasLayoutSeed && process.env.RECONSTRUCTION_SKIP_HEURISTIC_RETRY !== '1'
  if (!skipHeuristicRetries) {
    for (let retry = 0; retry < 2; retry += 1) {
      const issues = heuristicAudit(refined, auditOpts)
      if (!issues.length) break
      step(`Claude: fixing layout issues (pass ${retry + 1})…`)
      const prompt = buildRetryPrompt(basePrompt, issues)
      const data = await visionJson(prompt, system, [imagePath], llm)
      refined = lockFrameToSource(parseTree(data, frameDefaults), imgW, imgH)
    }
  }

  const skipVisionAudit = hasLayoutSeed && process.env.RECONSTRUCTION_SKIP_VISION_AUDIT !== '0'
  if (runVisionAudit && !skipVisionAudit) {
    step('Claude: audit crop vs primitive…')
    const convertIds = await visionAuditRenderStrategy(imagePath, refined, llm)
    if (convertIds.length) {
      refined = applyConvertToImage(refined, convertIds)
    }
  }

  const { promoteTextRasters } = await import('./textRasterPromote.js')
  const hasOcrText = (layoutAnalysis?.regions || []).some((r) => r.text && (r.role === 'price' || r.role === 'badge'))
  if (!hasOcrText) {
    step('Claude: promoting text layers…')
    refined = await promoteTextRasters(refined, imagePath, llm, { useVision: true })
  }

  refined = normalizeTreeStrategies(refined)

  if (!(refined.children || []).length) {
    const prompt =
      `Source image: ${imgW}x${imgH} px. Frame width=${imgW}, height=${imgH}. ` +
      'Return a complete Design Tree with one node per visible region (product, price bar, badges, text). ' +
      'Do NOT use one full-frame image crop. Do NOT invent layers not in the image.'
    const data = await visionDesignTreeJson(prompt, system, [imagePath], llm)
    refined = lockFrameToSource(parseTree(data, frameDefaults), imgW, imgH)
    refined = normalizeTreeStrategies(refined)
  }

  if (layoutAnalysis) {
    refined._layoutMeta = { ...(layoutMeta || {}), layoutAnalysis, archetype: layoutMeta?.archetype }
  } else if (layoutMeta) {
    refined._layoutMeta = layoutMeta
  }

  return refined
}

export async function compareAndPatch(
  originalPath,
  renderedPath,
  tree,
  llm,
  { compareDir = null, highAccuracy = true, score = null } = {},
) {
  if (shouldSkipCompareLlm(score)) return []

  const plan = comparePassPlan({ highAccuracy, score })
  if (!plan.main && !plan.regional && !plan.fine) return []

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

  const [srcW, srcH] = await getImageDimensions(orig)
  let patches = []
  if (plan.main) {
    const data = await visionJsonStructured(prompt, compareSystem(), imagePaths, PatchResponseJsonSchema, llm)
    patches = rescalePatchesToSource(mergePatches(parsePatches(data)), srcW, srcH, tree)
  }

  if (plan.regional && renderedExt !== '.svg' && compareDir) {
    const regional = await buildRegionalCompareStrips(orig, rendered, tree, compareDir, tree._layoutMeta)
    if (regional.paths.length) {
      const regionalPrompt =
        prompt +
        `\n\nAdditional images: regional compare panels (${regional.labels.join(', ')}). ` +
        'Fix mismatches in those regions first (product, footer/price, badge).'
      const regionalData = await visionJsonStructured(
        regionalPrompt,
        compareSystem(),
        imagePaths.concat(regional.paths),
        PatchResponseJsonSchema,
        llm,
      )
      patches = mergePatches(
        patches.concat(rescalePatchesToSource(parsePatches(regionalData), srcW, srcH, tree)),
      )
    }
  }

  if (plan.fine && renderedExt !== '.svg' && compareDir) {
    const strip = path.join(compareDir, '_compare_fine.png')
    await buildCompareStrip(orig, rendered, strip)
    const finePrompt =
      `Frame: ${tree.width}x${tree.height}px.\n` + `Nodes:\n${summary}\n\n` + 'Side-by-side panel attached. Output pixel-level layout patches only.'
    const fineData = await visionJsonStructured(finePrompt, LAYOUT_FINE_SYSTEM, [strip], PatchResponseJsonSchema, llm)
    patches = mergePatches(
      patches.concat(rescalePatchesToSource(parsePatches(fineData), srcW, srcH, tree)),
    )
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
    const [srcW, srcH] = await getImageDimensions(orig)
    const fineData = await visionJsonStructured(finePrompt, LAYOUT_FINE_SYSTEM, [strip], PatchResponseJsonSchema, llm)
    return rescalePatchesToSource(mergePatches(parsePatches(fineData)), srcW, srcH, tree)
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

  const focusStr =
    (focus || []).join(', ') || 'background_fill, product, headline, cta, price, badge, overlay'
  const prompt =
    `Frame ${tree.width}x${tree.height}px.\nFocus layers: ${focusStr}.\n` +
    `Tree nodes:\n${nodeIdSummary(tree)}\n\n` +
    'Side-by-side: LEFT=ORIGINAL, RIGHT=RECONSTRUCTION.'

  try {
    const [srcW, srcH] = await getImageDimensions(orig)
    const imagePaths = [strip]
    if (multiRegionCompareEnabled(true) && compareDir) {
      const regional = await buildRegionalCompareStrips(orig, rendered, tree, compareDir, tree._layoutMeta)
      imagePaths.push(...regional.paths)
    }
    const data = await visionJsonStructured(prompt, TARGETED_COMPARE_SYSTEM, imagePaths, PatchResponseJsonSchema, llm)
    return rescalePatchesToSource(mergePatches(parsePatches(data)), srcW, srcH, tree)
  } catch (e) {
    console.warn('compareAndPatchTargeted failed:', e?.message || e)
    return []
  }
}

