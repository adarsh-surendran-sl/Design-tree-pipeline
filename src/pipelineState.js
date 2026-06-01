import fs from 'fs'
import path from 'path'

export const PIPELINE_STEPS = ['prep', 'analysis', 'strategy', 'design', 'render', 'finalize']

const STATE_FILE = 'pipeline_state.json'
const CONFIG_FILE = 'pipeline_config.json'

export function loadPipelineState(jobDir) {
  return loadJson(path.join(jobDir, STATE_FILE), null)
}

export function loadPipelineConfig(jobDir) {
  return loadJson(path.join(jobDir, CONFIG_FILE), {})
}

export function savePipelineConfig(jobDir, config) {
  writeJson(path.join(jobDir, CONFIG_FILE), { ...config, updatedAt: new Date().toISOString() })
}

export function initPipelineState(jobDir, { jobId } = {}) {
  const state = {
    jobId: jobId || path.basename(jobDir),
    status: 'running',
    currentStep: PIPELINE_STEPS[0],
    completedSteps: [],
    failedStep: null,
    error: null,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  writePipelineState(jobDir, state)
  return state
}

export function markStepRunning(jobDir, step) {
  const state = loadPipelineState(jobDir) || initPipelineState(jobDir)
  state.status = 'running'
  state.currentStep = step
  state.failedStep = null
  state.error = null
  state.updatedAt = new Date().toISOString()
  writePipelineState(jobDir, state)
  return state
}

export function markStepComplete(jobDir, step) {
  const state = loadPipelineState(jobDir) || initPipelineState(jobDir)
  if (!state.completedSteps.includes(step)) state.completedSteps.push(step)
  state.status = 'running'
  state.currentStep = step
  state.failedStep = null
  state.error = null
  state.updatedAt = new Date().toISOString()
  writePipelineState(jobDir, state)
  return state
}

export function markPipelineComplete(jobDir) {
  const state = loadPipelineState(jobDir) || initPipelineState(jobDir)
  state.status = 'complete'
  state.currentStep = 'finalize'
  for (const step of PIPELINE_STEPS) {
    if (!state.completedSteps.includes(step)) state.completedSteps.push(step)
  }
  state.failedStep = null
  state.error = null
  state.updatedAt = new Date().toISOString()
  writePipelineState(jobDir, state)
  return state
}

export function markPipelineFailed(jobDir, step, error) {
  const state = loadPipelineState(jobDir) || initPipelineState(jobDir)
  state.status = 'failed'
  state.failedStep = step
  state.error = String(error?.message || error || 'Unknown error')
  state.currentStep = step
  state.updatedAt = new Date().toISOString()
  writePipelineState(jobDir, state)
  return state
}

export function markPipelineAborted(jobDir, reason) {
  const state = loadPipelineState(jobDir) || initPipelineState(jobDir)
  state.status = 'aborted'
  state.error = reason || 'Stopped by user'
  state.updatedAt = new Date().toISOString()
  writePipelineState(jobDir, state)
  return state
}

/** Infer completed steps from artifacts on disk. */
export function inferCompletedSteps(jobDir) {
  const completed = []
  const briefPath = path.join(jobDir, 'brief.json')
  const productAsset = path.join(jobDir, 'assets', 'product.png')

  if (fs.existsSync(briefPath) && fs.existsSync(productAsset)) completed.push('prep')
  if (fs.existsSync(path.join(jobDir, 'product_analysis.json'))) completed.push('analysis')
  if (fs.existsSync(path.join(jobDir, 'design_strategy.json'))) completed.push('strategy')
  if (fs.existsSync(path.join(jobDir, 'generated_designs.json'))) completed.push('design')

  const designsDir = path.join(jobDir, 'designs')
  let renderDone = false
  if (fs.existsSync(designsDir)) {
    const dirs = fs.readdirSync(designsDir).filter((d) => {
      const base = path.join(designsDir, d)
      return (
        fs.statSync(base).isDirectory() &&
        fs.existsSync(path.join(base, 'preview.png')) &&
        fs.existsSync(path.join(base, 'design_tree.json'))
      )
    })
    const generated = loadJson(path.join(jobDir, 'generated_designs.json'), null)
    const expected = generated?.designs?.length || dirs.length
    renderDone = expected > 0 && dirs.length >= expected
  }
  if (renderDone) completed.push('render')
  if (fs.existsSync(path.join(jobDir, 'result.json'))) completed.push('finalize')

  return completed
}

export function resolveResumeStep(jobDir, { fromStep, forceSteps = [] } = {}) {
  const forced = new Set(Array.isArray(forceSteps) ? forceSteps : forceSteps ? [forceSteps] : [])
  if (fromStep && PIPELINE_STEPS.includes(fromStep)) {
    return fromStep
  }

  const state = loadPipelineState(jobDir)
  if (state?.status === 'failed' && state.failedStep && !forced.has(state.failedStep)) {
    return state.failedStep
  }

  const completed = new Set([...inferCompletedSteps(jobDir), ...(state?.completedSteps || [])])
  for (const step of PIPELINE_STEPS) {
    if (!completed.has(step) || forced.has(step)) return step
  }
  return 'finalize'
}

export function findProductImagePath(jobDir) {
  const candidates = [
    path.join(jobDir, 'assets', 'product.png'),
    path.join(jobDir, 'product.png'),
    path.join(jobDir, 'product.jpg'),
    path.join(jobDir, 'product.jpeg'),
  ]
  return candidates.find((p) => fs.existsSync(p)) || null
}

export function findLogoPath(jobDir) {
  const candidates = [path.join(jobDir, 'assets', 'logo.png'), path.join(jobDir, 'logo.png')]
  return candidates.find((p) => fs.existsSync(p)) || null
}

export function findReferencePath(jobDir) {
  const p = path.join(jobDir, 'reference.png')
  return fs.existsSync(p) ? p : null
}

function loadJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

function writePipelineState(jobDir, state) {
  writeJson(path.join(jobDir, STATE_FILE), state)
}
