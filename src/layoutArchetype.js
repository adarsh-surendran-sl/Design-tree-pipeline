/**
 * Classify ad layout archetype from tree heuristics (no extra LLM call).
 */

export const ARCHETYPES = {
  productHero: 'productHero',
  priceBanner: 'priceBanner',
  typographyLed: 'typographyLed',
  fullBleedPhoto: 'fullBleedPhoto',
  verticalStory: 'verticalStory',
  general: 'general',
}

function hasRole(tree, roles) {
  const set = new Set(roles.map((r) => r.toLowerCase()))
  return (tree.children || []).some((n) => set.has(String(n.role || '').toLowerCase()))
}

function hasHeadline(tree) {
  return (tree.children || []).some((n) => {
    const role = String(n.role || '').toLowerCase()
    const id = String(n.id || '').toLowerCase()
    return role === 'headline' || role === 'tagline' || id.includes('headline')
  })
}

function hasPatternedBackground(tree) {
  return (tree.children || []).some((n) => {
    const bg = String(n.cssBackground || '')
    return bg.includes('conic') || bg.includes('gradient') || n.role === 'background_fill'
  })
}

function hasLargeBackgroundCrop(tree) {
  const frameArea = Math.max(1, (tree.width || 1) * (tree.height || 1))
  return (tree.children || []).some((n) => {
    if (!['image', 'background'].includes(n.type)) return false
    const area = (n.width || 0) * (n.height || 0)
    return area >= frameArea * 0.45 && (n.role === 'background_fill' || n.zIndex <= 3)
  })
}

/**
 * @returns {{ archetype: string, compareFocus: string[], layoutPreserving: boolean, skipBackgroundAudit: boolean }}
 */
export function classifyAdLayout(tree) {
  const w = tree.width ?? 1080
  const h = tree.height ?? 1080
  const aspect = w / Math.max(1, h)
  const children = tree.children || []
  const frameArea = Math.max(1, w * h)

  const productNodes = children.filter(
    (n) => n.role === 'product' || String(n.id || '').includes('product') || String(n.id || '').includes('bottle'),
  )
  const priceNodes = children.filter((n) => {
    const role = String(n.role || '').toLowerCase()
    const id = String(n.id || '').toLowerCase()
    return role === 'price' || id.includes('price') || (n.text && /₹|\$|€|£|onwards|%/i.test(String(n.text)))
  })
  const textCount = children.filter((n) => n.type === 'text' || n.type === 'button').length
  const hasPriceBar = children.some((n) => {
    const role = String(n.role || '').toLowerCase()
    return (
      (n.type === 'shape' && (role === 'badge' || role === 'overlay' || role === 'price')) ||
      (n.y ?? 0) > h * 0.65
    )
  })

  let archetype = ARCHETYPES.general
  let compareFocus = ['background_fill', 'product', 'headline', 'cta', 'price', 'badge', 'overlay']
  let layoutPreserving = true
  let skipBackgroundAudit = false

  if (aspect < 0.85 || h > w * 1.15) {
    archetype = ARCHETYPES.verticalStory
  }

  if (productNodes.length >= 1 && !hasHeadline(tree) && textCount <= 3 && (priceNodes.length || hasPriceBar)) {
    archetype = ARCHETYPES.productHero
    compareFocus = ['product', 'price', 'badge', 'overlay', 'background_fill']
    skipBackgroundAudit = true
  }

  if (priceNodes.length >= 1 || hasRole(tree, ['price'])) {
    archetype = ARCHETYPES.priceBanner
    compareFocus = ['price', 'product', 'badge', 'overlay', 'background_fill']
    layoutPreserving = true
    skipBackgroundAudit = true
  }

  if (hasHeadline(tree) && (hasPatternedBackground(tree) || textCount >= 3)) {
    archetype = ARCHETYPES.typographyLed
    compareFocus = ['headline', 'tagline', 'background_fill', 'product', 'cta']
    layoutPreserving = false
  }

  if (hasLargeBackgroundCrop(tree)) {
    archetype = ARCHETYPES.fullBleedPhoto
    compareFocus = ['background_fill', 'product', 'headline', 'cta']
    skipBackgroundAudit = true
  }

  const productArea = productNodes.reduce((s, n) => s + (n.width || 0) * (n.height || 0), 0)
  if (productNodes.length === 1 && productArea > frameArea * 0.15 && textCount <= 2 && !hasHeadline(tree)) {
    archetype = ARCHETYPES.productHero
    skipBackgroundAudit = true
  }

  return { archetype, compareFocus, layoutPreserving, skipBackgroundAudit }
}

export function archetypePromptSuffix(archetype) {
  switch (archetype) {
    case ARCHETYPES.productHero:
      return (
        'LAYOUT: Product hero / packshot ad. Center product bbox from cap to base shadow. ' +
        'Price strip at bottom as shape + text (role price). Small badges (e.g. 15ml) as overlay near product. ' +
        'Do NOT invent headline or logo if absent. Flat background → backgroundColor only.'
      )
    case ARCHETYPES.priceBanner:
      return (
        'LAYOUT: Price banner ad. Full-width footer bar as shape; price text as type text role price. ' +
        'Angled price tag → shape polygon with points[]. Do not center price unless original is centered.'
      )
    case ARCHETYPES.typographyLed:
      return (
        'LAYOUT: Typography-led FMCG ad. Separate text layers for each line. Patterned bg → shape cssBackground behind text.'
      )
    case ARCHETYPES.fullBleedPhoto:
      return 'LAYOUT: Photo/lifestyle background. Prefer background_fill as image crop, not CSS gradient.'
    case ARCHETYPES.verticalStory:
      return 'LAYOUT: Vertical/story format. Stack regions top-to-bottom; do not assume headline is in top 40%.'
    default:
      return ''
  }
}
