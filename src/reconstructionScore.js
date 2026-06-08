import sharp from 'sharp'

import { computeTreeScale } from './frameLock.js'
import { estimateProductBBox, estimateFooterBBox } from './segmentation.js'
import { scoreLayoutPair } from './layoutClient.js'

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

function findPriceNodes(tree) {
  return (tree.children || []).filter((n) => {
    const role = String(n.role || '').toLowerCase()
    return (
      n.type === 'text' &&
      (role === 'price' || (n.text && /₹|\$|€|£|onwards|%/i.test(String(n.text))))
    )
  })
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

function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

async function priceTextMatchScore(tree, layoutAnalysis) {
  if (!tree) return 1
  const priceNodes = findPriceNodes(tree)
  if (!priceNodes.length) return 1

  const ocrTexts = (layoutAnalysis?.regions || [])
    .filter((r) => r.text && (r.role === 'price' || /₹|\$|onwards/i.test(r.text)))
    .map((r) => normalizeText(r.text))

  if (!ocrTexts.length) return 0.85

  const treeText = normalizeText(priceNodes.map((n) => n.text).join(' '))
  const matched = ocrTexts.some((t) => treeText.includes(t) || t.includes(treeText))
  return matched ? 1 : 0.4
}

/**
 * Composite similarity score with aspect-preserving resize and structural checks.
 */
export async function scoreReconstruction(originalPath, renderedPath, tree = null, layoutAnalysis = null) {
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

  let globalPerceptual = global.similarity
  const sidecarScore = await scoreLayoutPair(originalPath, renderedPath)
  if (sidecarScore?.similarity != null) {
    globalPerceptual = sidecarScore.similarity
  }

  const aspectMatch = Math.abs(oW / oH - rW / rH) < 0.02 ? 1 : Math.max(0, 1 - Math.abs(oW / oH - rW / oH))

  let productIoU = 1
  let footerIoU = 1
  if (tree) {
    const product = findProductNode(tree)
    if (product) {
      try {
        const seg = await estimateProductBBox(originalPath)
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

    try {
      const footer = await estimateFooterBBox(originalPath)
      const footerNode = (tree.children || []).find((n) => {
        const role = String(n.role || '').toLowerCase()
        return role === 'overlay' || role === 'price' || String(n.id || '').includes('price_bar')
      })
      if (footer && footerNode) {
        const scale = computeTreeScale(tree, oW, oH)
        const segTree = {
          x: Math.round(footer.left / scale),
          y: Math.round(footer.top / scale),
          width: Math.max(1, Math.round(footer.width / scale)),
          height: Math.max(1, Math.round(footer.height / scale)),
        }
        footerIoU = bboxIoU(
          {
            x: footerNode.x ?? 0,
            y: footerNode.y ?? 0,
            width: footerNode.width ?? 1,
            height: footerNode.height ?? 1,
          },
          segTree,
        )
      }
    } catch {
      footerIoU = 0.85
    }
  }

  const analysis = layoutAnalysis || tree?._layoutMeta?.layoutAnalysis
  const priceTextMatch = await priceTextMatchScore(tree, analysis)

  const composite =
    global.similarity * 0.4 +
    globalPerceptual * 0.15 +
    aspectMatch * 0.15 +
    Math.min(1, productIoU) * 0.15 +
    Math.min(1, footerIoU) * 0.1 +
    priceTextMatch * 0.05

  const needsRetry =
    composite < RECONSTRUCTION_SCORE_RETRY ||
    aspectMatch < 0.9 ||
    (tree && findProductNode(tree) && productIoU < 0.35) ||
    (tree && findPriceNodes(tree).length && footerIoU < 0.4) ||
    priceTextMatch < 0.5

  return {
    similarity: Math.round(composite * 1000) / 1000,
    globalSimilarity: global.similarity,
    globalPerceptual: Math.round(globalPerceptual * 1000) / 1000,
    mae: global.mae,
    aspectMatch: Math.round(aspectMatch * 1000) / 1000,
    productIoU: Math.round(productIoU * 1000) / 1000,
    footerIoU: Math.round(footerIoU * 1000) / 1000,
    priceTextMatch: Math.round(priceTextMatch * 1000) / 1000,
    passes: composite >= RECONSTRUCTION_SCORE_GOOD && aspectMatch >= 0.95,
    needsRetry,
  }
}
