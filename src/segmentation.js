import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

import { checkMcpHealth } from './mcpClient.js'
import { removeBackgroundToFile } from './backgroundRemoval.js'

/**
 * Estimate product bounds via corner-sampled background subtraction (no ML).
 * Returns bbox in source image pixels: { left, top, width, height }.
 */
export async function estimateForegroundBBox(imagePath, { sampleSize = 256, threshold = 28 } = {}) {
  const img = sharp(imagePath)
  const meta = await img.metadata()
  const srcW = meta.width || 0
  const srcH = meta.height || 0
  if (!srcW || !srcH) return null

  const { data, info } = await img
    .resize(sampleSize, sampleSize, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const w = info.width
  const h = info.height
  const corners = [
    [0, 0],
    [w - 1, 0],
    [0, h - 1],
    [w - 1, h - 1],
  ]
  let br = 0
  let bg = 0
  let bb = 0
  let n = 0
  for (const [cx, cy] of corners) {
    const i = (cy * w + cx) * 4
    br += data[i]
    bg += data[i + 1]
    bb += data[i + 2]
    n += 1
  }
  br = Math.round(br / n)
  bg = Math.round(bg / n)
  bb = Math.round(bb / n)

  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  let hits = 0

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4
      const dr = Math.abs(data[i] - br)
      const dg = Math.abs(data[i + 1] - bg)
      const db = Math.abs(data[i + 2] - bb)
      if (dr + dg + db < threshold) continue
      hits += 1
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }

  if (hits < w * h * 0.02) return null

  const pad = 2
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(w - 1, maxX + pad)
  maxY = Math.min(h - 1, maxY + pad)

  const scaleX = srcW / w
  const scaleY = srcH / h

  return {
    left: Math.round(minX * scaleX),
    top: Math.round(minY * scaleY),
    width: Math.round((maxX - minX + 1) * scaleX),
    height: Math.round((maxY - minY + 1) * scaleY),
  }
}

function findProductNode(tree) {
  return (tree.children || []).find(
    (n) => n.role === 'product' || String(n.id || '').includes('product') || String(n.id || '').includes('bottle'),
  )
}

/** Merge segmentation bbox into product node (frame coordinates). */
export function applySegmentationBBoxToTree(tree, bbox, srcW, srcH) {
  if (!bbox) return tree
  const product = findProductNode(tree)
  if (!product) return tree

  const scaleX = (tree.width || srcW) / srcW
  const scaleY = (tree.height || srcH) / srcH
  const updated = JSON.parse(JSON.stringify(tree))
  const node = updated.children.find((n) => n.id === product.id)
  if (!node) return tree

  node.x = Math.round(bbox.left * scaleX)
  node.y = Math.round(bbox.top * scaleY)
  node.width = Math.round(bbox.width * scaleX)
  node.height = Math.round(bbox.height * scaleY)
  node.objectFit = 'contain'
  node.segmentationSource = 'heuristic'

  return updated
}

/**
 * Optional MCP background removal → trim transparent PNG for tight product bounds.
 */
export async function refineProductBboxViaMcp(imagePath, tree, { jobDir, publicBaseUrl, jobId } = {}) {
  if (!(await checkMcpHealth())) return tree
  if (!publicBaseUrl || !jobId) return tree

  const product = findProductNode(tree)
  if (!product) return tree

  const assetsDir = path.join(jobDir, 'assets')
  fs.mkdirSync(assetsDir, { recursive: true })
  const outPath = path.join(assetsDir, '_segment_product.png')

  try {
    await removeBackgroundToFile(imagePath, outPath, { publicBaseUrl, jobId, crop: true })
    const trimmed = await sharp(outPath).trim().toBuffer({ resolveWithObject: true })
    const meta = await sharp(imagePath).metadata()
    const srcW = meta.width || tree.width
    const srcH = meta.height || tree.height

    const tw = trimmed.info.width
    const th = trimmed.info.height
    if (!tw || !th) return tree

    const scaleX = (tree.width || srcW) / srcW
    const scaleY = (tree.height || srcH) / srcH
    const updated = JSON.parse(JSON.stringify(tree))
    const node = updated.children.find((n) => n.id === product.id)

    node.x = Math.round(((srcW - tw) / 2) * scaleX)
    node.y = Math.round(((srcH - th) / 2) * scaleY * 0.95)
    node.width = Math.round(tw * scaleX)
    node.height = Math.round(th * scaleY)
    node.objectFit = 'contain'
    node.segmentationSource = 'mcp_remove_background'

    return updated
  } catch (e) {
    console.warn('MCP segmentation skipped:', e?.message || e)
    return tree
  }
}

export async function refineProductBboxFromSegmentation(imagePath, tree, opts = {}) {
  const meta = await sharp(imagePath).metadata()
  const bbox = await estimateForegroundBBox(imagePath)
  let updated = applySegmentationBBoxToTree(tree, bbox, meta.width, meta.height)
  if (opts.tryMcp) {
    updated = await refineProductBboxViaMcp(imagePath, updated, opts)
  }
  return updated
}
