import fs from 'fs'
import path from 'path'

import { applyUserOverrides } from './overrides.js'
import { sanitizeTreeComposition } from './composition.js'
import { describeTemplateProps } from './templateProps.js'
import { ensureBriefRatingNode, parseStarRating } from './briefRating.js'
import { fixDesignTreeLayout } from './layoutFix.js'
import { polishDesignQuality } from './layoutQuality.js'
import { safeMarginForFrame } from './frameFormats.js'
import { renderToFilesBrowser } from './renderDispatch.js'
import { parseDesignTree } from './schemas.js'
import { updateResultDesign } from './jobState.js'

function writeAsset(buffer, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  fs.writeFileSync(destPath, buffer)
}

function extFromMime(mimetype) {
  if (mimetype === 'image/png') return '.png'
  if (mimetype === 'image/webp') return '.webp'
  if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') return '.jpg'
  return '.png'
}

/**
 * Apply user template overrides (text, colors, images) and re-render one ad design.
 */
export async function applyTemplateToDesign({
  jobDir,
  designId,
  overrides = {},
  uploadedFiles = [],
}) {
  jobDir = path.resolve(jobDir)
  const designDir = path.join(jobDir, 'designs', designId)
  const treePath = path.join(designDir, 'design_tree.json')
  if (!fs.existsSync(treePath)) {
    throw new Error(`Design not found: ${designId}`)
  }

  const assetsDir = path.join(jobDir, 'assets')
  fs.mkdirSync(assetsDir, { recursive: true })

  let tree = JSON.parse(fs.readFileSync(treePath, 'utf8'))
  const nodeOverrides = overrides.nodes ? { ...overrides.nodes } : { ...overrides }
  delete nodeOverrides.frame
  delete nodeOverrides.nodes
  delete nodeOverrides._frame

  if (overrides.frame?.backgroundColor) {
    tree.backgroundColor = overrides.frame.backgroundColor
  }

  for (const file of uploadedFiles) {
    const field = file.fieldname || ''
    let nodeId = null
    let destName = null

    const assetMatch = /^asset_(.+)$/.exec(field)
    if (assetMatch) {
      nodeId = assetMatch[1]
      destName = `${nodeId}_template${extFromMime(file.mimetype)}`
    } else if (field === 'productImage' || field === 'asset_product') {
      nodeId = 'product'
      destName = 'product.png'
    } else if (field === 'logoImage' || field === 'asset_logo') {
      nodeId = 'logo'
      destName = 'logo.png'
    }

    if (!nodeId) continue

    const dest = path.join(assetsDir, destName)
    writeAsset(file.buffer, dest)

    nodeOverrides[nodeId] = nodeOverrides[nodeId] || {}
    nodeOverrides[nodeId].contentSource = 'user'
    nodeOverrides[nodeId].src = `assets/${destName}`
    if (nodeId === 'product' || nodeId === 'logo') {
      nodeOverrides[nodeId].type = nodeId === 'logo' ? 'logo' : 'image'
      nodeOverrides[nodeId].objectFit = 'contain'
    }
  }

  tree = applyUserOverrides(tree, nodeOverrides)
  tree = sanitizeTreeComposition(tree)

  const briefPath = path.join(jobDir, 'brief.json')
  const brief = loadJsonSafe(briefPath, {})
  if (overrides.brief?.rating != null) {
    const stars = parseStarRating(overrides.brief.rating)
    if (stars != null) brief.rating = String(stars)
  }
  tree = polishDesignQuality(tree, brief)
  tree = fixDesignTreeLayout(tree, {
    safeMargin: safeMarginForFrame(tree.width ?? 1080, tree.height ?? 1080),
  })
  tree = polishDesignQuality(tree, brief)
  tree = ensureBriefRatingNode(tree, brief)
  if (brief.rating) {
    fs.writeFileSync(briefPath, JSON.stringify(brief, null, 2))
  }

  parseDesignTree(tree, { width: tree.width, height: tree.height })

  fs.writeFileSync(treePath, JSON.stringify(tree, null, 2))
  fs.writeFileSync(
    path.join(designDir, 'template_overrides.json'),
    JSON.stringify({ overrides: nodeOverrides, frame: overrides.frame || null, at: new Date().toISOString() }, null, 2),
  )

  const { png } = await renderToFilesBrowser(tree, designDir, 'preview', assetsDir)

  const previewUrl = `designs/${designId}/preview.png`
  updateResultDesign(jobDir, designId, { tree, previewUrl })

  const jobId = path.basename(jobDir)
  const assetsBaseUrl = `/runs/${jobId}/assets`
  const meta = loadJsonSafe(path.join(jobDir, 'result.json'), {})
  const designMeta = (meta.designs || []).find((d) => d.id === designId) || {}

  return {
    designId,
    name: designMeta.name || designId,
    tree,
    previewUrl,
    previewPath: png,
    templateProps: describeTemplateProps(tree, { assetsBaseUrl }),
    elements: tree.children || [],
  }
}

export function getTemplatePropsForDesign(jobDir, designId) {
  jobDir = path.resolve(jobDir)
  const designDir = path.join(jobDir, 'designs', designId)
  const treePath = path.join(designDir, 'design_tree.json')
  if (!fs.existsSync(treePath)) {
    throw new Error(`Design not found: ${designId}`)
  }
  const tree = JSON.parse(fs.readFileSync(treePath, 'utf8'))
  const jobId = path.basename(jobDir)
  const assetsBaseUrl = `/runs/${jobId}/assets`
  const brief = loadJsonSafe(path.join(jobDir, 'brief.json'), {})
  const designMeta = loadJsonSafe(path.join(jobDir, 'result.json'), {})
  const meta = (designMeta.designs || []).find((d) => d.id === designId) || {}

  return {
    designId,
    name: meta.name || designId,
    tree,
    assetsBaseUrl,
    brief,
    templateProps: describeTemplateProps(tree, { assetsBaseUrl, brief }),
  }
}

function loadJsonSafe(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}
