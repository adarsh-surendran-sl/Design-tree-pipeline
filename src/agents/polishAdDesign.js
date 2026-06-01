import path from 'path'

import { visionJson } from '../llmClient.js'
import { applyPatchesSafe } from '../patchUtils.js'
import { buildCompareStrip } from '../assets.js'
import { parsePatches } from '../schemas.js'
import { mergePatches } from '../patchUtils.js'

const POLISH_SYSTEM = `You are a senior ad art director doing a QA pass on a rendered social ad.
You see: (1) the product reference, (2) the rendered ad, optionally (3) side-by-side comparison.

Output ONLY JSON: {"patches":[{"element":"node_id","changes":{...}}]}

Fix issues in priority order:
1. Product not fully visible — increase product width/height, ensure objectFit contain, center hero
2. Text clipped or overlapping product — move text (x,y), shrink fontSize, widen text box
3. Text outside safe margins — adjust x,y,width,height
4. Poor contrast — change color or add backgroundColor on text
5. CTA not readable — enlarge button, adjust position toward bottom safe zone
6. Alignment — center headline/CTA (textAlign center), balance layout

Allowed patch keys: x, y, width, height, fontSize, color, backgroundColor, textAlign, zIndex, objectFit
Up to 15 patches. Use existing node ids only. No markdown.`

export async function polishAdDesign({
  renderedPath,
  tree,
  productImagePath,
  brief,
  designDir,
  llm,
  highAccuracy = true,
}) {
  try {
    return await polishAdDesignInner({
      renderedPath,
      tree,
      productImagePath,
      brief,
      designDir,
      llm,
      highAccuracy,
    })
  } catch (e) {
    return { tree, patches: [], warning: e?.message || String(e) }
  }
}

async function polishAdDesignInner({
  renderedPath,
  tree,
  productImagePath,
  brief,
  designDir,
  llm,
  highAccuracy = true,
}) {
  const summary = (tree.children || [])
    .map(
      (n) =>
        `- ${n.id} (${n.type}, role=${n.role || ''}): "${String(n.text || '').slice(0, 36)}" @ ${n.x},${n.y} ${n.width}x${n.height}`,
    )
    .join('\n')

  let prompt =
    `Frame ${tree.width}x${tree.height}px.\n` +
    `Product: ${brief.title}\n` +
    (brief.tagline ? `Tagline: ${brief.tagline}\n` : '') +
    `\nNodes:\n${summary}\n\n` +
    `Tree JSON:\n${JSON.stringify(tree, null, 2)}\n\n` +
    `Review the RENDERED ad (image 2). Fix readability, full product visibility, and alignment.`

  const imagePaths = [productImagePath, renderedPath]

  if (designDir && highAccuracy) {
    const strip = path.join(designDir, '_polish_strip.png')
    await buildCompareStrip(productImagePath, renderedPath, strip)
    imagePaths.push(strip)
    prompt += '\n\nImage 3: left=product reference, right=rendered ad.'
  }

  let patches = []
  try {
    const data = await visionJson(prompt, POLISH_SYSTEM, imagePaths, llm)
    patches = mergePatches(parsePatches(data))
  } catch (e) {
    return { tree, patches: [], warning: e?.message || String(e) }
  }

  if (highAccuracy && designDir) {
    try {
      const strip = path.join(designDir, '_polish_fine.png')
      await buildCompareStrip(productImagePath, renderedPath, strip)
      const fineData = await visionJson(
        `Frame ${tree.width}x${tree.height}. Pixel-align text and product bounds. Nodes:\n${summary}`,
        `Output ONLY JSON: {"patches":[{"element":"node_id","changes":{"x":0,"y":0}}]}. Max 10 patches.`,
        [strip],
        llm,
      )
      patches = mergePatches(patches.concat(parsePatches(fineData)))
    } catch {
      /* fine pass is optional */
    }
  }

  if (!patches.length) return { tree, patches: [] }

  try {
    const updated = applyPatchesSafe(tree, patches)
    return { tree: updated, patches }
  } catch (e) {
    return { tree, patches: [], warning: e?.message || String(e) }
  }
}
