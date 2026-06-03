import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

import { checkMcpHealth } from './mcpClient.js'
import { removeBackgroundToFile } from './backgroundRemoval.js'
import { sourcePixelsToTreeBox, treeBoxToSourcePixels } from './frameLock.js'

async function sampleBackgroundColor(imagePath, threshold = 28) {
  const img = sharp(imagePath)
  const meta = await img.metadata()
  const srcW = meta.width || 0
  const srcH = meta.height || 0
  if (!srcW || !srcH) return null

  const sampleW = Math.round(256 * (srcW / Math.max(srcW, srcH)))
  const sampleH = Math.round(256 * (srcH / Math.max(srcW, srcH)))

  const { data, info } = await img
    .resize(sampleW, sampleH, { fit: 'inside' })
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

  return {
    br: Math.round(br / n),
    bg: Math.round(bg / n),
    bb: Math.round(bb / n),
    srcW,
    srcH,
    sampleW: w,
    sampleH: h,
    threshold,
  }
}

function isNonBgPixel(data, x, y, w, bg, threshold, channels = 4) {
  const i = (y * w + x) * channels
  const dr = Math.abs(data[i] - bg.br)
  const dg = Math.abs(data[i + 1] - bg.bg)
  const db = Math.abs(data[i + 2] - bg.bb)
  return dr + dg + db >= threshold
}

function scaleBboxToSource(bbox, region, srcW, srcH) {
  const scaleX = srcW / region.sampleW
  const scaleY = srcH / region.sampleH
  return {
    left: Math.round(bbox.left * scaleX),
    top: Math.round(bbox.top * scaleY),
    width: Math.round(bbox.width * scaleX),
    height: Math.round(bbox.height * scaleY),
  }
}

function analyzeRegionRows(data, w, h, bg, threshold, channels = 4) {
  const rows = []
  for (let y = 0; y < h; y += 1) {
    let minX = w
    let maxX = -1
    let count = 0
    for (let x = 0; x < w; x += 1) {
      if (!isNonBgPixel(data, x, y, w, bg, threshold, channels)) continue
      count += 1
      if (x < minX) minX = x
      if (x > maxX) maxX = x
    }
    const span = maxX >= minX ? maxX - minX + 1 : 0
    rows.push({ count, span, spanRatio: w > 0 ? span / w : 0 })
  }
  return rows
}

/**
 * Estimate product bounds via corner-sampled background subtraction (no ML).
 */
export async function estimateForegroundBBox(imagePath, { sampleSize = 256, threshold = 28 } = {}) {
  const bg = await sampleBackgroundColor(imagePath, threshold)
  if (!bg) return null

  const { data, info } = await sharp(imagePath)
    .resize(bg.sampleW, bg.sampleH, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const w = info.width
  const h = info.height
  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  let hits = 0

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (!isNonBgPixel(data, x, y, w, bg, threshold)) continue
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

  return scaleBboxToSource(
    { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
    { sampleW: w, sampleH: h },
    bg.srcW,
    bg.srcH,
  )
}

/**
 * Product-only bbox: excludes footer price bar and badge strips from foreground.
 */
export async function estimateProductBBox(imagePath, { threshold = 28 } = {}) {
  const fg = await estimateForegroundBBox(imagePath, { threshold })
  if (!fg) return null

  const bg = await sampleBackgroundColor(imagePath, threshold)
  if (!bg) return fg

  const regionW = Math.min(256, Math.max(32, fg.width))
  const regionH = Math.min(256, Math.max(32, fg.height))
  const { data, info } = await sharp(imagePath)
    .extract({ left: fg.left, top: fg.top, width: fg.width, height: fg.height })
    .resize(regionW, regionH, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const w = info.width
  const h = info.height
  const rows = analyzeRegionRows(data, w, h, bg, threshold, 3)

  let footerStart = h
  for (let y = h - 1; y >= 0; y -= 1) {
    const row = rows[y]
    if (row.spanRatio > 0.62 && row.count > w * 0.04) {
      footerStart = y
    } else if (footerStart < h && y < footerStart - 4) {
      break
    }
  }

  let productBottom = footerStart
  for (let y = Math.max(0, footerStart - 10); y < footerStart; y += 1) {
    const row = rows[y]
    if (row.count > 0 && row.spanRatio < 0.55) {
      productBottom = Math.min(productBottom, y)
    }
  }

  const centerCol = Math.floor(w * 0.5)
  const halfBand = Math.round(w * 0.38)

  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  for (let y = 0; y < productBottom; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (!isNonBgPixel(data, x, y, w, bg, threshold, 3)) continue
      if (Math.abs(x - centerCol) > halfBand) continue
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
  }

  if (maxX < minX || maxY < minY) {
    minX = w
    minY = h
    maxX = 0
    maxY = 0
    for (let y = 0; y < productBottom; y += 1) {
      for (let x = 0; x < w; x += 1) {
        if (!isNonBgPixel(data, x, y, w, bg, threshold, 3)) continue
        if (x < minX) minX = x
        if (y < minY) minY = y
        if (x > maxX) maxX = x
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < minX || maxY < minY) return fg

  const pad = 2
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(w - 1, maxX + pad)
  maxY = Math.min(h - 1, maxY + pad)

  const scaleX = fg.width / w
  const scaleY = fg.height / h

  return {
    left: fg.left + Math.round(minX * scaleX),
    top: fg.top + Math.round(minY * scaleY),
    width: Math.round((maxX - minX + 1) * scaleX),
    height: Math.round((maxY - minY + 1) * scaleY),
  }
}

/** Footer price strip bbox (full-width band at bottom of foreground). */
export async function estimateFooterBBox(imagePath, fg = null, { threshold = 28 } = {}) {
  const foreground = fg || (await estimateForegroundBBox(imagePath, { threshold }))
  if (!foreground) return null

  const bg = await sampleBackgroundColor(imagePath, threshold)
  if (!bg) return null

  const regionW = Math.min(256, Math.max(32, foreground.width))
  const regionH = Math.min(256, Math.max(32, foreground.height))
  const { data, info } = await sharp(imagePath)
    .extract({ left: foreground.left, top: foreground.top, width: foreground.width, height: foreground.height })
    .resize(regionW, regionH, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const w = info.width
  const h = info.height
  const rows = analyzeRegionRows(data, w, h, bg, threshold, 3)

  let footerStart = h
  for (let y = h - 1; y >= 0; y -= 1) {
    const row = rows[y]
    if (row.spanRatio > 0.62 && row.count > w * 0.04) {
      footerStart = y
    } else if (footerStart < h && y < footerStart - 4) {
      break
    }
  }

  if (footerStart >= h) return null

  const scaleX = foreground.width / w
  const scaleY = foreground.height / h
  const top = foreground.top + Math.round(footerStart * scaleY)
  const height = Math.max(4, foreground.top + foreground.height - top)

  return {
    left: foreground.left,
    top,
    width: foreground.width,
    height,
  }
}

/** Small badge bbox (e.g. 15ml) above footer, partial width. */
export async function estimateBadgeBBox(imagePath, fg = null, { threshold = 28 } = {}) {
  const foreground = fg || (await estimateForegroundBBox(imagePath, { threshold }))
  if (!foreground) return null

  const footer = await estimateFooterBBox(imagePath, foreground, { threshold })
  const bg = await sampleBackgroundColor(imagePath, threshold)
  if (!bg) return null

  const regionW = Math.min(256, Math.max(32, foreground.width))
  const regionH = Math.min(256, Math.max(32, foreground.height))
  const { data, info } = await sharp(imagePath)
    .extract({ left: foreground.left, top: foreground.top, width: foreground.width, height: foreground.height })
    .resize(regionW, regionH, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const w = info.width
  const h = info.height
  const footerStartY = footer
    ? Math.round(((footer.top - foreground.top) / foreground.height) * h)
    : Math.round(h * 0.78)
  const scanTop = Math.max(0, footerStartY - Math.round(h * 0.22))
  const scanBottom = footerStartY

  let bandMinX = w
  let bandMinY = h
  let bandMaxX = 0
  let bandMaxY = 0
  let bandRows = 0

  for (let y = scanTop; y < scanBottom; y += 1) {
    let rowMin = w
    let rowMax = -1
    let rowCount = 0
    for (let x = 0; x < w; x += 1) {
      if (!isNonBgPixel(data, x, y, w, bg, threshold, 3)) continue
      rowCount += 1
      if (x < rowMin) rowMin = x
      if (x > rowMax) rowMax = x
    }
    const span = rowMax >= rowMin ? rowMax - rowMin + 1 : 0
    if (rowCount === 0 || span > w * 0.72) continue
    if (span < w * 0.08 || span > w * 0.5) continue
    bandRows += 1
    if (rowMin < bandMinX) bandMinX = rowMin
    if (y < bandMinY) bandMinY = y
    if (rowMax > bandMaxX) bandMaxX = rowMax
    if (y > bandMaxY) bandMaxY = y
  }

  if (bandRows < 2 || bandMaxX < bandMinX || bandMaxY < bandMinY) return null

  const scaleX = foreground.width / w
  const scaleY = foreground.height / h

  return {
    left: foreground.left + Math.round(bandMinX * scaleX),
    top: foreground.top + Math.round(bandMinY * scaleY),
    width: Math.round((bandMaxX - bandMinX + 1) * scaleX),
    height: Math.max(8, Math.round((bandMaxY - bandMinY + 1) * scaleY)),
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

  const updated = JSON.parse(JSON.stringify(tree))
  const node = updated.children.find((n) => n.id === product.id)
  if (!node) return tree

  const treeBox = sourcePixelsToTreeBox(bbox, srcW, srcH, updated)
  node.x = treeBox.x
  node.y = treeBox.y
  node.width = treeBox.width
  node.height = treeBox.height
  node.objectFit = 'contain'
  node.segmentationSource = 'heuristic'

  return updated
}

function bboxArea(b) {
  return (b?.width || 0) * (b?.height || 0)
}

function unionSourceBboxes(a, b) {
  const x1 = Math.min(a.left, b.left)
  const y1 = Math.min(a.top, b.top)
  const x2 = Math.max(a.left + a.width, b.left + b.width)
  const y2 = Math.max(a.top + a.height, b.top + b.height)
  return { left: x1, top: y1, width: x2 - x1, height: y2 - y1 }
}

/**
 * Optional MCP background removal → trim transparent PNG for tight product bounds.
 * Preserves existing LLM bbox when MCP result is smaller (likely over-tight).
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

    const mcpBbox = { left: Math.round((srcW - tw) / 2), top: Math.round((srcH - th) / 2 * 0.95), width: tw, height: th }
    const existingArea = (product.width || 0) * (product.height || 0)
    const mcpTreeBox = sourcePixelsToTreeBox(mcpBbox, srcW, srcH, tree)
    const mcpArea = mcpTreeBox.width * mcpTreeBox.height

    const updated = JSON.parse(JSON.stringify(tree))
    const node = updated.children.find((n) => n.id === product.id)
    if (!node) return tree

    if (existingArea > 0 && mcpArea < existingArea * 0.55) {
      return tree
    }

    node.x = mcpTreeBox.x
    node.y = mcpTreeBox.y
    node.width = mcpTreeBox.width
    node.height = mcpTreeBox.height
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
  const srcW = meta.width
  const srcH = meta.height
  const productBbox = await estimateProductBBox(imagePath)
  let updated = applySegmentationBBoxToTree(tree, productBbox, srcW, srcH)

  const product = findProductNode(updated)
  if (product && productBbox) {
    const segArea = bboxArea(productBbox)
    const nodeArea = (product.width || 0) * (product.height || 0)
    if (nodeArea > 0 && segArea < nodeArea * 0.35) {
      updated = tree
    } else {
      const existingProduct = findProductNode(tree)
      const existingPx = existingProduct ? treeBoxToSourcePixels(existingProduct, srcW, srcH, tree) : null
      const merged = existingPx ? unionSourceBboxes(productBbox, existingPx) : productBbox
      updated = applySegmentationBBoxToTree(updated, merged, srcW, srcH)
    }
  }

  if (opts.tryMcp) {
    updated = await refineProductBboxViaMcp(imagePath, updated, opts)
  }
  return updated
}
