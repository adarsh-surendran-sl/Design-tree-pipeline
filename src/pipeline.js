import path from 'path'
import fs from 'fs'

import { embedRasterAssets, getImageDimensions } from './assets.js'
import { imageToTree, compareAndPatch } from './llmAgents.js'
import { applyPatchesSafe } from './patchUtils.js'
import { normalizeTreeStrategies } from './capabilities.js'
import { sanitizeTreeComposition, describeElements } from './composition.js'
import {
  describeRenderAmbiguities,
  resolveAmbiguitiesWithDefaults,
  applyRenderChoices,
} from './renderAmbiguity.js'
import { fixReconstructionLayout } from './reconstructionLayout.js'
import { applyUserOverrides } from './overrides.js'
import { renderToFilesBrowser } from './renderDispatch.js'
import {
  runPostRenderQualityPass,
  saveReconstructionArtifacts,
  scoreReconstruction,
  prepareTreeWithLayout,
  classifyAdLayout,
} from './reconstructionOrchestrator.js'
import { enhanceReconstructionTree } from './reconstructionEnhance.js'
import { lockFrameToSource } from './frameLock.js'

export const DEFAULT_MAX_LOOPS = 10
export const MAX_LOOPS_CAP = 100
export const MIN_LOOPS_BEFORE_EARLY_STOP = 3

function getJobContext(outputDir) {
  const out = path.resolve(outputDir)
  const jobId = path.basename(out)
  const publicBaseUrl = String(process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '') || null
  return { out, jobId, publicBaseUrl }
}

async function prepareTree(tree, imagePath, llm, options) {
  return prepareTreeWithLayout(tree, imagePath, llm, options)
}

function layoutOpts(tree) {
  const meta = tree._layoutMeta || classifyAdLayout(tree)
  return { layoutPreserving: meta.layoutPreserving !== false }
}

function enhanceAfterPatch(tree) {
  tree = normalizeTreeStrategies(tree)
  const opts = { skipBackgroundPresets: true, skipReambiguous: true, ...layoutOpts(tree) }
  tree = enhanceReconstructionTree(tree, opts)
  tree = fixReconstructionLayout(tree, layoutOpts(tree))
  return tree
}

/** Build tree + crops only (no compare loop). For UI element editing. */
export async function runAnalyze({
  imagePath,
  outputDir,
  highAccuracy = true,
  onProgress = null,
  llm = null,
} = {}) {
  const img = path.resolve(String(imagePath))
  if (!fs.existsSync(img)) throw new Error(`Image not found: ${img}`)

  const out = path.resolve(outputDir || path.join(process.cwd(), 'runs', path.parse(img).name))
  fs.mkdirSync(out, { recursive: true })
  const assetsDir = path.join(out, 'assets')
  const ctx = getJobContext(out)

  const progress = (msg) => {
    if (typeof onProgress === 'function') onProgress(msg, 0, 1)
  }

  progress('Analyzing layers (product, text, logo, badge…)…')
  const [srcW, srcH] = await getImageDimensions(img)
  const layoutGuess = classifyAdLayout({ type: 'frame', width: srcW, height: srcH, children: [] })
  let layoutMeta = layoutGuess
  let tree = await imageToTree(img, llm, {
    runVisionAudit: highAccuracy,
    twoStage: highAccuracy,
    layoutMeta: layoutGuess,
  })

  progress('Enhancing layout, typography, backgrounds…')
  tree = lockFrameToSource(tree, srcW, srcH)
  layoutMeta = classifyAdLayout(tree)
  tree = await prepareTree(tree, img, llm, { highAccuracy, ...ctx, jobDir: out, layoutMeta })
  tree = sanitizeTreeComposition(tree)

  const choicesPath = path.join(out, 'design_tree_with_choices.json')
  fs.writeFileSync(choicesPath, JSON.stringify(tree, null, 2), 'utf8')
  const renderAmbiguities = describeRenderAmbiguities(tree)
  if (renderAmbiguities.length) {
    tree = resolveAmbiguitiesWithDefaults(tree)
    tree = normalizeTreeStrategies(tree)
    tree = fixReconstructionLayout(tree, layoutOpts(tree))
    tree = enhanceReconstructionTree(tree, { skipReambiguous: true, ...layoutOpts(tree) })
  }

  progress('Embedding crops from original (per region, not full ad)…')
  tree = await embedRasterAssets(tree, img, assetsDir)

  const treePath = path.join(out, 'design_tree_final.json')
  fs.writeFileSync(treePath, JSON.stringify(tree, null, 2), 'utf8')

  progress('Rendering preview…')
  const { png, html } = await renderToFilesBrowser(tree, out, 'preview', assetsDir)

  let reconstructionScores = []
  try {
    const score = await scoreReconstruction(img, png, tree)
    reconstructionScores = [score]
    if (highAccuracy) {
      const quality = await runPostRenderQualityPass({
        originalPath: img,
        renderedPath: png,
        tree,
        llm,
        compareDir: out,
        highAccuracy,
        layoutMeta: tree._layoutMeta,
      })
      tree = quality.tree
      reconstructionScores = quality.scores
      tree = await embedRasterAssets(tree, img, assetsDir)
      fs.writeFileSync(treePath, JSON.stringify(tree, null, 2), 'utf8')
      const rerender = await renderToFilesBrowser(tree, out, 'preview', assetsDir)
      reconstructionScores.push(await scoreReconstruction(img, rerender.png, tree))
    }
  } catch (e) {
    console.warn('Analyze quality pass:', e?.message || e)
  }

  saveReconstructionArtifacts(out, tree, reconstructionScores)

  return {
    original_image: img,
    output_dir: out,
    final_tree: tree,
    final_tree_path: treePath,
    elements: describeElements(tree),
    renderAmbiguities,
    reconstructionScores,
    preview_png: png,
    preview_html: html,
    layersExportUrl: `/runs/${ctx.jobId}/layers_reference.json`,
  }
}

/** Apply CSS vs crop choices and re-embed + render (no LLM). */
export async function resolveRenderChoicesAndRender({
  jobDir,
  tree = null,
  renderChoices = {},
  overrides = {},
  originalImagePath = null,
} = {}) {
  const out = path.resolve(jobDir)
  let base = tree
  if (!base) {
    const choicesPath = path.join(out, 'design_tree_with_choices.json')
    const finalPath = path.join(out, 'design_tree_final.json')
    const loadPath = fs.existsSync(choicesPath) ? choicesPath : finalPath
    if (!fs.existsSync(loadPath)) throw new Error('Job tree not found')
    base = JSON.parse(fs.readFileSync(loadPath, 'utf8'))
  }
  let updated = applyRenderChoices(base, renderChoices)
  const choicesPath = path.join(out, 'design_tree_with_choices.json')
  fs.writeFileSync(choicesPath, JSON.stringify(updated, null, 2), 'utf8')

  const appliedPath = path.join(out, 'render_choices_applied.json')
  fs.writeFileSync(appliedPath, JSON.stringify(renderChoices, null, 2), 'utf8')

  updated = normalizeTreeStrategies(updated)
  updated = enhanceReconstructionTree(updated, { skipReambiguous: true, respectRenderChoices: true, ...layoutOpts(updated) })
  updated = fixReconstructionLayout(updated, layoutOpts(updated))
  updated = applyUserOverrides(updated, overrides)
  updated = sanitizeTreeComposition(updated)

  const assetsDir = path.join(out, 'assets')
  fs.mkdirSync(assetsDir, { recursive: true })

  let originalPath = originalImagePath
  if (!originalPath) {
    const origFile = fs.readdirSync(out).find((f) => f.startsWith('original.'))
    if (origFile) originalPath = path.join(out, origFile)
  }

  if (originalPath && fs.existsSync(originalPath)) {
    updated = await embedRasterAssets(updated, originalPath, assetsDir)
  }

  const treePath = path.join(out, 'design_tree_final.json')
  fs.writeFileSync(treePath, JSON.stringify(updated, null, 2), 'utf8')

  const { png, html } = await renderToFilesBrowser(updated, out, 'preview', assetsDir)
  saveReconstructionArtifacts(out, updated)
  return {
    final_tree: updated,
    final_tree_path: treePath,
    elements: describeElements(updated),
    renderAmbiguities: describeRenderAmbiguities(updated),
    appliedRenderChoices: renderChoices,
    preview_png: png,
    preview_html: html,
  }
}

/** Re-render after user edits text/images in UI (no LLM). */
export async function renderWithOverrides({
  jobDir,
  tree,
  overrides = {},
  originalImagePath = null,
} = {}) {
  const out = path.resolve(jobDir)
  const assetsDir = path.join(out, 'assets')
  fs.mkdirSync(assetsDir, { recursive: true })

  let updated = applyUserOverrides(tree, overrides)
  updated = fixReconstructionLayout(updated, layoutOpts(updated))
  updated = enhanceReconstructionTree(updated, {
    skipBackgroundPresets: true,
    skipReambiguous: true,
    respectRenderChoices: true,
    ...layoutOpts(updated),
  })
  updated = sanitizeTreeComposition(updated)

  let originalPath = originalImagePath
  if (!originalPath) {
    const origFile = fs.readdirSync(out).find((f) => f.startsWith('original.'))
    if (origFile) originalPath = path.join(out, origFile)
  }

  if (originalPath && fs.existsSync(originalPath)) {
    updated = await embedRasterAssets(updated, originalPath, assetsDir)
  }

  const treePath = path.join(out, 'design_tree_final.json')
  fs.writeFileSync(treePath, JSON.stringify(updated, null, 2), 'utf8')

  const { png, html } = await renderToFilesBrowser(updated, out, 'preview', assetsDir)
  saveReconstructionArtifacts(out, updated)
  return {
    final_tree: updated,
    final_tree_path: treePath,
    elements: describeElements(updated),
    preview_png: png,
    preview_html: html,
  }
}

export async function runPipeline({
  imagePath,
  outputDir,
  maxLoops = DEFAULT_MAX_LOOPS,
  highAccuracy = true,
  analyzeOnly = false,
  onProgress = null,
  llm = null,
} = {}) {
  if (analyzeOnly) {
    return runAnalyze({ imagePath, outputDir, highAccuracy, onProgress, llm })
  }
  if (!imagePath) throw new Error('Missing imagePath')
  if (maxLoops < 1) throw new Error('maxLoops must be at least 1')
  if (maxLoops > MAX_LOOPS_CAP) throw new Error(`maxLoops cannot exceed ${MAX_LOOPS_CAP}`)

  const img = path.resolve(String(imagePath))
  if (!fs.existsSync(img)) throw new Error(`Image not found: ${img}`)

  const out = path.resolve(outputDir || path.join(process.cwd(), 'runs', path.parse(img).name))
  fs.mkdirSync(out, { recursive: true })
  const assetsDir = path.join(out, 'assets')
  const ctx = getJobContext(out)
  const reconstructionScores = []

  const progress = (msg, loop = 0) => {
    if (typeof onProgress === 'function') onProgress(msg, loop, maxLoops)
    else console.log(`[loop ${loop}/${maxLoops}] ${msg}`)
  }

  progress('Analyzing image (region plan → tree)…', 0)
  const [srcW, srcH] = await getImageDimensions(img)
  const layoutGuess = classifyAdLayout({ type: 'frame', width: srcW, height: srcH, children: [] })
  let tree = await imageToTree(img, llm, {
    runVisionAudit: highAccuracy,
    twoStage: highAccuracy,
    layoutMeta: layoutGuess,
  })

  progress('Enhancing layout, typography, backgrounds…', 0)
  tree = lockFrameToSource(tree, srcW, srcH)
  const layoutMeta = classifyAdLayout(tree)
  tree = await prepareTree(tree, img, llm, { highAccuracy, ...ctx, jobDir: out, layoutMeta })
  tree = sanitizeTreeComposition(tree)

  const choicesPath = path.join(out, 'design_tree_with_choices.json')
  fs.writeFileSync(choicesPath, JSON.stringify(tree, null, 2), 'utf8')
  const renderAmbiguities = describeRenderAmbiguities(tree)
  if (renderAmbiguities.length) {
    tree = resolveAmbiguitiesWithDefaults(tree)
    tree = normalizeTreeStrategies(tree)
    tree = fixReconstructionLayout(tree, layoutOpts(tree))
    tree = enhanceReconstructionTree(tree, { skipReambiguous: true, ...layoutOpts(tree) })
  }
  tree = await embedRasterAssets(tree, img, assetsDir)

  const iterations = []
  let bootstrap = null
  if (highAccuracy) {
    progress('Bootstrap render + compare…', 0)
    const bootBase = 'render_00'
    const boot = await renderToFilesBrowser(tree, out, bootBase, assetsDir)
    let bootPatches = []
    try {
      const bootScore = await scoreReconstruction(img, boot.png, tree)
      reconstructionScores.push({ phase: 'bootstrap', ...bootScore })

      bootPatches = await compareAndPatch(img, boot.png, tree, llm, { compareDir: out, highAccuracy })
      if (bootPatches.length) {
        tree = applyPatchesSafe(tree, bootPatches)
        tree = enhanceAfterPatch(tree)
        tree = await embedRasterAssets(tree, img, assetsDir)
      } else if (bootScore.needsRetry) {
        const quality = await runPostRenderQualityPass({
          originalPath: img,
          renderedPath: boot.png,
          tree,
          llm,
          compareDir: out,
          highAccuracy,
          layoutMeta: tree._layoutMeta,
        })
        tree = quality.tree
        reconstructionScores.push(...(quality.scores || []).map((s) => ({ phase: 'bootstrap_retry', ...s })))
        tree = await embedRasterAssets(tree, img, assetsDir)
      }
    } catch (e) {
      console.warn('Bootstrap compare failed:', e?.message || e)
    }
    bootstrap = { loop: 0, tree, png_path: boot.png, patches: bootPatches, html_path: boot.html }
  }

  for (let i = 0; i < maxLoops; i += 1) {
    const loop = i + 1
    progress(`Rendering (iteration ${loop})…`, loop)
    tree = await embedRasterAssets(tree, img, assetsDir)
    const basename = `render_${String(loop).padStart(2, '0')}`
    const { png, html } = await renderToFilesBrowser(tree, out, basename, assetsDir)

    progress(`Comparing images (iteration ${loop})…`, loop)
    let patches = []
    try {
      const loopScore = await scoreReconstruction(img, png, tree)
      reconstructionScores.push({ phase: `loop_${loop}`, ...loopScore })

      patches = await compareAndPatch(img, png, tree, llm, { compareDir: out, highAccuracy })

      if (!patches.length && loopScore.needsRetry && highAccuracy) {
        progress(`Low similarity (${loopScore.similarity}) — targeted layout retry…`, loop)
        const quality = await runPostRenderQualityPass({
          originalPath: img,
          renderedPath: png,
          tree,
          llm,
          compareDir: out,
          highAccuracy,
          layoutMeta: tree._layoutMeta,
        })
        tree = quality.tree
        tree = enhanceAfterPatch(tree)
        reconstructionScores.push(...(quality.scores || []).map((s) => ({ phase: `loop_${loop}_retry`, ...s })))
        patches = [{ element: '__quality_retry__' }]
      }
    } catch (e) {
      console.warn(`Compare failed at loop ${loop}:`, e?.message || e)
      patches = []
    }

    iterations.push({ loop, tree: JSON.parse(JSON.stringify(tree)), png_path: png, patches, html_path: html })

    const qualityRetry = patches.some((p) => p.element === '__quality_retry__')
    const realPatches = patches.filter((p) => p.element !== '__quality_retry__')
    if (!realPatches.length && !qualityRetry && loop >= MIN_LOOPS_BEFORE_EARLY_STOP) {
      progress('No patches suggested; stopping early.', loop)
      break
    }
    if (!realPatches.length && !qualityRetry) {
      progress(`No patches (loop ${loop}/${MIN_LOOPS_BEFORE_EARLY_STOP} min)…`, loop)
      continue
    }

    if (qualityRetry) {
      progress('Applied targeted quality fixes; re-rendering next iteration…', loop)
      continue
    }

    progress(`Applying ${realPatches.length} patch(es)…`, loop)
    tree = applyPatchesSafe(tree, realPatches)
    tree = enhanceAfterPatch(tree)
  }

  let finalRender = null
  if (iterations.length && (iterations[iterations.length - 1].patches || []).length) {
    progress('Final polish pass…', maxLoops)
    tree = await embedRasterAssets(tree, img, assetsDir)
    const { png, html } = await renderToFilesBrowser(tree, out, 'render_final', assetsDir)
    let polish = []
    try {
      polish = await compareAndPatch(img, png, tree, llm, { compareDir: out, highAccuracy })
      if (polish.length) {
        tree = applyPatchesSafe(tree, polish)
        tree = enhanceAfterPatch(tree)
        tree = await embedRasterAssets(tree, img, assetsDir)
        const final = await renderToFilesBrowser(tree, out, 'render_final', assetsDir)
        finalRender = { loop: maxLoops + 1, tree, png_path: final.png, patches: polish, html_path: final.html }
        reconstructionScores.push({
          phase: 'final',
          ...(await scoreReconstruction(img, final.png, tree)),
        })
      } else {
        finalRender = { loop: maxLoops + 1, tree, png_path: png, patches: polish, html_path: html }
      }
    } catch (e) {
      console.warn('Final polish failed:', e?.message || e)
      finalRender = { loop: maxLoops + 1, tree, png_path: png, patches: polish, html_path: html }
    }
  }

  const finalTreePath = path.join(out, 'design_tree_final.json')
  fs.writeFileSync(finalTreePath, JSON.stringify(tree, null, 2), 'utf8')
  saveReconstructionArtifacts(out, tree, reconstructionScores)

  return {
    original_image: img,
    output_dir: out,
    bootstrap,
    iterations,
    final_render: finalRender,
    final_tree: tree,
    final_tree_path: finalTreePath,
    elements: describeElements(tree),
    renderAmbiguities,
    reconstructionScores,
    layersExportUrl: `/runs/${ctx.jobId}/layers_reference.json`,
  }
}
