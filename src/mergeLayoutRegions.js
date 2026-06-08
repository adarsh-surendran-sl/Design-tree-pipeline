import { regionsToChildren } from './composition.js'

/**
 * @typedef {Object} LayoutRegion
 * @property {string} id
 * @property {string} [class]
 * @property {string} [role]
 * @property {number[]} bbox [x0,y0,x1,y1] source pixels
 * @property {number} [confidence]
 * @property {string} [text]
 * @property {string} [renderStrategy]
 * @property {string} [suggestedType]
 */

/**
 * @typedef {Object} LayoutAnalysis
 * @property {number} width
 * @property {number} height
 * @property {string} [backgroundColor]
 * @property {LayoutRegion[]} regions
 * @property {string[]} [reading_order]
 */

export function bboxToRegionFields(bbox) {
  const [x0, y0, x1, y1] = bbox.map(Math.round)
  return {
    x: x0,
    y: y0,
    width: Math.max(1, x1 - x0),
    height: Math.max(1, y1 - y0),
  }
}

/** Convert layout service regions to region-segment plan for enrich step. */
export function layoutRegionsToPlan(analysis) {
  if (!analysis?.regions?.length) return null
  const regions = analysis.regions.map((r, i) => {
    const box = bboxToRegionFields(r.bbox || [0, 0, 100, 100])
    const st = r.suggestedType || r.class || 'image'
    return {
      id: r.id || `layout_${i + 1}`,
      renderStrategy: r.renderStrategy || (st === 'text' ? 'primitive' : 'crop'),
      suggestedType: st,
      role: r.role || r.class || 'overlay',
      ...box,
      zIndex: r.zIndex ?? i + 1,
      text: r.text,
    }
  })
  return {
    type: 'frame',
    width: analysis.width,
    height: analysis.height,
    backgroundColor: analysis.backgroundColor || '#ffffff',
    regions,
    _layoutSource: 'sidecar',
  }
}

function findProductInRegions(regions) {
  return regions.find((r) => {
    const role = String(r.role || '').toLowerCase()
    return role === 'product' || String(r.id || '').includes('product')
  })
}

function regionArea(r) {
  const b = r.bbox || []
  return Math.max(0, (b[2] - b[0]) * (b[3] - b[1]))
}

/** Never shrink product bbox below sidecar estimate. */
export function enforceProductBboxFromLayout(tree, analysis) {
  if (!analysis?.regions?.length) return tree
  const layoutProduct = findProductInRegions(analysis.regions)
  if (!layoutProduct?.bbox) return tree

  const updated = JSON.parse(JSON.stringify(tree))
  const product = (updated.children || []).find(
    (n) => n.role === 'product' || String(n.id || '').includes('product'),
  )
  if (!product) return tree

  const box = bboxToRegionFields(layoutProduct.bbox)
  const layoutArea = box.width * box.height
  const nodeArea = (product.width || 0) * (product.height || 0)
  if (nodeArea < layoutArea * 0.85) {
    product.x = box.x
    product.y = box.y
    product.width = box.width
    product.height = box.height
    product.objectFit = 'contain'
    product.segmentationSource = 'layout_sidecar'
  }
  return updated
}

/** Merge OCR text from layout into existing text nodes or add new ones. */
export function applyOcrFromLayout(tree, analysis, { minConfidence = 0.5 } = {}) {
  if (!analysis?.regions?.length) return tree
  const updated = JSON.parse(JSON.stringify(tree))
  const children = [...(updated.children || [])]

  for (const r of analysis.regions) {
    if (!r.text || (r.confidence != null && r.confidence < minConfidence)) continue
    const role = String(r.role || '').toLowerCase()
    if (!['price', 'badge', 'headline', 'tagline', 'body_text', 'cta'].includes(role) && !/price|badge/i.test(r.id || '')) {
      continue
    }
    const box = bboxToRegionFields(r.bbox || [0, 0, 50, 20])
    const existing = children.find(
      (n) => n.id === r.id || (n.role === role && role === 'price' && /₹|\$|onwards/i.test(String(n.text || r.text))),
    )
    if (existing) {
      existing.type = 'text'
      existing.renderStrategy = 'primitive'
      existing.text = r.text
      existing.role = role
      if (!existing.fontSize) existing.fontSize = role === 'price' ? 28 : 22
      continue
    }
    children.push({
      id: r.id || `ocr_${role}`,
      type: 'text',
      role,
      renderStrategy: 'primitive',
      text: r.text,
      ...box,
      zIndex: 20,
      fontSize: role === 'price' ? 28 : 20,
      color: '#111111',
      textAlign: 'left',
    })
  }

  updated.children = dedupeOverlappingRasters(children, analysis)
  return updated
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

/** Remove image crops that overlap OCR text regions heavily. */
export function dedupeOverlappingRasters(children, analysis) {
  const textBoxes = (analysis.regions || [])
    .filter((r) => r.text)
    .map((r) => bboxToRegionFields(r.bbox || [0, 0, 1, 1]))

  return children.filter((n) => {
    if (n.type !== 'image' && n.type !== 'badge') return true
    const nb = { x: n.x ?? 0, y: n.y ?? 0, width: n.width ?? 0, height: n.height ?? 0 }
    for (const tb of textBoxes) {
      if (bboxIoU(nb, tb) > 0.5 && (n.height ?? 0) < (tb.height ?? 0) * 2) return false
    }
    return true
  })
}

/**
 * Seed children from layout plan; returns { plan, children } for enrich.
 */
export function mergeLayoutIntoTreePlan(analysis, frameDefaults) {
  const plan = layoutRegionsToPlan(analysis)
  if (!plan) return null
  const children = regionsToChildren(plan.regions, frameDefaults)
  return { plan, children }
}

export function getLayoutMetaFromAnalysis(analysis) {
  if (!analysis) return null
  return {
    layoutAnalysis: analysis,
    footerBbox: analysis.regions?.find((r) => ['overlay', 'price'].includes(String(r.role)))?.bbox,
  }
}
