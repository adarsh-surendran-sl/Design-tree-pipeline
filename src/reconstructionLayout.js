/**
 * Layout normalization for Image → Tree reconstructions.
 * Preserves vision-estimated bboxes unless layoutPreserving is false.
 */

function isProductNode(node) {
  const role = String(node.role || '').toLowerCase()
  const id = String(node.id || '').toLowerCase()
  return (
    role === 'product' ||
    role === 'logo' ||
    role === 'hero' ||
    id === 'product' ||
    id.includes('product') ||
    id.includes('bottle') ||
    id.includes('hero')
  )
}

function isHeadlineLike(node) {
  const role = (node.role || '').toLowerCase()
  return (
    node.type === 'text' &&
    (role === 'headline' ||
      role === 'tagline' ||
      role === 'subheadline' ||
      String(node.id || '').includes('headline') ||
      String(node.id || '').includes('subheadline'))
  )
}

function isCtaLike(node) {
  return node.type === 'button' || node.role === 'cta' || String(node.id || '').includes('discount')
}

function isPriceLike(node) {
  const role = String(node.role || '').toLowerCase()
  const id = String(node.id || '').toLowerCase()
  return role === 'price' || role === 'badge' || id.includes('price')
}

function headlinesOverlap(headlines) {
  if (headlines.length < 2) return false
  for (let i = 0; i < headlines.length - 1; i += 1) {
    const a = headlines[i]
    const b = headlines[i + 1]
    const ay2 = (a.y ?? 0) + (a.height ?? 0)
    const by = b.y ?? 0
    if (Math.abs(ay2 - by) < 4 && Math.abs((a.x ?? 0) - (b.x ?? 0)) < 20) return true
  }
  return false
}

export function fixReconstructionLayout(tree, { layoutPreserving = true } = {}) {
  const frameW = tree.width ?? 1080
  const updated = JSON.parse(JSON.stringify(tree))
  const children = updated.children || []

  for (const node of children) {
    if (node.align && !node.textAlign) {
      const a = String(node.align).toLowerCase()
      if (a === 'center' || a === 'left' || a === 'right') node.textAlign = a
    }

    if (isProductNode(node)) {
      node.objectFit = 'contain'
      if (!node.role && String(node.id || '').includes('product')) node.role = 'product'
    }

    if (node.type === 'image' && node.renderStrategy === 'crop' && isProductNode(node)) {
      node.objectFit = 'contain'
    }

    if (!layoutPreserving) {
      if (isHeadlineLike(node) || isCtaLike(node)) {
        const spansMostOfFrame = (node.width ?? 0) >= frameW * 0.65
        if (spansMostOfFrame || isHeadlineLike(node)) {
          node.textAlign = node.textAlign || 'center'
        }
        if (node.type === 'text' || node.type === 'button') {
          node.x = Math.round((frameW - (node.width ?? frameW)) / 2)
          node.width = Math.min(node.width ?? frameW, frameW - 40)
          node.x = Math.max(20, Math.round((frameW - node.width) / 2))
        }
      }
    } else {
      if (isPriceLike(node) && !node.textAlign) {
        node.textAlign = 'left'
      }
    }
  }

  updated.children = children.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  return updated
}

export function shouldStackHeadlines(tree) {
  const headlines = (tree.children || []).filter(isHeadlineLike)
  return headlines.length > 1 && headlinesOverlap(headlines)
}
