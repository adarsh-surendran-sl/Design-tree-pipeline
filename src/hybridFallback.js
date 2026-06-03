import sharp from 'sharp'

import { hasCssBackground } from './renderBackground.js'
import { RASTER_TYPES } from './capabilities.js'
import { treeHasPatternedBackground } from './backgroundPresets.js'

const LAYER_MAE_THRESHOLD = 0.35

function isProductLike(node) {
  const role = String(node.role || '').toLowerCase()
  const id = String(node.id || '').toLowerCase()
  return role === 'product' || role === 'logo' || id.includes('product') || id.includes('bottle') || id.includes('hero')
}

/**
 * Detect flat background from corner color variance (no LLM).
 */
export async function isFlatBackground(imagePath, { threshold = 18 } = {}) {
  const { data, info } = await sharp(imagePath)
    .resize(64, 64, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const w = info.width
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, info.height - 1],
    [w - 1, info.height - 1],
  ]
  const samples = corners.map(([x, y]) => {
    const i = (y * w + x) * 3
    return [data[i], data[i + 1], data[i + 2]]
  })

  let maxDiff = 0
  for (let c = 1; c < samples.length; c += 1) {
    for (let ch = 0; ch < 3; ch += 1) {
      maxDiff = Math.max(maxDiff, Math.abs(samples[0][ch] - samples[c][ch]))
    }
  }
  for (const [r, g, b] of samples.slice(1)) {
    for (let ch = 0; ch < 3; ch += 1) {
      const v = [r, g, b][ch]
      maxDiff = Math.max(maxDiff, Math.abs(samples[0][ch] - v))
    }
  }
  return maxDiff < threshold
}

/**
 * Switch CSS background nodes to crop when patterned CSS was wrongly applied on flat ads.
 */
export function applyBackgroundFallback(tree, { flatBackground = false } = {}) {
  if (!flatBackground) return tree
  const updated = JSON.parse(JSON.stringify(tree))
  const frameW = updated.width ?? 1080
  const frameH = updated.height ?? 1080

  updated.children = (updated.children || []).filter((n) => {
    if (n.role !== 'background_fill' && !String(n.id || '').includes('sunburst')) return true
    if (!hasCssBackground(n) && !n.backgroundPreset) return true
    return false
  })

  const hasBgCrop = updated.children.some((n) => n.role === 'background_fill' && RASTER_TYPES.has(n.type))
  if (!hasBgCrop && !treeHasPatternedBackground(updated)) {
    updated.children.unshift({
      id: 'background_crop',
      type: 'image',
      role: 'background_fill',
      renderStrategy: 'crop',
      x: 0,
      y: 0,
      width: frameW,
      height: frameH,
      zIndex: 0,
      renderChoice: 'crop',
      renderChoiceResolved: 'crop',
    })
  }

  return updated
}

/**
 * Per-layer: if shape with cssBackground covers large area on flat bg, mark for crop.
 */
export function applyLayerRenderFallback(tree, { flatBackground = false } = {}) {
  let updated = applyBackgroundFallback(tree, { flatBackground })
  if (!flatBackground) return updated

  for (const node of updated.children || []) {
    if (node.type === 'shape' && hasCssBackground(node) && node.role === 'background_fill') {
      node.renderChoice = 'crop'
      node.renderChoiceResolved = 'crop'
      node.type = 'image'
      node.renderStrategy = 'crop'
      delete node.cssBackground
    }
  }
  return updated
}

/**
 * High-fidelity minimal decomposition: full-frame bg crop + product crop + text primitives only.
 */
export function buildHighFidelityTree(tree, { flatBackground = true } = {}) {
  const updated = JSON.parse(JSON.stringify(tree))
  const frameW = updated.width ?? 1080
  const frameH = updated.height ?? 1080
  const children = []

  if (!flatBackground) {
    const bg = (updated.children || []).find((n) => n.role === 'background_fill' || hasCssBackground(n))
    if (bg) children.push({ ...bg, zIndex: 0 })
  }

  children.push({
    id: 'background_full',
    type: 'image',
    role: 'background_fill',
    renderStrategy: 'crop',
    x: 0,
    y: 0,
    width: frameW,
    height: frameH,
    zIndex: 0,
    objectFit: 'cover',
  })

  const product = (updated.children || []).find(isProductLike)
  if (product) {
    children.push({
      ...product,
      type: 'image',
      role: 'product',
      renderStrategy: 'crop',
      objectFit: 'contain',
      zIndex: 5,
    })
  }

  for (const node of updated.children || []) {
    if (node.type === 'text' || node.type === 'button' || node.type === 'rating') {
      children.push({ ...node, zIndex: Math.max(node.zIndex ?? 20, 15) })
    }
  }

  updated.children = children
  updated._highFidelityMode = true
  return updated
}

/** Simple patch MAE between original crop and rendered region (0–1 similarity). */
export async function scoreLayerRegion(originalPath, renderedPath, node, tree) {
  try {
    const oMeta = await sharp(originalPath).metadata()
    const rMeta = await sharp(renderedPath).metadata()
    if (!oMeta.width || !rMeta.width) return { similarity: 0 }

    const scale = Math.min(oMeta.width / (tree.width || oMeta.width), oMeta.height / (tree.height || oMeta.height))
    const left = Math.max(0, Math.round(node.x * scale))
    const top = Math.max(0, Math.round(node.y * scale))
    const width = Math.min(oMeta.width - left, Math.max(2, Math.round(node.width * scale)))
    const height = Math.min(oMeta.height - top, Math.max(2, Math.round(node.height * scale)))

    const size = 64
    const [oBuf, rBuf] = await Promise.all([
      sharp(originalPath).extract({ left, top, width, height }).resize(size, size, { fit: 'fill' }).removeAlpha().raw().toBuffer(),
      sharp(renderedPath).extract({ left, top, width, height }).resize(size, size, { fit: 'fill' }).removeAlpha().raw().toBuffer(),
    ])

    let sum = 0
    const n = Math.min(oBuf.length, rBuf.length)
    for (let i = 0; i < n; i += 1) sum += Math.abs(oBuf[i] - rBuf[i])
    const mae = sum / n
    const similarity = Math.max(0, 1 - mae / 128)
    return { similarity, mae, needsCropFallback: similarity < 1 - LAYER_MAE_THRESHOLD }
  } catch {
    return { similarity: 0, needsCropFallback: true }
  }
}

export async function applyPerLayerCropFallback(originalPath, renderedPath, tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  let changed = false

  for (const node of updated.children || []) {
    const isCssShape = node.type === 'shape' && hasCssBackground(node)
    const isFilledShape =
      node.type === 'shape' &&
      !isCssShape &&
      (node.fill || node.backgroundColor) &&
      String(node.role || '').match(/overlay|price|badge/)
    if (!isCssShape && !isFilledShape) continue
    if (node.renderChoiceResolved === 'crop') continue
    const score = await scoreLayerRegion(originalPath, renderedPath, node, tree)
    if (score.needsCropFallback) {
      node.renderChoice = 'crop'
      node.renderChoiceResolved = 'crop'
      node.type = 'image'
      node.renderStrategy = 'crop'
      delete node.cssBackground
      changed = true
    }
  }

  return { tree: updated, changed }
}
