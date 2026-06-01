/**
 * Layout normalization for Image → Tree reconstructions.
 * Preserves vision-estimated bboxes; fixes common LLM mistakes (alignment, objectFit).
 */

function isProductNode(node) {
  return node.role === 'product' || node.id === 'product' || String(node.id || '').includes('product')
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

export function fixReconstructionLayout(tree) {
  const frameW = tree.width ?? 1080
  const frameH = tree.height ?? 1080
  const updated = JSON.parse(JSON.stringify(tree))
  const children = updated.children || []

  for (const node of children) {
    if (node.align && !node.textAlign) {
      const a = String(node.align).toLowerCase()
      if (a === 'center' || a === 'left' || a === 'right') node.textAlign = a
    }

    if (isProductNode(node) || (node.type === 'image' && node.renderStrategy === 'crop' && !isCtaLike(node))) {
      if (isProductNode(node) || String(node.id || '').includes('bottle')) {
        node.objectFit = 'contain'
        node.role = node.role || 'product'
      }
    }

    if (isHeadlineLike(node) || isCtaLike(node)) {
      const spansMostOfFrame = (node.width ?? 0) >= frameW * 0.65
      if (spansMostOfFrame || isHeadlineLike(node)) {
        node.textAlign = 'center'
      }
      if (node.type === 'text' || node.type === 'button') {
        node.x = Math.round((frameW - (node.width ?? frameW)) / 2)
        node.width = Math.min(node.width ?? frameW, frameW - 40)
        node.x = Math.max(20, Math.round((frameW - node.width) / 2))
      }
    }

    if (isProductNode(node)) {
      node.objectFit = 'contain'
    }
  }

  updated.children = children.sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  return updated
}
