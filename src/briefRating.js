import { safeMarginForFrame } from './frameFormats.js'

/** Parse user star rating (0–5, half steps allowed). Returns null if empty/invalid. */
export function parseStarRating(value) {
  if (value === undefined || value === null || value === '') return null
  const n = Number(String(value).trim())
  if (!Number.isFinite(n)) return null
  const clamped = Math.max(0, Math.min(5, n))
  return Math.round(clamped * 2) / 2
}

/**
 * When brief includes a star rating, ensure the design tree has a rating node with that value.
 */
export function ensureBriefRatingNode(tree, brief) {
  const stars = parseStarRating(brief?.rating)
  if (stars == null) return tree

  const updated = JSON.parse(JSON.stringify(tree))
  const frameW = updated.width ?? 1080
  const frameH = updated.height ?? 1080
  const margin = safeMarginForFrame(frameW, frameH)
  const children = updated.children || []

  let node = children.find(
    (n) => n.id === 'rating' || n.type === 'rating' || n.role === 'rating',
  )

  if (!node) {
    node = {
      id: 'rating',
      type: 'rating',
      role: 'rating',
      renderStrategy: 'primitive',
      ratingValue: stars,
      x: margin,
      y: margin + 40,
      width: Math.round(frameW * 0.2),
      height: 36,
      zIndex: 26,
      color: '#F5B301',
    }
    children.push(node)
  } else {
    node.type = 'rating'
    node.role = node.role || 'rating'
    node.ratingValue = stars
    if (!node.color) node.color = '#F5B301'
  }

  updated.children = children
  return updated
}
