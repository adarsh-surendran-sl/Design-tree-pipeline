import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

import { buildCompareStrip } from './assets.js'
import { classifyAdLayout } from './layoutArchetype.js'

const ROLE_FOCUS_MAP = {
  product: ['product'],
  price: ['price'],
  badge: ['badge', 'overlay'],
  overlay: ['overlay', 'badge'],
  footer: ['price', 'overlay'],
  background_fill: ['background_fill'],
  headline: ['headline', 'tagline'],
}

function findNodesForFocus(tree, focusKey) {
  const roles = ROLE_FOCUS_MAP[focusKey] || [focusKey]
  return (tree.children || []).filter((n) => {
    const role = String(n.role || '').toLowerCase()
    const id = String(n.id || '').toLowerCase()
    return roles.some((r) => role === r || id.includes(r))
  })
}

function padBox(node, frameW, frameH, padRatio = 0.08) {
  const padX = Math.round((node.width || 0) * padRatio)
  const padY = Math.round((node.height || 0) * padRatio)
  const x = Math.max(0, (node.x ?? 0) - padX)
  const y = Math.max(0, (node.y ?? 0) - padY)
  const x2 = Math.min(frameW, (node.x ?? 0) + (node.width ?? 0) + padX)
  const y2 = Math.min(frameH, (node.y ?? 0) + (node.height ?? 0) + padY)
  return { left: x, top: y, width: Math.max(2, x2 - x), height: Math.max(2, y2 - y) }
}

async function extractRegionStrip(originalPath, renderedPath, box, outPath) {
  const [oMeta, rMeta] = await Promise.all([sharp(originalPath).metadata(), sharp(renderedPath).metadata()])
  const oW = oMeta.width || 1
  const oH = oMeta.height || 1
  const scaleX = oW / (rMeta.width || oW)
  const scaleY = oH / (rMeta.height || oH)

  const left = Math.max(0, Math.min(oW - 2, Math.round(box.left)))
  const top = Math.max(0, Math.min(oH - 2, Math.round(box.top)))
  const width = Math.min(oW - left, Math.max(2, Math.round(box.width)))
  const height = Math.min(oH - top, Math.max(2, Math.round(box.height)))

  const rLeft = Math.max(0, Math.round(left / scaleX))
  const rTop = Math.max(0, Math.round(top / scaleY))
  const rW = Math.min((rMeta.width || oW) - rLeft, Math.max(2, Math.round(width / scaleX)))
  const rH = Math.min((rMeta.height || oH) - rTop, Math.max(2, Math.round(height / scaleY)))

  const oCrop = path.join(path.dirname(outPath), `_o_${path.basename(outPath)}`)
  const rCrop = path.join(path.dirname(outPath), `_r_${path.basename(outPath)}`)
  await sharp(originalPath).extract({ left, top, width, height }).png().toFile(oCrop)
  await sharp(renderedPath).extract({ left: rLeft, top: rTop, width: rW, height: rH }).png().toFile(rCrop)
  await buildCompareStrip(oCrop, rCrop, outPath)
  try {
    fs.unlinkSync(oCrop)
    fs.unlinkSync(rCrop)
  } catch {
    /* ignore */
  }
  return outPath
}

export function multiRegionCompareEnabled(highAccuracy = true) {
  if (process.env.RECONSTRUCTION_MULTI_REGION_COMPARE === '0') return false
  if (process.env.RECONSTRUCTION_MULTI_REGION_COMPARE === '1') return true
  return highAccuracy
}

/**
 * Build regional compare strips for product, footer/price, badge.
 * @returns {Promise<{ paths: string[], labels: string[] }>}
 */
export async function buildRegionalCompareStrips(originalPath, renderedPath, tree, compareDir, layoutMeta = null) {
  const layout = layoutMeta || classifyAdLayout(tree)
  const focusKeys =
    layout.archetype === 'productHero' || layout.archetype === 'priceBanner'
      ? ['product', 'footer', 'badge']
      : ['product', 'background_fill', 'headline']

  const frameW = tree.width ?? 1080
  const frameH = tree.height ?? 1080
  const paths = []
  const labels = []

  fs.mkdirSync(compareDir, { recursive: true })

  for (const key of focusKeys) {
    const nodes = findNodesForFocus(tree, key)
    if (!nodes.length) continue
    let minX = frameW
    let minY = frameH
    let maxX = 0
    let maxY = 0
    for (const n of nodes) {
      const b = padBox(n, frameW, frameH)
      minX = Math.min(minX, b.left)
      minY = Math.min(minY, b.top)
      maxX = Math.max(maxX, b.left + b.width)
      maxY = Math.max(maxY, b.top + b.height)
    }
    if (maxX <= minX || maxY <= minY) continue

    const outPath = path.join(compareDir, `_compare_region_${key}.png`)
    await extractRegionStrip(originalPath, renderedPath, {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
    }, outPath)
    paths.push(outPath)
    labels.push(key)
  }

  return { paths, labels }
}
