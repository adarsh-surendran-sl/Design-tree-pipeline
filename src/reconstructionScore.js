import sharp from 'sharp'

import { computeTreeScale } from './frameLock.js'
import { estimateForegroundBBox } from './segmentation.js'

export const RECONSTRUCTION_SCORE_GOOD = 0.82
export const RECONSTRUCTION_SCORE_RETRY = 0.72

async function letterboxResize(inputPath, targetW, targetH) {
  const meta = await sharp(inputPath).metadata()
  if (!meta.width || !meta.height) throw new Error('Missing dimensions')

  const scale = Math.min(targetW / meta.width, targetH / meta.height)
  const w = Math.round(meta.width * scale)
  const h = Math.round(meta.height * scale)
  const left = Math.round((targetW - w) / 2)
  const top = Math.round((targetH - h) / 2)

  const resized = await sharp(inputPath).resize(w, h, { fit: 'inside' }).removeAlpha().png().toBuffer()
  return sharp({
    create: { width: targetW, height: targetH, channels: 3, background: { r: 32, g: 32, b: 32 } },
  })
    .composite([{ input: resized, left, top }])
    .removeAlpha()
    .raw()
    .toBuffer()
}

function maeSimilarity(bufA, bufB) {
  const n = Math.min(bufA.length, bufB.length)
  if (!n) return { similarity: 0, mae: 255 }
  let sum = 0
  for (let i = 0; i < n; i += 1) sum += Math.abs(bufA[i] - bufB[i])
  const mae = sum / n
  const similarity = Math.max(0, Math.min(1, 1 - mae / 128))
  return { similarity: Math.round(similarity * 1000) / 1000, mae: Math.round(mae * 10) / 10 }
}

function findProductNode(tree) {
  return (tree.children || []).find(
    (n) =>
      n.role === 'product' ||
      String(n.id || '').includes('product') ||
      String(n.id || '').includes('bottle'),
  )
}

function bboxIoU(a, b) {
  const ax2 = a.x + a.width
  const ay2 = a.y + a.height
  const bx2 = b.x + b.width
  const by2 = b.y + b.height
  const ix = Math.max(0, Math.min(ax2, bx2) - Math.max(a.x, b.x))
  const iy = Math.max(0, Math.min(ay2, by2) - Math.max(a.y, b.y))
  const inter = ix * iy
  const union = a.width * a.height + b.width * b.height - inter
  return union > 0 ? inter / union : 0
}

/**
 * Composite similarity score with aspect-preserving resize and structural checks.
 */
export async function scoreReconstruction(originalPath, renderedPath, tree = null) {
  const [oMeta, rMeta] = await Promise.all([sharp(originalPath).metadata(), sharp(renderedPath).metadata()])
  const oW = oMeta.width || 1
  const oH = oMeta.height || 1
  const rW = rMeta.width || 1
  const rH = rMeta.height || 1

  const size = 256
  const [oBuf, rBuf] = await Promise.all([
    letterboxResize(originalPath, size, size),
    letterboxResize(renderedPath, size, size),
  ])

  const global = maeSimilarity(oBuf, rBuf)

  const aspectMatch = Math.abs(oW / oH - rW / rH) < 0.02 ? 1 : Math.max(0, 1 - Math.abs(oW / oH - rW / rH))

  let productIoU = 1
  if (tree) {
    const product = findProductNode(tree)
    if (product) {
      try {
        const seg = await estimateForegroundBBox(originalPath)
        if (seg) {
          const scale = computeTreeScale(tree, oW, oH)
          const segTree = {
            x: Math.round(seg.left / scale),
            y: Math.round(seg.top / scale),
            width: Math.max(1, Math.round(seg.width / scale)),
            height: Math.max(1, Math.round(seg.height / scale)),
          }
          productIoU = bboxIoU(
            { x: product.x ?? 0, y: product.y ?? 0, width: product.width ?? 1, height: product.height ?? 1 },
            segTree,
          )
        }
      } catch {
        productIoU = 0.5
      }
    }
  }

  const composite =
    global.similarity * 0.55 + aspectMatch * 0.25 + Math.min(1, productIoU) * 0.2

  const needsRetry =
    composite < RECONSTRUCTION_SCORE_RETRY ||
    aspectMatch < 0.9 ||
    (tree && findProductNode(tree) && productIoU < 0.35)

  return {
    similarity: Math.round(composite * 1000) / 1000,
    globalSimilarity: global.similarity,
    mae: global.mae,
    aspectMatch: Math.round(aspectMatch * 1000) / 1000,
    productIoU: Math.round(productIoU * 1000) / 1000,
    passes: composite >= RECONSTRUCTION_SCORE_GOOD && aspectMatch >= 0.95,
    needsRetry,
  }
}
