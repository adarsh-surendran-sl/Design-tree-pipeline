#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import express from 'express'
import multer from 'multer'
import { fileURLToPath } from 'url'

import { loadEnv, PROJECT_ROOT } from './src/loadEnv.js'
import {
  runPipeline,
  renderWithOverrides,
  resolveRenderChoicesAndRender,
  DEFAULT_MAX_LOOPS,
  MAX_LOOPS_CAP,
} from './src/pipeline.js'
import { describeElements } from './src/composition.js'
import {
  abortAdTemplatePipeline,
  resumeAdTemplatePipeline,
  runAdTemplatePipeline,
} from './src/adTemplatePipeline.js'
import { loadPipelineState } from './src/pipelineState.js'
import { checkMcpHealth } from './src/mcpClient.js'
import { checkLayoutServiceHealth, isLayoutServiceEnabled } from './src/layoutClient.js'
import { useStructuredOutputs } from './src/llmSchemas.js'
import { multiRegionCompareEnabled } from './src/compareRegions.js'
import { downloadImageFromUrl, isValidImageUrl } from './src/imageSources.js'
import { orchestratorChat, ORCHESTRATOR_WELCOME } from './src/agents/orchestratorAgent.js'
import {
  loadJobState,
  appendChatMessage,
  saveChat,
  getJobDir,
} from './src/jobState.js'
import { applyTemplateToDesign, getTemplatePropsForDesign } from './src/applyTemplateToDesign.js'
import { parseStarRating } from './src/briefRating.js'
import {
  getEditorMeta,
  patchEditorTree,
  confirmEditorTree,
  rerenderEditorTree,
  loadEditorTree,
} from './src/designTreeEditor.js'
import { parseDesignTree } from './src/schemas.js'

loadEnv()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RUNS_DIR = path.join(PROJECT_ROOT, 'runs')
fs.mkdirSync(RUNS_DIR, { recursive: true })

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
})

const adTemplateUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
}).any()

const app = express()
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public')

app.use(express.json())
app.use(express.static(PUBLIC_DIR))
app.use('/runs', express.static(RUNS_DIR))

app.get('/image-to-tree', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'image-to-tree', 'index.html'))
})

app.get('/editor', (_req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'design-tree-editor', 'editor.html'))
})

function safeStem(name) {
  return path
    .parse(name || 'upload')
    .name.replace(/[^a-zA-Z0-9_-]+/g, '_')
    .slice(0, 48)
}

function allRenderSteps(result) {
  const steps = []
  if (result.bootstrap) steps.push(result.bootstrap)
  steps.push(...(result.iterations || []))
  const last = result.iterations?.[result.iterations.length - 1]
  const fr = result.final_render
  if (fr && (!last || fr.png_path !== last.png_path)) steps.push(fr)
  return steps
}

function pngUrl(jobId, filePath) {
  if (!filePath) return null
  const base = path.basename(String(filePath))
  return `/runs/${jobId}/${base}`
}

function serializeResult(jobId, result, maxLoops) {
  const steps = allRenderSteps(result).map((it) => ({
    loop: it.loop,
    label:
      it.loop === 0
        ? 'Bootstrap'
        : it.loop > maxLoops
          ? 'Final polish'
          : `Loop ${it.loop}`,
    pngUrl: pngUrl(jobId, it.png_path),
    patchCount: (it.patches || []).length,
    patches: it.patches || [],
  }))

  const last = result.iterations?.[result.iterations.length - 1]
  const finalPng =
    result.preview_png ||
    result.final_render?.png_path ||
    last?.png_path ||
    result.bootstrap?.png_path

  const finalPngUrl = pngUrl(jobId, finalPng)

  return {
    jobId,
    originalUrl: `/runs/${jobId}/original${path.extname(result.original_image) || '.png'}`,
    finalPngUrl,
    finalTreeUrl: `/runs/${jobId}/design_tree_final.json`,
    steps,
    iterationCount: result.iterations?.length ?? 0,
    elements: result.elements || describeElements(result.final_tree || { children: [] }),
    renderAmbiguities: result.renderAmbiguities || [],
    reconstructionScores: result.reconstructionScores || [],
    layersExportUrl: result.layersExportUrl || `/runs/${jobId}/layers_reference.json`,
  }
}

function writeNdjson(res, obj) {
  res.write(`${JSON.stringify(obj)}\n`)
  if (typeof res.flush === 'function') res.flush()
}

function getPublicBaseUrl() {
  return String(process.env.PUBLIC_BASE_URL || `http://127.0.0.1:${Number(process.env.PORT || 8787)}`).replace(
    /\/$/,
    '',
  )
}

app.get('/api/health', async (_req, res) => {
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY)
  let playwrightOk = false
  try {
    await import('playwright')
    playwrightOk = true
  } catch {
    playwrightOk = false
  }
  const mcpUiTools = await checkMcpHealth()
  const publicBaseUrl = getPublicBaseUrl()
  const layoutEnabled = isLayoutServiceEnabled()
  const layoutService = layoutEnabled ? await checkLayoutServiceHealth() : false
  const structuredOutputs = useStructuredOutputs()
  const multiRegionCompare = multiRegionCompareEnabled(true)
  const bgRemovalReady = Boolean(mcpUiTools && publicBaseUrl)
  const fullPower =
    hasKey &&
    playwrightOk &&
    layoutService &&
    structuredOutputs &&
    multiRegionCompare

  res.json({
    ok: hasKey && playwrightOk,
    fullPower,
    anthropicKey: hasKey,
    playwright: playwrightOk,
    mcpUiTools,
    publicBaseUrl: publicBaseUrl || null,
    bgRemovalReady,
    layoutEnabled,
    layoutService,
    structuredOutputs,
    multiRegionCompare,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    hints: [
      !layoutService && layoutEnabled && 'Start layout sidecar: npm run layout-service',
      !publicBaseUrl && 'Set PUBLIC_BASE_URL (ngrok http 8787) for MCP background removal',
      !mcpUiTools && 'MCP ui-tools unreachable — check network or MCP_UI_TOOLS_URL',
    ].filter(Boolean),
  })
})

app.post('/api/run', upload.single('image'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No image uploaded. Use field name "image".' })
    return
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY in .env.local' })
    return
  }

  const maxLoops = Math.min(
    MAX_LOOPS_CAP,
    Math.max(1, Number(req.body?.maxLoops || DEFAULT_MAX_LOOPS)),
  )
  const highAccuracy = req.body?.highAccuracy !== 'false' && req.body?.highAccuracy !== '0'
  const analyzeOnly = req.body?.analyzeOnly === 'true' || req.body?.analyzeOnly === '1'

  const ext = path.extname(req.file.originalname || '.png').toLowerCase() || '.png'
  const jobId = `${Date.now()}_${safeStem(req.file.originalname)}`
  const outDir = path.join(RUNS_DIR, jobId)
  fs.mkdirSync(outDir, { recursive: true })

  const originalPath = path.join(outDir, `original${ext}`)
  fs.writeFileSync(originalPath, req.file.buffer)

  res.setHeader('Content-Type', 'application/x-ndjson')
  res.setHeader('Cache-Control', 'no-cache')
  res.flushHeaders?.()

  writeNdjson(res, { type: 'start', jobId, maxLoops, highAccuracy, analyzeOnly })

  try {
    const result = await runPipeline({
      imagePath: originalPath,
      outputDir: outDir,
      maxLoops,
      highAccuracy,
      analyzeOnly,
      onProgress: (msg, loop, total) => {
        writeNdjson(res, { type: 'progress', message: msg, loop, total })
        const bootPng = path.join(outDir, 'render_00.png')
        const loopPng = path.join(outDir, `render_${String(loop).padStart(2, '0')}.png`)
        let latest = null
        if (loop === 0 && fs.existsSync(bootPng)) latest = pngUrl(jobId, bootPng)
        else if (loop > 0 && fs.existsSync(loopPng)) latest = pngUrl(jobId, loopPng)
        if (latest) writeNdjson(res, { type: 'render', pngUrl: latest })
      },
    })

    const payload = serializeResult(jobId, result, maxLoops)
    if (!payload.elements?.length) {
      console.warn(`Job ${jobId}: tree has 0 children after pipeline`)
    } else {
      console.log(`Job ${jobId}: ${payload.elements.length} elements`)
    }
    writeNdjson(res, { type: 'done', ...payload })
  } catch (e) {
    writeNdjson(res, { type: 'error', message: e?.message || String(e) })
  } finally {
    res.end()
  }
})

app.get('/api/jobs/:jobId/layers-export', (req, res) => {
  const jobId = req.params.jobId
  const format = String(req.query.format || 'json').toLowerCase()
  const jsonPath = path.join(RUNS_DIR, jobId, 'layers_reference.json')
  const mdPath = path.join(RUNS_DIR, jobId, 'layers_reference.md')
  if (format === 'md' && fs.existsSync(mdPath)) {
    res.type('text/markdown').send(fs.readFileSync(mdPath, 'utf8'))
    return
  }
  if (fs.existsSync(jsonPath)) {
    res.type('application/json').send(fs.readFileSync(jsonPath, 'utf8'))
    return
  }
  res.status(404).json({ error: 'Layer export not found — run pipeline first' })
})

app.get('/api/jobs/:jobId/tree', (req, res) => {
  const jobId = req.params.jobId
  const treePath = path.join(RUNS_DIR, jobId, 'design_tree_final.json')
  if (!fs.existsSync(treePath)) {
    res.status(404).json({ error: 'Job not found' })
    return
  }
  const tree = JSON.parse(fs.readFileSync(treePath, 'utf8'))
  res.json({ jobId, tree, elements: describeElements(tree) })
})

function parseTreeBody(req) {
  if (req.body?.tree) {
    return typeof req.body.tree === 'string' ? JSON.parse(req.body.tree) : req.body.tree
  }
  return null
}

async function editorRerenderHandler(req, res, jobDir, designId = null) {
  try {
    let tree = parseTreeBody(req)
    if (!tree) {
      const loaded = loadEditorTree(jobDir, designId)
      tree = loaded.tree
    } else {
      tree = parseDesignTree(tree)
    }

    const result = await rerenderEditorTree(jobDir, tree, designId, {
      uploadedFiles: req.files || [],
    })
    res.json(result)
  } catch (e) {
    res.status(e.message?.includes('not found') ? 404 : 500).json({ error: e.message || String(e) })
  }
}

app.get('/api/jobs/:jobId/editor-meta', (req, res) => {
  const jobDir = path.join(RUNS_DIR, req.params.jobId)
  try {
    res.json(getEditorMeta(jobDir))
  } catch (e) {
    res.status(e.message?.includes('not found') ? 404 : 500).json({ error: e.message || String(e) })
  }
})

app.patch('/api/jobs/:jobId/tree', (req, res) => {
  const jobDir = path.join(RUNS_DIR, req.params.jobId)
  try {
    const raw = parseTreeBody(req)
    if (!raw) {
      res.status(400).json({ error: 'Missing tree in body' })
      return
    }
    const tree = parseDesignTree(raw)
    const result = patchEditorTree(jobDir, tree)
    res.json({ jobId: req.params.jobId, tree, assetsBaseUrl: result.assetsBaseUrl })
  } catch (e) {
    res.status(e.message?.includes('not found') ? 404 : 500).json({ error: e.message || String(e) })
  }
})

app.post('/api/jobs/:jobId/editor-rerender', upload.any(), (req, res) => {
  editorRerenderHandler(req, res, path.join(RUNS_DIR, req.params.jobId))
})

app.post('/api/jobs/:jobId/confirm', upload.any(), async (req, res) => {
  const jobDir = path.join(RUNS_DIR, req.params.jobId)
  try {
    const raw = parseTreeBody(req)
    if (!raw) {
      res.status(400).json({ error: 'Missing tree in body' })
      return
    }
    const tree = parseDesignTree(raw)
    const result = await confirmEditorTree(jobDir, tree, null, { uploadedFiles: req.files || [] })
    res.json(result)
  } catch (e) {
    res.status(e.message?.includes('not found') ? 404 : 500).json({ error: e.message || String(e) })
  }
})

app.get('/api/ad-template/jobs/:jobId/designs/:designId/editor-meta', (req, res) => {
  const jobDir = path.join(RUNS_DIR, req.params.jobId)
  try {
    const brief = loadJsonSafeBrief(jobDir)
    res.json(getEditorMeta(jobDir, req.params.designId, brief))
  } catch (e) {
    res.status(e.message?.includes('not found') ? 404 : 500).json({ error: e.message || String(e) })
  }
})

app.patch('/api/ad-template/jobs/:jobId/designs/:designId/tree', (req, res) => {
  const jobDir = path.join(RUNS_DIR, req.params.jobId)
  const { designId } = req.params
  try {
    const raw = parseTreeBody(req)
    if (!raw) {
      res.status(400).json({ error: 'Missing tree in body' })
      return
    }
    const tree = parseDesignTree(raw)
    const result = patchEditorTree(jobDir, tree, designId)
    res.json({ jobId: req.params.jobId, designId, tree, assetsBaseUrl: result.assetsBaseUrl })
  } catch (e) {
    res.status(e.message?.includes('not found') ? 404 : 500).json({ error: e.message || String(e) })
  }
})

app.post('/api/ad-template/jobs/:jobId/designs/:designId/editor-rerender', upload.any(), (req, res) => {
  editorRerenderHandler(req, res, path.join(RUNS_DIR, req.params.jobId), req.params.designId)
})

app.post('/api/ad-template/jobs/:jobId/designs/:designId/confirm', upload.any(), async (req, res) => {
  const jobDir = path.join(RUNS_DIR, req.params.jobId)
  const { designId } = req.params
  try {
    const raw = parseTreeBody(req)
    if (!raw) {
      res.status(400).json({ error: 'Missing tree in body' })
      return
    }
    const tree = parseDesignTree(raw)
    const result = await confirmEditorTree(jobDir, tree, designId, { uploadedFiles: req.files || [] })
    res.json(result)
  } catch (e) {
    res.status(e.message?.includes('not found') ? 404 : 500).json({ error: e.message || String(e) })
  }
})

function loadJsonSafeBrief(jobDir) {
  const p = path.join(jobDir, 'brief.json')
  if (!fs.existsSync(p)) return null
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'))
  } catch {
    return null
  }
}

function parseBriefBody(body) {
  const frameFormat = String(body?.frameFormat || body?.aspectRatio || '1:1').trim()
  const generateCount = Number(body?.generateCount) || 6
  const outputCount = Number(body?.outputCount) || 4
  const layoutPolish =
    body?.layoutPolish !== 'false' && body?.layoutPolish !== '0' && body?.layoutPolish !== 'off'
  const highQuality =
    body?.highQuality !== 'false' && body?.highQuality !== '0' && body?.highQuality !== 'off'
  const twoPass = body?.twoPass !== 'false' && body?.twoPass !== '0'

  return {
    title: String(body?.title || '').trim(),
    tagline: body?.tagline?.trim() || '',
    captions: body?.captions?.trim() || '',
    hashtags: body?.hashtags?.trim() || '',
    salePrice: body?.salePrice?.trim() || '',
    offerPrice: body?.offerPrice?.trim() || '',
    discount: body?.discount?.trim() || '',
    rating: (() => {
      const stars = parseStarRating(body?.rating)
      return stars == null ? '' : String(stars)
    })(),
    language: body?.language?.trim() || '',
    category: body?.category?.trim() || '',
    customPrompt: body?.customPrompt?.trim() || '',
    audienceDetails: body?.audienceDetails?.trim() || '',
    merchantInfo: body?.merchantInfo?.trim() || '',
    productPageUrl: body?.productPageUrl?.trim() || '',
    demography: body?.demography?.trim() || '',
    postingTimeline: body?.postingTimeline?.trim() || '',
    frameFormat,
    generateCount,
    outputCount,
    layoutPolish,
    highQuality,
    twoPass,
  }
}

function writeJobFile(jobDir, name, buffer) {
  fs.writeFileSync(path.join(jobDir, name), buffer)
}

function uploadedFile(files, fieldName) {
  if (!files) return null
  if (Array.isArray(files)) {
    return files.find((f) => f.fieldname === fieldName) || null
  }
  return files[fieldName]?.[0] || null
}

function formatDesignsForClient(designs, jobId) {
  return (designs || []).map((d) => ({
    id: d.id,
    name: d.name,
    concept: d.concept,
    rationale: d.rationale,
    messagingAngle: d.messagingAngle,
    expectedPerformance: d.expectedPerformance,
    score: d.score,
    frameFormat: d.frameFormat,
    frameWidth: d.frameWidth,
    frameHeight: d.frameHeight,
    previewUrl: `/runs/${jobId}/${d.previewUrl}`,
    treeUrl: `/runs/${jobId}/${d.treeUrl}`,
    tree: d.tree,
  }))
}

async function handleAdTemplateResume(req, res) {
  const jobId = req.params.jobId
  const jobDir = getJobDir(RUNS_DIR, jobId)
  if (!fs.existsSync(jobDir)) {
    res.status(404).json({ error: 'Job not found' })
    return
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY in .env.local' })
    return
  }

  const body = req.body || {}
  const fromStep = body.fromStep || null
  const pipeline = loadPipelineState(jobDir)
  const forceSteps =
    body.forceSteps ||
    (body.force ? [fromStep || pipeline?.failedStep].filter(Boolean) : [])

  res.setHeader('Content-Type', 'application/x-ndjson')
  res.setHeader('Cache-Control', 'no-cache')
  res.flushHeaders?.()

  writeNdjson(res, { type: 'resume', jobId, fromStep, forceSteps })

  try {
    const result = await resumeAdTemplatePipeline({
      jobDir,
      fromStep,
      forceSteps,
      onProgress: (message, phase, extra) => {
        writeNdjson(res, { type: 'progress', message, phase, ...extra })
      },
    })

    const designs = formatDesignsForClient(result.designs, jobId)
    const productPath = ['product.jpeg', 'product.jpg', 'product.png']
      .map((f) => path.join(jobDir, f))
      .find((p) => fs.existsSync(p)) || path.join(jobDir, 'assets', 'product.png')

    writeNdjson(res, {
      type: 'done',
      jobId,
      resumed: true,
      productImageUrl: fs.existsSync(productPath) ? `/runs/${jobId}/${path.basename(productPath)}` : null,
      analysis: result.analysis,
      analysisSummary: result.analysisSummary,
      designStrategy: result.designStrategy,
      designStrategySummary: result.designStrategySummary,
      designs,
      assetsBaseUrl: `/runs/${jobId}/assets`,
    })
  } catch (e) {
    const failed = loadPipelineState(jobDir)
    writeNdjson(res, {
      type: 'error',
      message: e?.message || String(e),
      jobId,
      failedStep: failed?.failedStep || null,
      canResume: failed?.status !== 'aborted',
    })
  } finally {
    res.end()
  }
}

/** Agentic ad template generation: product analysis → 4 design trees. */
async function handleAdTemplateGenerate(req, res, uploadErr = null) {
  if (uploadErr) {
    res.status(400).json({ error: uploadErr.message })
    return
  }

  const body = req.body || {}
  const productFile = uploadedFile(req.files, 'productImage')
  const productImageUrl = String(body.productImageUrl || '').trim()
  const logoImageUrl = String(body.logoImageUrl || '').trim()
  const productPageUrl = String(body.productPageUrl || '').trim()

    if (!productFile && !productImageUrl) {
      res.status(400).json({ error: 'Provide a product image upload or a product image URL.' })
      return
    }
    if (productFile && productImageUrl) {
      res.status(400).json({ error: 'Use either product image upload or URL, not both.' })
      return
    }
    if (productImageUrl && !isValidImageUrl(productImageUrl)) {
      res.status(400).json({ error: 'Invalid product image URL.' })
      return
    }
    if (logoImageUrl && !isValidImageUrl(logoImageUrl)) {
      res.status(400).json({ error: 'Invalid logo image URL.' })
      return
    }
    if (productPageUrl && !/^https?:\/\//i.test(productPageUrl)) {
      res.status(400).json({ error: 'Invalid marketplace product page URL.' })
      return
    }

  const brief = parseBriefBody(body)
  if (!brief.title) {
    res.status(400).json({ error: 'Product title is required.' })
    return
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY in .env.local' })
    return
  }

  const referenceFile = uploadedFile(req.files, 'referenceImage')
  const logoFile = uploadedFile(req.files, 'logo')
  const removeBackground =
    body.removeBackground === 'true' ||
    body.removeBackground === '1' ||
    body.removeBackground === 'on'

  const jobId = `ad_${Date.now()}_${safeStem(brief.title)}`
  const outDir = path.join(RUNS_DIR, jobId)
  fs.mkdirSync(outDir, { recursive: true })

  let productPath
  let productSourceUrl = null
  let referencePath = null
  let logoPath = null
  let logoSourceUrl = null

  try {
    if (productFile) {
      const ext = path.extname(productFile.originalname || '.png').toLowerCase() || '.png'
      productPath = path.join(outDir, `product${ext}`)
      writeJobFile(outDir, path.basename(productPath), productFile.buffer)
    } else {
      productSourceUrl = productImageUrl
      brief.productImageUrl = productImageUrl
      const downloaded = await downloadImageFromUrl(productImageUrl, path.join(outDir, 'product'))
      productPath = downloaded.path
    }

    if (referenceFile) {
      const refExt = path.extname(referenceFile.originalname || '.png').toLowerCase() || '.png'
      referencePath = path.join(outDir, `reference${refExt}`)
      writeJobFile(outDir, path.basename(referencePath), referenceFile.buffer)
    }

    if (logoFile && logoImageUrl) {
      res.status(400).json({ error: 'Use either logo upload or URL, not both.' })
      return
    }
    if (logoFile) {
      const logoExt = path.extname(logoFile.originalname || '.png').toLowerCase() || '.png'
      logoPath = path.join(outDir, `logo${logoExt}`)
      writeJobFile(outDir, path.basename(logoPath), logoFile.buffer)
    } else if (logoImageUrl) {
      logoSourceUrl = logoImageUrl
      brief.logoImageUrl = logoImageUrl
      const downloaded = await downloadImageFromUrl(logoImageUrl, path.join(outDir, 'logo'))
      logoPath = downloaded.path
    }
  } catch (e) {
    res.status(400).json({ error: e?.message || String(e) })
    return
  }

  res.setHeader('Content-Type', 'application/x-ndjson')
  res.setHeader('Cache-Control', 'no-cache')
  res.flushHeaders?.()

  saveChat(outDir, [
      {
        role: 'assistant',
        agent: 'orchestrator',
        content: ORCHESTRATOR_WELCOME,
        at: new Date().toISOString(),
      },
  ])

  writeNdjson(res, {
    type: 'start',
    jobId,
    brief,
    orchestratorMessage: ORCHESTRATOR_WELCOME,
  })

  try {
    const result = await runAdTemplatePipeline({
      jobDir: outDir,
      jobId,
      publicBaseUrl: getPublicBaseUrl(),
      brief,
      productImagePath: productPath,
      productSourceUrl,
      referenceImagePath: referencePath,
      logoPath,
      logoSourceUrl,
      removeBackground,
      layoutPolish: brief.layoutPolish,
      polishLoops: Number(body.polishLoops) || 1,
      highQuality: brief.highQuality,
      generateCount: brief.generateCount,
      outputCount: brief.outputCount,
      onProgress: (message, phase, extra) => {
        writeNdjson(res, { type: 'progress', message, phase, ...extra })
      },
    })

    const designs = formatDesignsForClient(result.designs, jobId)

    writeNdjson(res, {
      type: 'done',
      jobId,
      productImageUrl: `/runs/${jobId}/${path.basename(productPath)}`,
      analysis: result.analysis,
      analysisSummary: result.analysisSummary,
      designStrategy: result.designStrategy,
      designStrategySummary: result.designStrategySummary,
      designs,
      assetsBaseUrl: `/runs/${jobId}/assets`,
    })
  } catch (e) {
    const pipeline = loadPipelineState(outDir)
    writeNdjson(res, {
      type: 'error',
      message: e?.message || String(e),
      jobId,
      failedStep: pipeline?.failedStep || pipeline?.currentStep || null,
      canResume: true,
      completedSteps: pipeline?.completedSteps || [],
    })
  } finally {
    res.end()
  }
}

app.post('/api/ad-template/generate', (req, res) => {
  const ct = req.headers['content-type'] || ''
  if (ct.includes('application/json')) {
    handleAdTemplateGenerate(req, res).catch((e) => {
      if (!res.headersSent) res.status(500).json({ error: e?.message || String(e) })
    })
    return
  }
  adTemplateUpload(req, res, (uploadErr) => {
    handleAdTemplateGenerate(req, res, uploadErr).catch((e) => {
      if (!res.headersSent) res.status(500).json({ error: e?.message || String(e) })
    })
  })
})

app.get('/api/ad-template/jobs/:jobId', (req, res) => {
  const jobId = req.params.jobId
  const state = loadJobState(RUNS_DIR, jobId)
  if (!state) {
    res.status(404).json({ error: 'Job not found' })
    return
  }
  res.json(state)
})

app.get('/api/ad-template/jobs/:jobId/state', (req, res) => {
  const state = loadJobState(RUNS_DIR, req.params.jobId)
  if (!state) {
    res.status(404).json({ error: 'Job not found' })
    return
  }
  res.json(state)
})

app.post('/api/ad-template/jobs/:jobId/resume', (req, res) => {
  handleAdTemplateResume(req, res).catch((e) => {
    if (!res.headersSent) res.status(500).json({ error: e?.message || String(e) })
  })
})

app.post('/api/ad-template/jobs/:jobId/abort', (req, res) => {
  const jobId = req.params.jobId
  const jobDir = getJobDir(RUNS_DIR, jobId)
  if (!fs.existsSync(jobDir)) {
    res.status(404).json({ error: 'Job not found' })
    return
  }
  const reason = String(req.body?.reason || 'Stopped by user').trim()
  abortAdTemplatePipeline(jobDir, reason)
  res.json({ jobId, status: 'aborted', reason })
})

/** Chat with orchestrator — always available; uses job context when jobId provided. */
app.post('/api/ad-template/chat', async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'Missing ANTHROPIC_API_KEY' })
    return
  }

  const message = String(req.body?.message || '').trim()
  if (!message) {
    res.status(400).json({ error: 'message is required' })
    return
  }

  const jobId = req.body?.jobId || null
  let jobDir = null
  let jobState = {
    phase: 'idle',
    brief: null,
    chat: [],
    designs: [],
  }

  if (jobId) {
    jobDir = getJobDir(RUNS_DIR, jobId)
    if (!fs.existsSync(jobDir)) {
      res.status(404).json({ error: 'Job not found' })
      return
    }
    jobState = loadJobState(RUNS_DIR, jobId)
    appendChatMessage(jobDir, { role: 'user', content: message })
    jobState.chat = loadJobState(RUNS_DIR, jobId).chat
  }

  const productPath = jobDir
    ? ['product.jpeg', 'product.jpg', 'product.png']
        .map((f) => path.join(jobDir, f))
        .find((p) => fs.existsSync(p))
    : null

  try {
    const { reply, modifications, pipelineAction } = await orchestratorChat({
      userMessage: message,
      jobState,
      jobDir,
      productImagePath: productPath,
      runsDir: RUNS_DIR,
      jobId,
    })

    if (jobDir) {
      appendChatMessage(jobDir, { role: 'assistant', agent: 'orchestrator', content: reply })
    }

    if (pipelineAction?.type === 'stop_pipeline' && jobDir) {
      abortAdTemplatePipeline(jobDir, pipelineAction.reason)
    }

    const designs = jobId
      ? loadJobState(RUNS_DIR, jobId).designs.map((d) => ({
          ...d,
          previewUrl: d.previewUrl ? `/runs/${jobId}/${d.previewUrl}` : null,
          tree: d.tree,
        }))
      : []

    res.json({
      jobId,
      reply,
      pipelineAction: pipelineAction || null,
      modifications: (modifications || []).map((m) => ({
        designId: m.designId,
        summary: m.summary,
        error: m.error,
        previewUrl: m.previewUrl && jobId ? `/runs/${jobId}/${m.previewUrl}` : null,
        tree: m.tree,
      })),
      designs,
      assetsBaseUrl: jobId ? `/runs/${jobId}/assets` : null,
    })
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

/** List editable template props for one ad design (post-render). */
app.get('/api/ad-template/jobs/:jobId/designs/:designId/template-props', (req, res) => {
  const jobDir = path.join(RUNS_DIR, req.params.jobId)
  try {
    const data = getTemplatePropsForDesign(jobDir, req.params.designId)
    res.json(data)
  } catch (e) {
    res.status(e.message?.includes('not found') ? 404 : 500).json({ error: e.message || String(e) })
  }
})

/** Apply template test data (text, colors, product/logo images) and re-render. */
app.post('/api/ad-template/jobs/:jobId/designs/:designId/apply-template', upload.any(), async (req, res) => {
  const jobId = req.params.jobId
  const designId = req.params.designId
  const jobDir = path.join(RUNS_DIR, jobId)

  let overrides = {}
  try {
    overrides = JSON.parse(req.body?.overrides || '{}')
  } catch {
    res.status(400).json({ error: 'Invalid overrides JSON' })
    return
  }

  try {
    const result = await applyTemplateToDesign({
      jobDir,
      designId,
      overrides,
      uploadedFiles: req.files || [],
    })
    res.json({
      jobId,
      designId,
      name: result.name,
      previewUrl: `/runs/${jobId}/${result.previewUrl}?t=${Date.now()}`,
      treeUrl: `/runs/${jobId}/designs/${designId}/design_tree.json`,
      tree: result.tree,
      templateProps: result.templateProps,
      assetsBaseUrl: `/runs/${jobId}/assets`,
    })
  } catch (e) {
    res.status(e.message?.includes('not found') ? 404 : 500).json({ error: e.message || String(e) })
  }
})

/** Apply CSS vs image-crop choices from the agent, then re-render (no LLM). */
app.post('/api/jobs/:jobId/resolve-renders', async (req, res) => {
  const jobId = req.params.jobId
  const outDir = path.join(RUNS_DIR, jobId)
  if (!fs.existsSync(path.join(outDir, 'design_tree_final.json'))) {
    res.status(404).json({ error: 'Job not found' })
    return
  }

  let renderChoices = {}
  try {
    renderChoices = req.body?.renderChoices || {}
    if (typeof renderChoices === 'string') renderChoices = JSON.parse(renderChoices)
  } catch {
    res.status(400).json({ error: 'Invalid renderChoices JSON' })
    return
  }

  try {
    const result = await resolveRenderChoicesAndRender({ jobDir: outDir, renderChoices })
    res.json({
      jobId,
      previewPngUrl: `/runs/${jobId}/preview.png`,
      finalTreeUrl: `/runs/${jobId}/design_tree_final.json`,
      elements: result.elements,
      renderAmbiguities: result.renderAmbiguities,
      appliedRenderChoices: result.appliedRenderChoices || renderChoices,
      tree: result.final_tree,
    })
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

/** Apply user text/image overrides and re-render (no LLM). */
app.post('/api/jobs/:jobId/rerender', upload.any(), async (req, res) => {
  const jobId = req.params.jobId
  const outDir = path.join(RUNS_DIR, jobId)
  const treePath = path.join(outDir, 'design_tree_final.json')
  if (!fs.existsSync(treePath)) {
    res.status(404).json({ error: 'Job not found' })
    return
  }

  let tree = JSON.parse(fs.readFileSync(treePath, 'utf8'))
  let overrides = {}
  try {
    overrides = JSON.parse(req.body?.overrides || '{}')
  } catch {
    res.status(400).json({ error: 'Invalid overrides JSON' })
    return
  }

  const assetsDir = path.join(outDir, 'assets')
  fs.mkdirSync(assetsDir, { recursive: true })

  for (const file of req.files || []) {
    const m = /^asset_(.+)$/.exec(file.fieldname || '')
    if (!m) continue
    const nodeId = m[1]
    const dest = path.join(assetsDir, `${nodeId}_user.png`)
    fs.writeFileSync(dest, file.buffer)
    overrides[nodeId] = overrides[nodeId] || {}
    overrides[nodeId].contentSource = 'user'
    overrides[nodeId].src = `assets/${path.basename(dest)}`
  }

  try {
    const result = await renderWithOverrides({
      jobDir: outDir,
      tree,
      overrides,
    })
    res.json({
      jobId,
      previewPngUrl: `/runs/${jobId}/preview.png`,
      finalTreeUrl: `/runs/${jobId}/design_tree_final.json`,
      elements: result.elements,
      tree: result.final_tree,
    })
  } catch (e) {
    res.status(500).json({ error: e?.message || String(e) })
  }
})

const port = Number(process.env.PORT || 8787)
app.listen(port, () => {
  console.log(`Ad Template Studio: http://localhost:${port}`)
  console.log(`Image → Design Tree: http://localhost:${port}/image-to-tree`)
  console.log(`Visual editor: http://localhost:${port}/editor?jobId=…`)
  console.log(`Runs folder: ${RUNS_DIR}`)
})
