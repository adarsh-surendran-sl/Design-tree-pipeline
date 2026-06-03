import fs from 'fs'
import path from 'path'

import { enhanceReconstructionTree } from './reconstructionEnhance.js'
import { promoteTextRasters } from './textRasterPromote.js'
import { refineProductBboxWithVision, ensureProductBBoxFidelity } from './productBboxRefine.js'
import { refineProductBboxFromSegmentation } from './segmentation.js'
import { scoreReconstruction, RECONSTRUCTION_SCORE_RETRY } from './reconstructionScore.js'
import { layoutFinePass, compareAndPatchTargeted } from './llmAgents.js'
import { exportLayersReference } from './layerExport.js'
import { fixReconstructionLayout } from './reconstructionLayout.js'
import { normalizeTreeStrategies } from './capabilities.js'
import { classifyAdLayout } from './layoutArchetype.js'
import { syncPriceBannerLayout } from './priceBannerLayout.js'
import {
  isFlatBackground,
  applyLayerRenderFallback,
  applyPerLayerCropFallback,
  buildHighFidelityTree,
} from './hybridFallback.js'
import { lockFrameToSource } from './frameLock.js'
import { getImageDimensions } from './assets.js'

/**
 * Full pre-embed enhancement pipeline for Image → Tree.
 */
export async function runReconstructionEnhancements(tree, imagePath, llm, options = {}) {
  const {
    highAccuracy = true,
    jobDir = null,
    publicBaseUrl = null,
    jobId = null,
    layoutMeta = null,
  } = options

  let layout = layoutMeta
  if (!layout) layout = classifyAdLayout(tree)

  const layoutOpts = { layoutPreserving: layout.layoutPreserving !== false }

  let t = enhanceReconstructionTree(tree, layoutOpts)
  t = fixReconstructionLayout(t, layoutOpts)

  if (highAccuracy && imagePath) {
    t = await promoteTextRasters(t, imagePath, llm, { useVision: true, layoutMeta: layout })
    t = fixReconstructionLayout(t, layoutOpts)
  }

  if (highAccuracy) {
    t = await refineProductBboxFromSegmentation(imagePath, t, {
      tryMcp: Boolean(publicBaseUrl && jobId),
      jobDir,
      publicBaseUrl,
      jobId,
    })
    t = await refineProductBboxWithVision(imagePath, t, llm)
    t = await ensureProductBBoxFidelity(t, imagePath)
  }

  if (imagePath) {
    t = await syncPriceBannerLayout(t, imagePath, layout)
    const flat = await isFlatBackground(imagePath)
    t = applyLayerRenderFallback(t, { flatBackground: flat })
  }

  t = fixReconstructionLayout(t, layoutOpts)
  t = normalizeTreeStrategies(t)
  t._layoutMeta = layout
  return t
}

export async function runPostRenderQualityPass({
  originalPath,
  renderedPath,
  tree,
  llm,
  compareDir,
  highAccuracy = true,
  layoutMeta = null,
}) {
  let updated = tree
  const scores = []
  const layout = layoutMeta || updated._layoutMeta || classifyAdLayout(updated)
  const layoutOpts = { layoutPreserving: layout.layoutPreserving !== false }

  if (!highAccuracy) return { tree: updated, scores }

  try {
    const score = await scoreReconstruction(originalPath, renderedPath, updated)
    scores.push(score)

    if (score.needsRetry) {
      const targeted = await compareAndPatchTargeted(originalPath, renderedPath, updated, llm, {
        compareDir,
        focus: layout.compareFocus,
      })
      if (targeted.length) {
        const { applyPatchesSafe } = await import('./patchUtils.js')
        updated = applyPatchesSafe(updated, targeted)
        updated = fixReconstructionLayout(updated, layoutOpts)
        updated = enhanceReconstructionTree(updated, {
          skipBackgroundPresets: true,
          skipReambiguous: true,
          ...layoutOpts,
        })
      }
    }

    const layerFallback = await applyPerLayerCropFallback(originalPath, renderedPath, updated)
    if (layerFallback.changed) {
      updated = layerFallback.tree
    }

    const fine = await layoutFinePass(originalPath, renderedPath, updated, llm, compareDir)
    if (fine.length) {
      const { applyPatchesSafe } = await import('./patchUtils.js')
      updated = applyPatchesSafe(updated, fine)
      updated = fixReconstructionLayout(updated, layoutOpts)
    }

    const scoreAfter = await scoreReconstruction(originalPath, renderedPath, updated)
    scores.push({ ...scoreAfter, label: 'after_patches' })

    if (scoreAfter.needsRetry && scoreAfter.similarity < RECONSTRUCTION_SCORE_RETRY - 0.05) {
      const flat = await isFlatBackground(originalPath)
      updated = buildHighFidelityTree(updated, { flatBackground: flat })
      scores.push({ label: 'high_fidelity_fallback', applied: true })
    }
  } catch (e) {
    console.warn('Post-render quality pass failed:', e?.message || e)
  }

  updated._layoutMeta = layout
  return { tree: updated, scores }
}

export async function prepareTreeWithLayout(tree, imagePath, llm, options = {}) {
  const [srcW, srcH] = await getImageDimensions(imagePath)
  let t = lockFrameToSource(tree, srcW, srcH)
  const layoutMeta = classifyAdLayout(t)
  t = await runReconstructionEnhancements(t, imagePath, llm, { ...options, layoutMeta })
  return t
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

  if (tree._layoutMeta) {
    fs.writeFileSync(path.join(out, 'layout_archetype.json'), JSON.stringify(tree._layoutMeta, null, 2), 'utf8')
  }
}

export { scoreReconstruction, RECONSTRUCTION_SCORE_RETRY, exportLayersReference, classifyAdLayout }
