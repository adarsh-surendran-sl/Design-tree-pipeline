import fs from 'fs'
import path from 'path'

import { enhanceReconstructionTree } from './reconstructionEnhance.js'
import { promoteTextRasters } from './textRasterPromote.js'
import { refineProductBboxWithVision } from './productBboxRefine.js'
import { refineProductBboxFromSegmentation } from './segmentation.js'
import { scoreReconstruction, RECONSTRUCTION_SCORE_RETRY } from './reconstructionScore.js'
import { layoutFinePass, compareAndPatchTargeted } from './llmAgents.js'
import { exportLayersReference } from './layerExport.js'
import { fixReconstructionLayout } from './reconstructionLayout.js'
import { normalizeTreeStrategies } from './capabilities.js'

/**
 * Full pre-embed enhancement pipeline for Image → Tree.
 */
export async function runReconstructionEnhancements(tree, imagePath, llm, options = {}) {
  const {
    highAccuracy = true,
    jobDir = null,
    publicBaseUrl = null,
    jobId = null,
  } = options

  let t = enhanceReconstructionTree(tree)
  t = fixReconstructionLayout(t)

  if (highAccuracy && imagePath) {
    t = await promoteTextRasters(t, imagePath, llm, { useVision: true })
    t = fixReconstructionLayout(t)
  }

  if (highAccuracy) {
    t = await refineProductBboxFromSegmentation(imagePath, t, {
      tryMcp: Boolean(publicBaseUrl && jobId),
      jobDir,
      publicBaseUrl,
      jobId,
    })
    t = await refineProductBboxWithVision(imagePath, t, llm)
  }

  t = fixReconstructionLayout(t)
  t = normalizeTreeStrategies(t)
  return t
}

export async function runPostRenderQualityPass({
  originalPath,
  renderedPath,
  tree,
  llm,
  compareDir,
  highAccuracy = true,
}) {
  let updated = tree
  const scores = []

  if (!highAccuracy) return { tree: updated, scores }

  try {
    const score = await scoreReconstruction(originalPath, renderedPath)
    scores.push(score)

    if (score.needsRetry) {
      const targeted = await compareAndPatchTargeted(originalPath, renderedPath, updated, llm, {
        compareDir,
        focus: ['background_fill', 'product', 'headline', 'cta'],
      })
      if (targeted.length) {
        const { applyPatchesSafe } = await import('./patchUtils.js')
        updated = applyPatchesSafe(updated, targeted)
        updated = fixReconstructionLayout(updated)
        updated = enhanceReconstructionTree(updated)
      }
    }

    const fine = await layoutFinePass(originalPath, renderedPath, updated, llm, compareDir)
    if (fine.length) {
      const { applyPatchesSafe } = await import('./patchUtils.js')
      updated = applyPatchesSafe(updated, fine)
      updated = fixReconstructionLayout(updated)
    }

    const scoreAfter = await scoreReconstruction(originalPath, renderedPath)
    scores.push({ ...scoreAfter, label: 'after_patches' })
  } catch (e) {
    console.warn('Post-render quality pass failed:', e?.message || e)
  }

  return { tree: updated, scores }
}

export function saveReconstructionArtifacts(jobDir, tree, scores = null) {
  const out = path.resolve(jobDir)
  fs.mkdirSync(out, { recursive: true })

  const layers = exportLayersReference(tree)
  fs.writeFileSync(path.join(out, 'layers_reference.json'), JSON.stringify(layers, null, 2), 'utf8')
  fs.writeFileSync(path.join(out, 'layers_reference.md'), layers.markdown, 'utf8')

  if (scores) {
    fs.writeFileSync(path.join(out, 'reconstruction_score.json'), JSON.stringify(scores, null, 2), 'utf8')
  }
}

export { scoreReconstruction, RECONSTRUCTION_SCORE_RETRY, exportLayersReference }
