import fs from 'fs'
import path from 'path'

import { describeTemplateProps } from './templateProps.js'
import { describeElements } from './composition.js'
import { parseDesignTree } from './schemas.js'
import { applyUserOverrides } from './overrides.js'
import { sanitizeTreeComposition } from './composition.js'
import { renderToFilesBrowser } from './renderDispatch.js'
import { saveReconstructionArtifacts } from './reconstructionOrchestrator.js'
import { updateResultDesign } from './jobState.js'

export function resolveEditorPaths(jobDir, designId = null) {
  const out = path.resolve(jobDir)
  if (designId) {
    const designDir = path.join(out, 'designs', designId)
    return {
      jobDir: out,
      designId,
      treePath: path.join(designDir, 'design_tree.json'),
      confirmedPath: path.join(designDir, 'design_tree_confirmed.json'),
      assetsDir: path.join(out, 'assets'),
      assetsBaseUrl: `/runs/${path.basename(out)}/assets`,
      previewPng: path.join(designDir, 'preview.png'),
      scope: 'ad-template',
    }
  }
  return {
    jobDir: out,
    designId: null,
    treePath: path.join(out, 'design_tree_final.json'),
    confirmedPath: path.join(out, 'design_tree_confirmed.json'),
    assetsDir: path.join(out, 'assets'),
    assetsBaseUrl: `/runs/${path.basename(out)}/assets`,
    previewPng: path.join(out, 'preview.png'),
    scope: 'image-to-tree',
  }
}

export function loadEditorTree(jobDir, designId = null) {
  const ctx = resolveEditorPaths(jobDir, designId)
  if (!fs.existsSync(ctx.treePath)) {
    throw new Error(designId ? `Design not found: ${designId}` : 'Job not found')
  }
  const tree = parseDesignTree(JSON.parse(fs.readFileSync(ctx.treePath, 'utf8')))
  return { tree, ctx }
}

export function saveEditorTree(jobDir, tree, designId = null) {
  const ctx = resolveEditorPaths(jobDir, designId)
  fs.mkdirSync(path.dirname(ctx.treePath), { recursive: true })
  fs.writeFileSync(ctx.treePath, JSON.stringify(tree, null, 2), 'utf8')
  return ctx
}

export function getEditorMeta(jobDir, designId = null, brief = null) {
  const { tree, ctx } = loadEditorTree(jobDir, designId)
  const templateProps = describeTemplateProps(tree, { assetsBaseUrl: ctx.assetsBaseUrl, brief })
  return {
    jobId: path.basename(ctx.jobDir),
    designId: ctx.designId,
    tree,
    elements: describeElements(tree),
    templateProps,
    assetsBaseUrl: ctx.assetsBaseUrl,
    scope: ctx.scope,
  }
}

export async function patchEditorTree(jobDir, tree, designId = null) {
  const ctx = saveEditorTree(jobDir, tree, designId)
  saveReconstructionArtifacts(ctx.jobDir, tree)
  return {
    jobId: path.basename(ctx.jobDir),
    designId: ctx.designId,
    treePath: ctx.treePath,
    assetsBaseUrl: ctx.assetsBaseUrl,
  }
}

export async function rerenderEditorTree(jobDir, tree, designId = null, { overrides = {}, uploadedFiles = [] } = {}) {
  const ctx = saveEditorTree(jobDir, tree, designId)

  let nodeOverrides = overrides.nodes ? { ...overrides.nodes } : { ...overrides }
  if (overrides.frame?.backgroundColor) {
    tree.backgroundColor = overrides.frame.backgroundColor
  }

  for (const file of uploadedFiles) {
    const m = /^asset_(.+)$/.exec(file.fieldname || '')
    if (!m) continue
    const nodeId = m[1]
    const dest = path.join(ctx.assetsDir, `${nodeId}_editor${path.extname(file.originalname || '.png') || '.png'}`)
    fs.mkdirSync(ctx.assetsDir, { recursive: true })
    fs.writeFileSync(dest, file.buffer)
    nodeOverrides[nodeId] = nodeOverrides[nodeId] || {}
    nodeOverrides[nodeId].contentSource = 'user'
    nodeOverrides[nodeId].src = `assets/${path.basename(dest)}`
  }

  const jobId = path.basename(ctx.jobDir)
  let finalTree = JSON.parse(JSON.stringify(tree))

  if (Object.keys(nodeOverrides).length) {
    finalTree = applyUserOverrides(finalTree, nodeOverrides)
  }
  finalTree = sanitizeTreeComposition(finalTree)
  fs.writeFileSync(ctx.treePath, JSON.stringify(finalTree, null, 2), 'utf8')

  const outputDir = designId ? path.join(ctx.jobDir, 'designs', designId) : ctx.jobDir
  await renderToFilesBrowser(finalTree, outputDir, 'preview', ctx.assetsDir)

  return {
    jobId,
    designId: ctx.designId,
    tree: finalTree,
    previewPngUrl: designId
      ? `/runs/${jobId}/designs/${designId}/preview.png`
      : `/runs/${jobId}/preview.png`,
    assetsBaseUrl: ctx.assetsBaseUrl,
  }
}

export async function confirmEditorTree(jobDir, tree, designId = null, { overrides = {}, uploadedFiles = [] } = {}) {
  const ctx = saveEditorTree(jobDir, tree, designId)

  const preview = await rerenderEditorTree(jobDir, tree, designId, { overrides, uploadedFiles })
  const jobId = preview.jobId
  const finalTree = preview.tree
  fs.writeFileSync(ctx.confirmedPath, JSON.stringify(finalTree, null, 2), 'utf8')

  if (designId) {
    updateResultDesign(ctx.jobDir, designId, {
      tree: finalTree,
      previewUrl: `designs/${designId}/preview.png`,
    })
  }

  return {
    jobId,
    designId: ctx.designId,
    tree: finalTree,
    previewPngUrl: preview.previewPngUrl,
    confirmedTreeUrl: ctx.designId
      ? `/runs/${path.basename(ctx.jobDir)}/designs/${designId}/design_tree_confirmed.json`
      : `/runs/${path.basename(ctx.jobDir)}/design_tree_confirmed.json`,
    assetsBaseUrl: ctx.assetsBaseUrl,
  }
}
