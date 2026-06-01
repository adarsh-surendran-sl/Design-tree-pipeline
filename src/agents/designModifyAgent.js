import fs from 'fs'
import path from 'path'

import { visionJson } from '../llmClient.js'
import { applyUserOverrides } from '../overrides.js'
import { applyPatchesSafe } from '../patchUtils.js'
import { parseDesignTree, parsePatches } from '../schemas.js'
import { renderToFilesBrowser } from '../renderDispatch.js'
import { sanitizeTreeComposition } from '../composition.js'

const MODIFY_SYSTEM = `You modify an ad design tree based on user instructions.
Output ONLY valid JSON:
{
  "summary": "Brief description of changes made",
  "overrides": {
    "node_id": {
      "text": "new text",
      "color": "#hex",
      "backgroundColor": "#hex",
      "fill": "#hex",
      "fontSize": 48,
      "x": 0, "y": 0, "width": 100, "height": 40,
      "zIndex": 10
    }
  },
  "patches": [
    { "element": "node_id", "changes": { "text": "...", "color": "#hex" } }
  ]
}

Rules:
- Use existing node ids only (listed in the prompt).
- Prefer overrides for text/color/size changes.
- patches optional; merge with overrides.
- Keep product node src as assets/product.png unless user uploads replacement.
- No markdown in output.`

function nodeIndex(tree) {
  return (tree.children || [])
    .map(
      (n) =>
        `- ${n.id} (${n.type}, role=${n.role || ''}): text="${(n.text || '').slice(0, 40)}" color=${n.color || '—'}`,
    )
    .join('\n')
}

export async function modifyDesign({
  jobDir,
  designId,
  instruction,
  llm,
  productImagePath,
}) {
  jobDir = path.resolve(jobDir)
  const designDir = path.join(jobDir, 'designs', designId)
  const treePath = path.join(designDir, 'design_tree.json')
  if (!fs.existsSync(treePath)) {
    throw new Error(`Design not found: ${designId}`)
  }

  const tree = JSON.parse(fs.readFileSync(treePath, 'utf8'))
  const previewPath = path.join(designDir, 'preview.png')
  const assetsDir = path.join(jobDir, 'assets')

  const prompt =
    `Frame ${tree.width}x${tree.height}px.\n` +
    `NODES:\n${nodeIndex(tree)}\n\n` +
    `USER REQUEST:\n${instruction}\n\n` +
    `Apply changes to fulfill the request. Output JSON only.`

  const imagePaths = []
  if (fs.existsSync(previewPath)) imagePaths.push(previewPath)
  if (productImagePath && fs.existsSync(productImagePath)) imagePaths.push(productImagePath)

  const data = await visionJson(prompt, MODIFY_SYSTEM, imagePaths, llm, { maxAttempts: 4 })

  let updated = applyUserOverrides(tree, data.overrides || {})
  const patches = parsePatches(data)
  if (patches.length) {
    updated = applyPatchesSafe(updated, { patches })
  }
  updated = sanitizeTreeComposition(updated)
  parseDesignTree(updated, { width: tree.width, height: tree.height })

  fs.writeFileSync(treePath, JSON.stringify(updated, null, 2))
  const { png } = await renderToFilesBrowser(updated, designDir, 'preview', assetsDir)

  return {
    designId,
    tree: updated,
    summary: data.summary || 'Design updated.',
    previewUrl: `designs/${designId}/preview.png`,
    previewPath: png,
  }
}
