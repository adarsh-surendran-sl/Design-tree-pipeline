import fs from 'fs'
import path from 'path'

import { formatAnalysisSummary, formatDesignStrategySummary } from './agents/summaries.js'
import { inferCompletedSteps, loadPipelineState, PIPELINE_STEPS } from './pipelineState.js'

export function getJobDir(runsDir, jobId) {
  return path.join(runsDir, jobId)
}

export function loadJsonSafe(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

export function loadChat(jobDir) {
  return loadJsonSafe(path.join(jobDir, 'chat.json'), { messages: [] })
}

export function saveChat(jobDir, messages) {
  fs.writeFileSync(
    path.join(jobDir, 'chat.json'),
    JSON.stringify({ messages, updatedAt: new Date().toISOString() }, null, 2),
  )
}

export function appendChatMessage(jobDir, message) {
  const chat = loadChat(jobDir)
  chat.messages = chat.messages || []
  chat.messages.push({ ...message, at: message.at || new Date().toISOString() })
  saveChat(jobDir, chat.messages)
  return chat.messages
}

export function loadDesignTrees(jobDir) {
  const designsDir = path.join(jobDir, 'designs')
  if (!fs.existsSync(designsDir)) return []

  const trees = []
  for (const id of fs.readdirSync(designsDir)) {
    const treePath = path.join(designsDir, id, 'design_tree.json')
    const previewPath = path.join(designsDir, id, 'preview.png')
    if (!fs.existsSync(treePath)) continue
    const tree = loadJsonSafe(treePath)
    const meta = loadJsonSafe(path.join(jobDir, 'result.json'), {})
    const designMeta = (meta.designs || []).find((d) => d.id === id) || {}
    trees.push({
      id,
      name: designMeta.name || id,
      concept: designMeta.concept,
      rationale: designMeta.rationale,
      messagingAngle: designMeta.messagingAngle,
      expectedPerformance: designMeta.expectedPerformance,
      previewUrl: fs.existsSync(previewPath) ? `designs/${id}/preview.png` : null,
      treeUrl: `designs/${id}/design_tree.json`,
      tree,
    })
  }
  return trees.sort((a, b) => a.id.localeCompare(b.id))
}

export function loadJobState(runsDir, jobId) {
  const jobDir = getJobDir(runsDir, jobId)
  if (!fs.existsSync(jobDir)) return null

  const brief = loadJsonSafe(path.join(jobDir, 'brief.json'))
  const analysis = loadJsonSafe(path.join(jobDir, 'product_analysis.json'))
  const designStrategy = loadJsonSafe(path.join(jobDir, 'design_strategy.json'))
  const result = loadJsonSafe(path.join(jobDir, 'result.json'))
  const chat = loadChat(jobDir)
  const designs = loadDesignTrees(jobDir)

  const pipeline = loadPipelineState(jobDir)
  const completedSteps = inferCompletedSteps(jobDir)

  let phase = 'idle'
  if (pipeline?.status === 'failed') phase = 'failed'
  else if (pipeline?.status === 'aborted') phase = 'aborted'
  else if (pipeline?.status === 'complete' || (result?.designs?.length >= 1 && designs.length >= 1)) {
    phase = 'complete'
  } else if (completedSteps.includes('render')) phase = 'finalizing'
  else if (completedSteps.includes('design')) phase = 'rendering'
  else if (completedSteps.includes('strategy')) phase = 'designing'
  else if (completedSteps.includes('analysis')) phase = 'strategy'
  else if (completedSteps.includes('prep')) phase = 'analysis'
  else if (analysis && !designStrategy) phase = 'analysis_done'
  else if (designStrategy && designs.length < 1) phase = 'designing'
  else if (designs.length >= 1) phase = 'complete'

  const productFiles = ['product.jpeg', 'product.jpg', 'product.png']
  let productImage = null
  for (const f of productFiles) {
    if (fs.existsSync(path.join(jobDir, f))) {
      productImage = f
      break
    }
  }

  return {
    jobId,
    jobDir,
    phase,
    pipeline,
    pipelineSteps: PIPELINE_STEPS,
    completedSteps,
    canResume: Boolean(
      pipeline?.status === 'failed' ||
        (pipeline?.status === 'running' && completedSteps.length > 0 && completedSteps.length < PIPELINE_STEPS.length),
    ),
    brief,
    analysis,
    analysisSummary: analysis ? formatAnalysisSummary(analysis) : null,
    designStrategy,
    designStrategySummary: formatDesignStrategySummary(designStrategy, designs),
    designs,
    result,
    chat: chat.messages || [],
    assetsBaseUrl: `/runs/${jobId}/assets`,
    productImageUrl: productImage ? `/runs/${jobId}/${productImage}` : null,
  }
}

export function updateResultDesign(jobDir, designId, patch) {
  const resultPath = path.join(jobDir, 'result.json')
  const result = loadJsonSafe(resultPath, { designs: [], trees: [] })
  result.designs = (result.designs || []).map((d) =>
    d.id === designId ? { ...d, ...patch } : d,
  )
  const trees = result.trees || []
  const tIdx = trees.findIndex((t) => t.id === designId)
  if (tIdx >= 0 && patch.tree) trees[tIdx] = { id: designId, tree: patch.tree }
  result.trees = trees
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2))
}
