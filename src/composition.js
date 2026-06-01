import { RASTER_TYPES } from './capabilities.js'
import { describeRenderAmbiguities, getAmbiguousNodes } from './renderAmbiguity.js'

/** Standard roles the agent should assign (also used in UI). */
export const ELEMENT_ROLES = [
  'background_fill',
  'product',
  'logo',
  'headline',
  'tagline',
  'body_text',
  'cta',
  'badge',
  'price',
  'rating',
  'icon',
  'decorative',
  'overlay',
]

const FULL_FRAME_RATIO = 0.82

/**
 * Remove a single raster layer that covers almost the entire frame (lazy "paste whole ad").
 * Frame backgroundColor paints the canvas; elements stack on top.
 */
export function sanitizeTreeComposition(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  const frameArea = Math.max(1, updated.width * updated.height)
  const kept = []

  for (const node of updated.children || []) {
    const area = (node.width || 0) * (node.height || 0)
    const isHugeRaster = RASTER_TYPES.has(node.type) && area >= frameArea * FULL_FRAME_RATIO
    if (isHugeRaster) continue
    kept.push(node)
  }

  updated.children = kept

  // Never leave zero layers — that breaks the element editor.
  if (updated.children.length === 0 && (tree.children || []).length > 0) {
    const nonHuge = (tree.children || []).filter((n) => {
      const area = (n.width || 0) * (n.height || 0)
      return !(RASTER_TYPES.has(n.type) && area >= frameArea * FULL_FRAME_RATIO)
    })
    if (nonHuge.length) updated.children = nonHuge
    else {
      // Keep smaller raster layers even if large (e.g. hero product)
      const sorted = [...tree.children].sort(
        (a, b) => b.width * b.height - a.width * a.height,
      )
      updated.children = sorted.slice(0, Math.min(8, sorted.length))
    }
  }

  return updated
}

export function regionsToChildren(regions, frameDefaults = null) {
  if (!Array.isArray(regions) || !regions.length) return []
  return regions.map((r, i) => {
    const st = String(r.suggestedType || r.type || 'image').toLowerCase()
    const type =
      st === 'logo'
        ? 'logo'
        : st === 'background'
          ? 'background'
          : st === 'text'
            ? 'text'
            : st === 'button'
              ? 'button'
              : st === 'rating'
                ? 'rating'
                : st === 'badge'
                  ? 'badge'
                  : 'image'
    return {
      id: r.id || `region_${i + 1}`,
      type,
      role: r.role || st,
      renderStrategy: r.renderStrategy || (type === 'text' ? 'primitive' : 'crop'),
      x: Number(r.x) || 0,
      y: Number(r.y) || 0,
      width: Number(r.width) || (frameDefaults?.width ? frameDefaults.width * 0.5 : 100),
      height: Number(r.height) || (frameDefaults?.height ? frameDefaults.height * 0.2 : 40),
      zIndex: Number(r.zIndex) || i + 1,
      text: r.text || undefined,
    }
  })
}

export function describeElements(tree) {
  const ambiguousIds = new Set(getAmbiguousNodes(tree).map((n) => n.id))
  return (tree.children || []).map((n) => {
    const isText = n.type === 'text' || n.type === 'button'
    const isRaster = RASTER_TYPES.has(n.type)
    const needsRenderChoice = ambiguousIds.has(n.id)
    return {
      id: n.id,
      type: n.type,
      role: n.role || '',
      renderStrategy: n.renderStrategy || 'auto',
      renderChoice: n.renderChoice || (needsRenderChoice ? 'ambiguous' : null),
      needsRenderChoice,
      cssBackground: n.cssBackground || null,
      contentSource: n.contentSource || (isRaster ? 'crop' : 'primitive'),
      x: n.x,
      y: n.y,
      width: n.width,
      height: n.height,
      zIndex: n.zIndex ?? 0,
      text: n.text ?? '',
      color: n.color,
      fontSize: n.fontSize,
      fontWeight: n.fontWeight,
      textAlign: n.textAlign,
      src: n.src ?? null,
      needsUserText: isText && !n.text,
      needsUserImage: isRaster && n.contentSource === 'user' && !n.src,
      editableText: isText,
      editableImage: isRaster,
      editableLayout: true,
    }
  })
}
