/**
 * Deterministic layout fixes before render — clipped text, cropped products, safe zone, pills, shadow.
 */

import { safeMarginForFrame } from './frameFormats.js'

const MIN_PRODUCT_RATIO = 0.4
const MAX_PRODUCT_RATIO = 0.58

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function clampNodeToSafeZone(node, frameW, frameH, margin) {
  const maxW = frameW - margin * 2
  const maxH = frameH - margin * 2
  let w = Math.max(8, node.width ?? 100)
  let h = Math.max(8, node.height ?? 40)
  w = Math.min(w, maxW)
  h = Math.min(h, maxH)
  node.width = Math.round(w)
  node.height = Math.round(h)
  node.x = Math.round(clamp(node.x ?? 0, margin, frameW - margin - node.width))
  node.y = Math.round(clamp(node.y ?? 0, margin, frameH - margin - node.height))
}

function isProductNode(node) {
  return node.role === 'product' || node.id === 'product'
}

function isLogoNode(node) {
  return node.role === 'logo' || node.id === 'logo'
}

function isTextLike(node) {
  return (
    node.type === 'text' ||
    node.type === 'button' ||
    node.role === 'headline' ||
    node.role === 'tagline' ||
    node.role === 'cta'
  )
}

function fitTextToBox(node, frameW) {
  const text = String(node.text || '')
  if (!text) return
  const boxW = node.width ?? 200
  let fs = node.fontSize ?? 24
  const maxFs = node.type === 'button' ? 30 : node.role === 'headline' ? 56 : 34
  const minFs = node.type === 'button' ? 14 : 15
  fs = Math.min(fs, maxFs)

  const charFactor = node.fontWeight === 'bold' ? 0.55 : 0.5
  while (fs > minFs && text.length * fs * charFactor > boxW * 0.92) {
    fs -= 2
  }
  node.fontSize = Math.round(fs)
  const lineH = Math.ceil(fs * 1.22)
  if ((node.height ?? 0) < lineH) node.height = lineH + 4
}

function fixProductPlacement(node, frameW, frameH, margin) {
  const maxW = frameW - margin * 2
  const maxH = frameH - margin * 2 - 140
  let w = frameW * 0.5
  let h = frameH * 0.5
  w = clamp(w, frameW * MIN_PRODUCT_RATIO, maxW)
  h = clamp(h, frameH * MIN_PRODUCT_RATIO, maxH)

  node.width = Math.round(w)
  node.height = Math.round(h)
  node.x = Math.round((frameW - node.width) / 2)
  node.y = Math.round(frameH * 0.28)
  node.y = clamp(node.y, margin, frameH - margin - node.height)
  node.objectFit = 'contain'
  node.type = 'image'
}

function nodeBox(node) {
  return {
    x: node.x ?? 0,
    y: node.y ?? 0,
    width: Math.max(1, node.width ?? 1),
    height: Math.max(1, node.height ?? 1),
  }
}

function boxesOverlap(a, b) {
  const overlapW = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
  const overlapH = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
  return overlapW > 24 && overlapH > 24
}

function reduceTextProductOverlaps(children, product, margin, frameH) {
  if (!product) return
  const productTop = product.y
  for (const node of children) {
    if (!isTextLike(node) || node === product) continue
    if (!boxesOverlap(node, product)) continue
    const pb = nodeBox(product)
    const nb = nodeBox(node)
    if (nb.y + nb.height > productTop && nb.y < productTop + pb.height * 0.85) {
      if (node.y < productTop) {
        node.y = Math.max(margin, productTop - nb.height - 20)
      } else {
        node.y = Math.min(frameH - margin - nb.height, productTop + pb.height + 20)
      }
    }
  }
}

function ensureProductShadow(children, product) {
  if (!product) return
  if (children.some((n) => n.id === 'product_shadow')) return
  const pad = 24
  children.push({
    id: 'product_shadow',
    type: 'shape',
    role: 'decorative',
    shape: 'ellipse',
    x: product.x - pad,
    y: product.y - pad + 12,
    width: product.width + pad * 2,
    height: product.height + pad * 2,
    fill: 'rgba(0,0,0,0.12)',
    zIndex: (product.zIndex ?? 10) - 1,
    opacity: 1,
  })
}

function ensureTextPill(children, textNode, margin) {
  if (!textNode || textNode.role !== 'headline') return
  const pillId = `${textNode.id}_pill`
  if (children.some((n) => n.id === pillId)) return
  children.push({
    id: pillId,
    type: 'shape',
    role: 'decorative',
    shape: 'rect',
    x: textNode.x - 12,
    y: textNode.y - 8,
    width: textNode.width + 24,
    height: textNode.height + 16,
    fill: 'rgba(255,255,255,0.88)',
    borderRadius: 12,
    zIndex: (textNode.zIndex ?? 20) - 1,
  })
}

function applyDefaultFonts(node) {
  if (!isTextLike(node)) return
  if (!node.fontFamily) {
    node.fontFamily =
      node.role === 'headline' || node.type === 'button' ? 'Barlow Condensed, sans-serif' : 'Inter, sans-serif'
  }
}

export function fixDesignTreeLayout(tree, options = {}) {
  const frameW = tree.width ?? 1080
  const frameH = tree.height ?? 1080
  const margin = options.safeMargin ?? safeMarginForFrame(frameW, frameH)
  const updated = JSON.parse(JSON.stringify(tree))
  const children = updated.children || []

  let product = children.find(isProductNode)

  for (const node of children) {
    if (isProductNode(node)) {
      node.objectFit = 'contain'
      if ((node.width ?? 0) < frameW * MIN_PRODUCT_RATIO || (node.height ?? 0) < frameH * MIN_PRODUCT_RATIO) {
        fixProductPlacement(node, frameW, frameH, margin)
      }
      product = node
    }
    if (isLogoNode(node)) node.objectFit = 'contain'
    if (isTextLike(node)) {
      applyDefaultFonts(node)
      fitTextToBox(node, frameW)
      if (node.type === 'text' || node.type === 'button') {
        node.textAlign = node.textAlign || 'center'
      }
    }
    clampNodeToSafeZone(node, frameW, frameH, margin)
  }

  if (product) {
    ensureProductShadow(children, product)
    reduceTextProductOverlaps(children, product, margin, frameH)
  }

  const headline = children.find((n) => n.role === 'headline' || n.id === 'headline')
  if (headline) ensureTextPill(children, headline, margin)

  for (const node of children) {
    clampNodeToSafeZone(node, frameW, frameH, margin)
  }

  updated.children = children.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  return updated
}
