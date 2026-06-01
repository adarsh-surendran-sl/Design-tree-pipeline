import fs from 'fs'
import path from 'path'

import { analyzeProduct } from './agents/productAnalysisAgent.js'
import {
  createDesignConcepts,
  DEFAULT_GENERATE_COUNT,
  DEFAULT_OUTPUT_COUNT,
} from './agents/designCreatorAgent.js'
import { generateDesignStrategy } from './agents/designStrategyAgent.js'
import { polishAdDesign } from './agents/polishAdDesign.js'
import { scoreDesignCandidates, pickTopDesigns } from './agents/scoreDesigns.js'
import { formatAnalysisSummary, formatDesignStrategySummary, markdownToHtml } from './agents/summaries.js'
import { appendChatMessage } from './jobState.js'
import { renderToFilesBrowser } from './renderDispatch.js'
import { sanitizeTreeComposition } from './composition.js'
import { fixDesignTreeLayout } from './layoutFix.js'
import { removeBackgroundToFile } from './backgroundRemoval.js'
import { trimTransparentPng } from './productAsset.js'
import { resolveFrameFormat, safeMarginForFrame } from './frameFormats.js'
import { ensureBriefRatingNode } from './briefRating.js'
import { polishDesignQuality, validateLayoutQuality } from './layoutQuality.js'
import {
  PIPELINE_STEPS,
  findLogoPath,
  findProductImagePath,
  findReferencePath,
  inferCompletedSteps,
  initPipelineState,
  loadPipelineConfig,
  loadPipelineState,
  markPipelineAborted,
  markPipelineComplete,
  markPipelineFailed,
  markStepComplete,
  markStepRunning,
  resolveResumeStep,
  savePipelineConfig,
} from './pipelineState.js'

const PRODUCT_ASSET = 'assets/product.png'
const LOGO_ASSET = 'assets/logo.png'

function wireUserAssets(tree, { hasLogo }) {
  const updated = JSON.parse(JSON.stringify(tree))
  for (const node of updated.children || []) {
    if (node.role === 'product' || node.id === 'product') {
      node.type = 'image'
      node.renderStrategy = 'crop'
      node.src = PRODUCT_ASSET
      node.contentSource = 'user'
      node.objectFit = 'contain'
    }
    if (hasLogo && (node.role === 'logo' || node.id === 'logo')) {
      node.type = 'logo'
      node.renderStrategy = 'crop'
      node.src = LOGO_ASSET
      node.contentSource = 'user'
    }
  }

  const hasProduct = (updated.children || []).some((n) => n.role === 'product' || n.id === 'product')
  if (!hasProduct) {
    const fw = updated.width ?? 1080
    const fh = updated.height ?? 1080
    updated.children = updated.children || []
    updated.children.push({
      id: 'product',
      type: 'image',
      role: 'product',
      renderStrategy: 'crop',
      src: PRODUCT_ASSET,
      contentSource: 'user',
      x: Math.round(fw * 0.2),
      y: Math.round(fh * 0.25),
      width: Math.round(fw * 0.6),
      height: Math.round(fh * 0.5),
      zIndex: 10,
      objectFit: 'contain',
    })
  }
  return updated
}

function copyAsset(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
}

function emitReport(onProgress, agent, summaryMarkdown, phase) {
  onProgress?.(`${agent} report ready`, phase, {
    event: 'agent_report',
    agent,
    summary: summaryMarkdown,
    summaryHtml: markdownToHtml(summaryMarkdown),
  })
}

function loadJsonFile(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function stepShouldRun(step, startFrom, completed, forceSteps) {
  const startIdx = PIPELINE_STEPS.indexOf(startFrom)
  const stepIdx = PIPELINE_STEPS.indexOf(step)
  if (stepIdx < startIdx) return false
  if (forceSteps.has(step)) return true
  return !completed.has(step)
}

async function renderDesignCandidate({
  d,
  jobDir,
  assetsDir,
  hasLogo,
  frame,
  brief,
  productImagePath,
  layoutPolish,
  polishLoops,
  highQuality,
  llm,
  onProgress,
}) {
  const designDir = path.join(jobDir, 'designs', d.id)
  fs.mkdirSync(designDir, { recursive: true })

  let tree = wireUserAssets(d.designTree, { hasLogo })
  tree = sanitizeTreeComposition(tree)
  tree = polishDesignQuality(tree, brief)
  tree = fixDesignTreeLayout(tree, { safeMargin: safeMarginForFrame(frame.width, frame.height) })
  tree = polishDesignQuality(tree, brief)
  tree = ensureBriefRatingNode(tree, brief)

  const layoutQ = validateLayoutQuality(tree)
  if (layoutQ.issues.length) {
    onProgress?.(`Layout QA: ${layoutQ.issues.slice(0, 3).join(', ')}…`, 'render', { designId: d.id })
  }

  const margin = safeMarginForFrame(frame.width, frame.height)

  for (let loop = 0; layoutPolish && loop < polishLoops; loop += 1) {
    fs.writeFileSync(path.join(designDir, 'design_tree.json'), JSON.stringify(tree, null, 2))
    const { png } = await renderToFilesBrowser(tree, designDir, 'preview', assetsDir)
    onProgress?.(`Polish pass ${loop + 1}/${polishLoops}: ${d.name}…`, 'render', { designId: d.id })

    try {
      const polishResult = await polishAdDesign({
        renderedPath: png,
        tree,
        productImagePath,
        brief,
        designDir,
        llm,
        highAccuracy: highQuality,
      })
      if (polishResult.warning) {
        onProgress?.(`Polish skipped: ${polishResult.warning}`, 'render', { designId: d.id })
      }
      tree = fixDesignTreeLayout(polishResult.tree, { safeMargin: margin })
      tree = polishDesignQuality(tree, brief)
    } catch (e) {
      onProgress?.(`Polish failed (continuing): ${e.message}`, 'render', { designId: d.id })
    }
  }

  fs.writeFileSync(path.join(designDir, 'design_tree.json'), JSON.stringify(tree, null, 2))
  const { png } = await renderToFilesBrowser(tree, designDir, 'preview', assetsDir)

  return {
    id: d.id,
    name: d.name,
    concept: d.concept,
    rationale: d.rationale,
    messagingAngle: d.messagingAngle,
    expectedPerformance: d.expectedPerformance,
    tree,
    previewPath: png,
    previewPng: path.basename(png),
    treeUrl: `designs/${d.id}/design_tree.json`,
    previewUrl: `designs/${d.id}/preview.png`,
  }
}

function isDesignRendered(jobDir, designId) {
  const preview = path.join(jobDir, 'designs', designId, 'preview.png')
  const tree = path.join(jobDir, 'designs', designId, 'design_tree.json')
  return fs.existsSync(preview) && fs.existsSync(tree)
}

/** Load brief + paths from an existing job directory (for resume). */
export function loadJobPipelineContext(jobDir) {
  jobDir = path.resolve(jobDir)
  const brief = loadJsonFile(path.join(jobDir, 'brief.json'))
  if (!brief?.title) throw new Error('Job brief.json missing or invalid — cannot resume.')

  const config = loadPipelineConfig(jobDir)
  const frame = loadJsonFile(path.join(jobDir, 'frame.json')) || resolveFrameFormat(brief.frameFormat)
  const productImagePath = findProductImagePath(jobDir)
  if (!productImagePath) throw new Error('Product image not found in job — cannot resume.')

  return {
    jobDir,
    jobId: config.jobId || path.basename(jobDir),
    publicBaseUrl: config.publicBaseUrl,
    brief,
    frame,
    productImagePath,
    productSourceUrl: config.productSourceUrl || null,
    referenceImagePath: findReferencePath(jobDir),
    logoPath: findLogoPath(jobDir),
    logoSourceUrl: config.logoSourceUrl || null,
    removeBackground: config.removeBackground === true,
    layoutPolish: config.layoutPolish !== false,
    polishLoops: config.polishLoops ?? 1,
    highQuality: config.highQuality !== false,
    generateCount: config.generateCount ?? DEFAULT_GENERATE_COUNT,
    outputCount: config.outputCount ?? DEFAULT_OUTPUT_COUNT,
    analysis: loadJsonFile(path.join(jobDir, 'product_analysis.json')),
    designStrategy: loadJsonFile(path.join(jobDir, 'design_strategy.json')),
  }
}

/**
 * Full agentic ad template pipeline with checkpoints — supports resume from any step.
 */
export async function runAdTemplatePipeline({
  jobDir,
  jobId,
  publicBaseUrl,
  brief,
  productImagePath,
  productSourceUrl = null,
  referenceImagePath,
  logoPath,
  logoSourceUrl = null,
  removeBackground = false,
  layoutPolish = true,
  polishLoops = 1,
  highQuality = true,
  generateCount = DEFAULT_GENERATE_COUNT,
  outputCount = DEFAULT_OUTPUT_COUNT,
  llm,
  onProgress,
  startFrom = 'prep',
  forceSteps = [],
}) {
  jobDir = path.resolve(jobDir)
  const forceSet = new Set(Array.isArray(forceSteps) ? forceSteps : forceSteps ? [forceSteps] : [])
  const state = loadPipelineState(jobDir) || initPipelineState(jobDir, { jobId })
  if (state.status === 'aborted') {
    throw new Error('Pipeline was stopped. Ask the orchestrator to resume or start a new job.')
  }

  const completed = new Set([...inferCompletedSteps(jobDir), ...(state.completedSteps || [])])
  const frame = resolveFrameFormat(brief.frameFormat)
  brief.frameFormat = frame.id

  const assetsDir = path.join(jobDir, 'assets')
  fs.mkdirSync(assetsDir, { recursive: true })

  savePipelineConfig(jobDir, {
    jobId: jobId || path.basename(jobDir),
    publicBaseUrl,
    removeBackground,
    layoutPolish,
    polishLoops,
    highQuality,
    generateCount,
    outputCount,
    productSourceUrl,
    logoSourceUrl,
  })

  const ctx = {
    jobDir,
    jobId,
    publicBaseUrl,
    brief,
    frame,
    assetsDir,
    productImagePath,
    productSourceUrl,
    referenceImagePath,
    logoPath,
    logoSourceUrl,
    removeBackground,
    layoutPolish,
    polishLoops,
    highQuality,
    generateCount,
    outputCount,
    llm,
    onProgress,
    analysis: null,
    designStrategy: null,
    designs: null,
  }

  const runStep = async (step, fn) => {
    if (!stepShouldRun(step, startFrom, completed, forceSet)) {
      onProgress?.(`Skipping ${step} (already complete)`, step === 'prep' ? 'prep' : step === 'finalize' ? 'done' : step, {
        event: 'step_skipped',
        step,
      })
      return
    }
    markStepRunning(jobDir, step)
    try {
      await fn(ctx)
      markStepComplete(jobDir, step)
      completed.add(step)
    } catch (e) {
      markPipelineFailed(jobDir, step, e)
      onProgress?.(`Step failed: ${step} — ${e.message}`, step, { event: 'step_failed', step, error: e.message })
      throw e
    }
  }

  await runStep('prep', async (c) => {
    const productAssetPath = path.join(c.assetsDir, 'product.png')
    const logoAssetPath = path.join(c.assetsDir, 'logo.png')
    const trimmedPath = path.join(c.assetsDir, 'product_trimmed.png')
    const bgOpts = { publicBaseUrl: c.publicBaseUrl, jobId: c.jobId, crop: true }

    if (c.removeBackground) {
      onProgress?.('Removing product background (Shopalyst MCP)…', 'prep')
      try {
        await removeBackgroundToFile(c.productImagePath, productAssetPath, {
          ...bgOpts,
          sourceUrl: c.productSourceUrl,
        })
        c.productImagePath = productAssetPath
        onProgress?.('Product background removed.', 'prep', { event: 'bg_removed', asset: 'product' })
      } catch (e) {
        onProgress?.(`Background removal failed: ${e.message}. Using original product image.`, 'prep')
        copyAsset(c.productImagePath, productAssetPath)
        c.productImagePath = productAssetPath
      }

      if (c.logoPath && fs.existsSync(c.logoPath)) {
        onProgress?.('Removing logo background (Shopalyst MCP)…', 'prep')
        try {
          await removeBackgroundToFile(c.logoPath, logoAssetPath, {
            ...bgOpts,
            sourceUrl: c.logoSourceUrl,
          })
          c.logoPath = logoAssetPath
          onProgress?.('Logo background removed.', 'prep', { event: 'bg_removed', asset: 'logo' })
        } catch (e) {
          onProgress?.(`Logo background removal failed: ${e.message}. Using original logo.`, 'prep')
          copyAsset(c.logoPath, logoAssetPath)
          c.logoPath = logoAssetPath
        }
      }
    } else {
      copyAsset(c.productImagePath, productAssetPath)
      c.productImagePath = productAssetPath
      if (c.logoPath && fs.existsSync(c.logoPath)) {
        copyAsset(c.logoPath, logoAssetPath)
        c.logoPath = logoAssetPath
      }
    }

    onProgress?.('Optimizing product asset (trim transparent padding)…', 'prep')
    try {
      const trimmed = await trimTransparentPng(c.productImagePath, trimmedPath)
      if (trimmed) {
        copyAsset(trimmedPath, productAssetPath)
        c.productImagePath = productAssetPath
      }
    } catch {
      /* keep original */
    }

    if (c.referenceImagePath && fs.existsSync(c.referenceImagePath)) {
      copyAsset(c.referenceImagePath, path.join(c.jobDir, 'reference.png'))
    }

    fs.writeFileSync(path.join(c.jobDir, 'brief.json'), JSON.stringify(c.brief, null, 2))
    fs.writeFileSync(path.join(c.jobDir, 'frame.json'), JSON.stringify(c.frame, null, 2))
  })

  await runStep('analysis', async (c) => {
    onProgress?.('Agent 1: Product & market analysis starting…', 'analysis')
    c.analysis = await analyzeProduct({
      brief: c.brief,
      productImagePath: c.productImagePath,
      referenceImagePath: c.referenceImagePath,
      logoPath: c.logoPath,
      llm: c.llm,
      onProgress: (msg) => onProgress?.(msg, 'analysis'),
    })
    fs.writeFileSync(path.join(c.jobDir, 'product_analysis.json'), JSON.stringify(c.analysis, null, 2))

    const analysisSummary = formatAnalysisSummary(c.analysis)
    fs.writeFileSync(path.join(c.jobDir, 'analysis_summary.md'), analysisSummary, 'utf8')
    emitReport(onProgress, 'product_analyst', analysisSummary, 'analysis')

    appendChatMessage(c.jobDir, {
      role: 'system',
      agent: 'product_analyst',
      content: `**Product Analyst** finished.\n\n${analysisSummary}`,
    })

    onProgress?.('Product analysis complete.', 'analysis', { phase: 'done' })
  })

  if (!ctx.analysis) {
    ctx.analysis = loadJsonFile(path.join(jobDir, 'product_analysis.json'))
  }

  await runStep('strategy', async (c) => {
    onProgress?.('Design Strategist planning creative approach…', 'design')
    c.designStrategy = await generateDesignStrategy({ brief: c.brief, analysis: c.analysis, llm: c.llm })
    fs.writeFileSync(path.join(c.jobDir, 'design_strategy.json'), JSON.stringify(c.designStrategy, null, 2))

    emitReport(onProgress, 'design_strategist', c.designStrategy.summary, 'design')

    appendChatMessage(c.jobDir, {
      role: 'system',
      agent: 'design_strategist',
      content: `**Design Strategist** plan:\n\n${c.designStrategy.summary}`,
    })
  })

  if (!ctx.designStrategy) {
    ctx.designStrategy = loadJsonFile(path.join(jobDir, 'design_strategy.json'))
  }

  const genCount = Math.min(Math.max(Number(ctx.generateCount) || DEFAULT_GENERATE_COUNT, 4), 8)
  const outCount = Math.min(Math.max(Number(ctx.outputCount) || DEFAULT_OUTPUT_COUNT, 1), genCount)

  await runStep('design', async (c) => {
    onProgress?.(`Building ${genCount} design trees (${c.frame.label})…`, 'design')
    c.designs = await createDesignConcepts({
      brief: c.brief,
      analysis: c.analysis,
      designStrategy: c.designStrategy,
      productImagePath: c.productImagePath,
      referenceImagePath: c.referenceImagePath,
      logoPath: c.logoPath,
      llm: c.llm,
      frameFormat: c.frame,
      generateCount: genCount,
      twoPass: c.brief.twoPass !== false,
      onProgress: (msg) => onProgress?.(msg, 'design'),
    })

    fs.writeFileSync(
      path.join(c.jobDir, 'generated_designs.json'),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          count: c.designs.length,
          designs: c.designs.map((d) => ({
            id: d.id,
            name: d.name,
            concept: d.concept,
            rationale: d.rationale,
            messagingAngle: d.messagingAngle,
            expectedPerformance: d.expectedPerformance,
            designTree: d.designTree,
          })),
        },
        null,
        2,
      ),
    )

    const strategySummary = formatDesignStrategySummary(c.designStrategy, c.designs)
    emitReport(onProgress, 'design_strategist', strategySummary, 'design')
  })

  if (!ctx.designs) {
    const saved = loadJsonFile(path.join(jobDir, 'generated_designs.json'))
    ctx.designs = (saved?.designs || []).map((d) => ({
      ...d,
      designTree: d.designTree,
    }))
  }

  if (!ctx.designs?.length) {
    throw new Error('No design trees available — rerun the design step.')
  }

  const hasLogo = Boolean(ctx.logoPath && fs.existsSync(ctx.logoPath))
  const loops = ctx.layoutPolish ? Math.min(Math.max(Number(ctx.polishLoops) || 1, 1), 2) : 0
  const candidates = []

  await runStep('render', async (c) => {
    for (let i = 0; i < c.designs.length; i += 1) {
      const d = c.designs[i]
      if (isDesignRendered(c.jobDir, d.id) && !forceSet.has('render')) {
        onProgress?.(`Skipping render for ${d.id} (already rendered)`, 'render', { designId: d.id })
        const tree = loadJsonFile(path.join(c.jobDir, 'designs', d.id, 'design_tree.json'))
        candidates.push({
          id: d.id,
          name: d.name,
          concept: d.concept,
          rationale: d.rationale,
          messagingAngle: d.messagingAngle,
          expectedPerformance: d.expectedPerformance,
          tree,
          previewPng: 'preview.png',
          treeUrl: `designs/${d.id}/design_tree.json`,
          previewUrl: `designs/${d.id}/preview.png`,
          layoutQualityScore: validateLayoutQuality(tree).score,
        })
        continue
      }

      onProgress?.(`Rendering candidate ${i + 1}/${c.designs.length}: ${d.name}…`, 'render', { index: i })

      const rendered = await renderDesignCandidate({
        d,
        jobDir: c.jobDir,
        assetsDir: c.assetsDir,
        hasLogo,
        frame: c.frame,
        brief: c.brief,
        productImagePath: c.productImagePath,
        layoutPolish: loops > 0,
        polishLoops: loops,
        highQuality: c.highQuality,
        llm: c.llm,
        onProgress,
      })
      const layoutQ = validateLayoutQuality(rendered.tree)
      candidates.push({ ...rendered, layoutQualityScore: layoutQ.score })
    }

    onProgress?.(`Scoring ${candidates.length} designs to pick top ${outCount}…`, 'render')
    let ranked = candidates
    try {
      ranked = await scoreDesignCandidates({
        candidates,
        productImagePath: c.productImagePath,
        brief: c.brief,
        llm: c.llm,
      })
      fs.writeFileSync(
        path.join(c.jobDir, 'design_scores.json'),
        JSON.stringify(
          ranked.map((r) => ({ id: r.id, score: r.score, scoreDetails: r.scoreDetails })),
          null,
          2,
        ),
      )
    } catch (e) {
      onProgress?.(`Design scoring skipped: ${e.message}. Using generation order.`, 'render')
    }

    c.ranked = ranked
    c.outCount = outCount
    c.genCount = genCount
  })

  async function loadRenderedCandidates(c) {
    const list = []
    for (const d of c.designs) {
      const treePath = path.join(c.jobDir, 'designs', d.id, 'design_tree.json')
      if (!fs.existsSync(treePath)) continue
      const tree = loadJsonFile(treePath)
      list.push({
        id: d.id,
        name: d.name,
        concept: d.concept,
        rationale: d.rationale,
        messagingAngle: d.messagingAngle,
        expectedPerformance: d.expectedPerformance,
        tree,
        previewPng: 'preview.png',
        treeUrl: `designs/${d.id}/design_tree.json`,
        previewUrl: `designs/${d.id}/preview.png`,
        layoutQualityScore: validateLayoutQuality(tree).score,
      })
    }
    return list
  }

  let results = []
  await runStep('finalize', async (c) => {
    let ranked = c.ranked
    if (!ranked?.length) {
      ranked = await loadRenderedCandidates(c)
      if (ranked.length) {
        try {
          ranked = await scoreDesignCandidates({
            candidates: ranked,
            productImagePath: c.productImagePath,
            brief: c.brief,
            llm: c.llm,
          })
        } catch {
          /* keep unraked */
        }
      }
    }
    const top = pickTopDesigns(ranked, c.outCount ?? outCount)
    results = top.map((d, i) => ({
      id: `design_${i + 1}`,
      sourceId: d.id,
      name: d.name,
      concept: d.concept,
      rationale: d.rationale,
      messagingAngle: d.messagingAngle,
      expectedPerformance: d.expectedPerformance,
      score: d.score,
      tree: d.tree,
      previewPng: d.previewPng,
      treeUrl: d.treeUrl,
      previewUrl: d.previewUrl,
      frameFormat: c.frame.id,
      frameWidth: c.frame.width,
      frameHeight: c.frame.height,
    }))

    const payload = {
      analysis: c.analysis,
      designStrategy: c.designStrategy,
      frame: c.frame,
      generatedCount: c.genCount ?? genCount,
      outputCount: c.outCount ?? outCount,
      designs: results.map(({ tree, ...rest }) => rest),
      trees: results.map((r) => ({ id: r.id, tree: r.tree })),
    }
    fs.writeFileSync(path.join(c.jobDir, 'result.json'), JSON.stringify(payload, null, 2))

    appendChatMessage(c.jobDir, {
      role: 'system',
      agent: 'orchestrator',
      content:
        `**Top ${c.outCount ?? outCount} designs are ready** (scored from ${c.genCount ?? genCount} concepts, ${c.frame.id}). ` +
        'Ask me to adjust any design — e.g. "Make design_1 CTA green" or "Change headline on design_2".',
    })

    onProgress?.(`Top ${c.outCount ?? outCount} designs ready.`, 'done', { frame: c.frame.id })
  })

  markPipelineComplete(jobDir)

  const analysisSummary = formatAnalysisSummary(ctx.analysis)
  const strategySummary = formatDesignStrategySummary(ctx.designStrategy, ctx.designs)

  return {
    analysis: ctx.analysis,
    analysisSummary,
    designStrategy: ctx.designStrategy,
    designStrategySummary: strategySummary,
    frame: ctx.frame,
    designs: results,
  }
}

/** Resume pipeline from failed or incomplete step. */
export async function resumeAdTemplatePipeline({
  jobDir,
  fromStep = null,
  forceSteps = [],
  llm,
  onProgress,
}) {
  const ctx = loadJobPipelineContext(jobDir)
  const startFrom = resolveResumeStep(jobDir, { fromStep, forceSteps })

  const state = loadPipelineState(jobDir)
  if (state?.status === 'aborted') {
    initPipelineState(jobDir, { jobId: ctx.jobId })
  }

  onProgress?.(`Resuming pipeline from step: ${startFrom}`, 'prep', {
    event: 'resume',
    fromStep: startFrom,
    completedSteps: inferCompletedSteps(jobDir),
  })

  appendChatMessage(jobDir, {
    role: 'system',
    agent: 'orchestrator',
    content: `**Resuming pipeline** from step \`${startFrom}\`…`,
  })

  return runAdTemplatePipeline({
    ...ctx,
    llm,
    onProgress,
    startFrom,
    forceSteps,
  })
}

export function abortAdTemplatePipeline(jobDir, reason) {
  markPipelineAborted(jobDir, reason)
  appendChatMessage(jobDir, {
    role: 'system',
    agent: 'orchestrator',
    content: `**Pipeline stopped.** ${reason || 'Execution halted at your request.'}`,
  })
}
