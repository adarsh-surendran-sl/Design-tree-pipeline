/**
 * Post-LLM layout quality pass — no fixed zones; resolves collisions and enforces brief fidelity.
 */

import { safeMarginForFrame } from './frameFormats.js'
import { parseStarRating } from './briefRating.js'

const TEXT_ROLES = new Set(['headline', 'tagline', 'body_text', 'cta', 'price', 'badge'])

const ROLE_STACK_PRIORITY = {
  headline: 1,
  tagline: 2,
  badge: 3,
  price: 4,
  body_text: 5,
  cta: 6,
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n))
}

function isTextLike(node) {
  return node.type === 'text' || node.type === 'button' || TEXT_ROLES.has(node.role)
}

function isProduct(node) {
  return node.role === 'product' || node.id === 'product'
}

function isLogo(node) {
  return node.role === 'logo' || node.id === 'logo'
}

function box(node) {
  return {
    x: node.x ?? 0,
    y: node.y ?? 0,
    width: Math.max(1, node.width ?? 1),
    height: Math.max(1, node.height ?? 1),
    zIndex: node.zIndex ?? 0,
  }
}

function overlapArea(a, b) {
  const overlapW = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x))
  const overlapH = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y))
  return overlapW * overlapH
}

function hexLuminance(hex) {
  const h = String(hex || '#ffffff').replace('#', '')
  if (h.length < 6) return 1
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function rolePriority(node) {
  if (node.role && ROLE_STACK_PRIORITY[node.role] != null) return ROLE_STACK_PRIORITY[node.role]
  if (node.id === 'headline') return 1
  if (node.id === 'tagline') return 2
  if (node.id === 'cta') return 6
  if (node.type === 'button') return 6
  return 50
}

/** Drop empty copy layers and useless placeholder buttons. */
export function removeEmptyNodes(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  updated.children = (updated.children || []).filter((node) => {
    if (node.type === 'button' || node.role === 'cta') return true
    if (isTextLike(node)) {
      const t = String(node.text ?? '').trim()
      if (!t) return false
    }
    return true
  })
  return updated
}

/** Lock user brief copy onto matching roles (no paraphrasing). */
export function applyBriefContentLock(tree, brief) {
  if (!brief) return tree
  const updated = JSON.parse(JSON.stringify(tree))
  const children = updated.children || []

  const setTextByRole = (role, text) => {
    if (!text) return
    const nodes = children.filter((n) => n.role === role || (role === 'headline' && n.id === 'headline'))
    for (const node of nodes) {
      if (!isTextLike(node)) continue
      const current = String(node.text ?? '').trim()
      if (!current || current.length < 3) node.text = String(text).trim()
      else if (role === 'headline') node.text = String(text).trim()
    }
  }

  if (brief.title) setTextByRole('headline', brief.title)

  if (brief.tagline) setTextByRole('tagline', brief.tagline)

  if (brief.discount) {
    for (const node of children.filter((n) => n.role === 'badge' || n.id?.includes('badge'))) {
      if (isTextLike(node) && !String(node.text || '').includes('%')) {
        node.text = String(brief.discount).trim()
      }
    }
  }

  const priceNodes = children.filter((n) => n.role === 'price' || n.id?.includes('price'))
  if (brief.offerPrice && priceNodes.length) {
    const now = priceNodes.find((n) => String(n.text || '').toLowerCase().includes('now')) || priceNodes[0]
    if (now) now.text = `NOW ${brief.offerPrice}`
  }
  if (brief.salePrice && priceNodes.length >= 1) {
    const was =
      priceNodes.find((n) => String(n.text || '').toLowerCase().includes('was')) ||
      priceNodes[priceNodes.length > 1 ? 1 : 0]
    if (was) was.text = `WAS ${brief.salePrice}`
  }

  return updated
}

/** Push overlapping text blocks apart (designer-chosen x/y preserved when possible). */
export function resolveTextCollisions(tree, { gap = 16, maxPasses = 4 } = {}) {
  let updated = JSON.parse(JSON.stringify(tree))
  const frameH = updated.height ?? 1080
  const margin = safeMarginForFrame(updated.width ?? 1080, frameH)

  for (let pass = 0; pass < maxPasses; pass += 1) {
    const children = updated.children || []
    const texts = children
      .filter(isTextLike)
      .sort((a, b) => rolePriority(a) - rolePriority(b) || (a.y ?? 0) - (b.y ?? 0))

    let moved = false
    for (let i = 0; i < texts.length; i += 1) {
      for (let j = i + 1; j < texts.length; j += 1) {
        const a = texts[i]
        const b = texts[j]
        if (overlapArea(box(a), box(b)) < 100) continue

        const lower = rolePriority(a) >= rolePriority(b) ? a : b
        const upper = lower === a ? b : a
        const upperBox = box(upper)
        const lowerBox = box(lower)
        const newY = upperBox.y + upperBox.height + gap
        if (newY + lowerBox.height > frameH - margin) {
          lower.y = Math.max(margin, upperBox.y - lowerBox.height - gap)
        } else {
          lower.y = newY
        }
        lower.y = Math.round(clamp(lower.y, margin, frameH - margin - lowerBox.height))
        moved = true
      }
    }
    if (!moved) break
  }

  return updated
}

/** Demote decorative stripes that cut through the product hero. */
export function demoteIntrusiveDecorations(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  const frameW = updated.width ?? 1080
  const frameH = updated.height ?? 1080
  const product = (updated.children || []).find(isProduct)

  for (const node of updated.children || []) {
    if (node.type !== 'shape' || node.role === 'background_fill') continue
    const w = node.width ?? 0
    const h = node.height ?? 0
    const thinVertical = w <= 28 && h >= frameH * 0.55
    const thinHorizontal = h <= 28 && w >= frameW * 0.55
    if (thinVertical || thinHorizontal) {
      node.zIndex = Math.min(node.zIndex ?? 2, 2)
      node.opacity = Math.min(node.opacity ?? 1, 0.35)
    }
    if (product && overlapArea(box(node), box(product)) > box(product).width * box(product).height * 0.35) {
      node.zIndex = Math.min(node.zIndex ?? 2, 1)
      node.opacity = Math.min(node.opacity ?? 1, 0.2)
    }
  }
  return updated
}

/** Light backing plate behind logo on dark backgrounds. */
export function ensureLogoContrast(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  const bg = updated.backgroundColor || '#ffffff'
  const darkBg = hexLuminance(bg) < 0.42
  if (!darkBg) return updated

  const children = updated.children || []
  const logo = children.find(isLogo)
  if (!logo) return updated

  const pad = 10
  const plateId = 'logo_backing'
  if (!children.some((n) => n.id === plateId)) {
    children.push({
      id: plateId,
      type: 'shape',
      role: 'decorative',
      shape: 'rect',
      x: (logo.x ?? 0) - pad,
      y: (logo.y ?? 0) - pad,
      width: (logo.width ?? 100) + pad * 2,
      height: (logo.height ?? 60) + pad * 2,
      fill: 'rgba(255,255,255,0.92)',
      borderRadius: 8,
      zIndex: (logo.zIndex ?? 30) - 1,
    })
  }

  updated.children = children
  return updated
}

/** Ensure CTA buttons always have visible label text. */
export function ensureCtaLabels(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  for (const node of updated.children || []) {
    if (node.type !== 'button' && node.role !== 'cta' && node.id !== 'cta') continue
    if (!String(node.text ?? '').trim()) {
      node.text = 'Shop Now'
      node.type = 'button'
      node.role = node.role || 'cta'
    }
  }
  return updated
}

/** Nudge CTA toward bottom safe area without fixing exact position. */
export function nudgeCtaToBottomBand(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  const frameH = updated.height ?? 1080
  const margin = safeMarginForFrame(updated.width ?? 1080, frameH)
  const ctas = (updated.children || []).filter(
    (n) => n.type === 'button' || n.role === 'cta' || n.id === 'cta',
  )
  if (!ctas.length) return updated

  for (const cta of ctas) {
    const targetY = frameH - margin - (cta.height ?? 48) - 80
    if ((cta.y ?? 0) < targetY - 120) {
      cta.y = Math.round(clamp(targetY, margin, frameH - margin - (cta.height ?? 48)))
    }
  }
  return updated
}

export function validateLayoutQuality(tree) {
  const children = tree.children || []
  const issues = []
  let overlapPixels = 0

  const texts = children.filter(isTextLike)
  for (let i = 0; i < texts.length; i += 1) {
    for (let j = i + 1; j < texts.length; j += 1) {
      const area = overlapArea(box(texts[i]), box(texts[j]))
      if (area > 80) {
        overlapPixels += area
        issues.push(`text_overlap:${texts[i].id}:${texts[j].id}`)
      }
    }
  }

  const emptyCta = children.some(
    (n) =>
      (n.type === 'button' || n.role === 'cta') &&
      !String(n.text ?? '').trim(),
  )
  if (emptyCta) issues.push('empty_cta')

  const bg = tree.backgroundColor || '#fff'
  const logo = children.find(isLogo)
  const logoLowContrast = Boolean(logo && hexLuminance(bg) < 0.42 && !children.some((n) => n.id === 'logo_backing'))
  if (logoLowContrast) issues.push('logo_low_contrast')

  const product = children.find(isProduct)
  if (product) {
    const ph = box(product).height
    if (ph < (tree.height ?? 1080) * 0.32) issues.push('product_too_small')
  }

  const score = Math.max(
    0,
    10 - overlapPixels / 8000 - issues.length * 0.8 - (emptyCta ? 3 : 0) - (logoLowContrast ? 1.5 : 0),
  )

  return { score, issues, overlapPixels }
}

/** Full deterministic quality pass after LLM layout (no fixed zones). */
export function polishDesignQuality(tree, brief) {
  let t = ensureCtaLabels(tree)
  t = applyBriefContentLock(t, brief)
  t = removeEmptyNodes(t)
  t = resolveTextCollisions(t)
  t = demoteIntrusiveDecorations(t)
  t = ensureLogoContrast(t)
  t = ensureCtaLabels(t)
  t = nudgeCtaToBottomBand(t)

  const stars = parseStarRating(brief?.rating)
  if (stars != null) {
    const ratingNode = (t.children || []).find(
      (n) => n.id === 'rating' || n.type === 'rating' || n.role === 'rating',
    )
    if (ratingNode) ratingNode.ratingValue = stars
  }

  t.children = (t.children || []).sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  return t
}
