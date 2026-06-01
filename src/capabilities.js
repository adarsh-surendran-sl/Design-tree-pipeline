// Renderer capability manifest and generic tree audits (ad-type agnostic).

import { hasCssBackground } from './renderBackground.js'

export const RASTER_TYPES = new Set(['image', 'logo', 'background'])
export const PRIMITIVE_TYPES = new Set(['text', 'button', 'shape', 'badge', 'overlay', 'rating'])

// What the deterministic renderer can faithfully draw
export const RENDERER_CAN = [
  'Solid-fill rectangles and ellipses (optionally rounded, stroked, semi-transparent)',
  'Simple polygons via points[] (diagonal cuts, ribbons, arbitrary flats)',
  'Two-stop linear gradients on shapes (gradientFrom, gradientTo, gradientAngle)',
  'Arbitrary CSS backgrounds on shapes via cssBackground (conic-gradient, repeating-conic-gradient, radial-gradient, layered backgrounds)',
  'Single-line text: system font, bold, left/center/right align',
  'Buttons: rounded rect + centered label',
  'Star ratings: type rating + ratingValue (0–5, half steps)',
  'Image crops: any pixel region copied from the original (photos, icons, chrome, textures)',
]

export const RENDERER_CANNOT = [
  'Photographs, product shots, human faces, detailed illustrations',
  'Logos with gradients, shadows, or fine detail (crop as logo/image unless truly flat)',
  'Custom/brand fonts, curved or outlined text, text on busy textures',
  'Drop shadows, blurs, glows, noise, photographic textures',
  'Non-star icons (cart, play, social) — crop as image',
  'Reflections, lens effects, 3D rendering',
  'Multi-style UI chrome built from many adjacent panels (prefer ONE crop per unified region)',
]

export function capabilityPromptBlock() {
  const can = RENDERER_CAN.map((x) => `  - ${x}`).join('\n')
  const cannot = RENDERER_CANNOT.map((x) => `  - ${x}`).join('\n')
  return (
    `RENDERER CAN:\n${can}\n\n` +
    `RENDERER CANNOT (use type image/logo/background OR renderStrategy crop):\n${cannot}\n\n` +
    `DECISION RULE (renderStrategy on each node):\n` +
    `  - "crop": region copied from original — default for anything in CANNOT list\n` +
    `  - "primitive": built from shapes/text/rating — only for flat, simple regions\n` +
    `  - "auto": you decide; pipeline may convert to crop if needed\n` +
    `Prefer ONE crop per unified visual region (product+reflection, footer strip, hero photo).\n` +
    `Do NOT approximate complex regions with many adjacent rectangles.\n` +
    `Separate each plain text line on solid background into its own text node.\n` +
    `For sunburst / radial-ray / stripe patterns: use type shape + cssBackground (not frame backgroundColor alone).\n` +
    `If unsure whether a region is reproducible with CSS or must be cropped: renderChoice "ambiguous" + renderOptions { css, crop }.\n` +
    ``
  )
}

export function applyConvertToImage(tree, nodeIds) {
  const updated = JSON.parse(JSON.stringify(tree))
  const find = (id) => (updated.children || []).find((n) => n.id === id)
  for (const nid of nodeIds) {
    const node = find(String(nid))
    if (!node) continue
    node.type = 'image'
    node.renderStrategy = 'crop'
  }
  return updated
}

export function resolveRenderStrategy(node) {
  if (node.renderStrategy === 'crop' || node.renderStrategy === 'primitive') return node.renderStrategy
  if (RASTER_TYPES.has(node.type)) return 'crop'
  if (node.type === 'rating') return 'primitive'
  return 'primitive'
}

const _CROP_ROLES = new Set([
  'product',
  'hero',
  'photo',
  'logo',
  'icon',
  'footer',
  'chrome',
  'background',
  'rating',
  'badge',
  'illustration',
  'packshot',
])

export function biasAutoToCrop(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  const frameArea = Math.max(1, updated.width * updated.height)
  for (const node of updated.children || []) {
    if (node.renderStrategy !== 'auto' && node.renderStrategy !== undefined && node.renderStrategy !== null) continue

    const areaRatio = (node.width * node.height) / frameArea
    const role = (node.role || '').toLowerCase()

    if (RASTER_TYPES.has(node.type)) {
      node.renderStrategy = 'crop'
    } else if (_CROP_ROLES.has(role) && areaRatio > 0.02) {
      if (role === 'headline' || role === 'tagline' || role === 'body_text' || role === 'cta') continue
      node.renderStrategy = 'crop'
      node.type = 'image'
    } else if (
      ['shape', 'badge', 'overlay'].includes(node.type) &&
      areaRatio > 0.05 &&
      !hasCssBackground(node) &&
      node.renderChoice !== 'css'
    ) {
      node.renderStrategy = 'crop'
      node.type = 'image'
    } else if ((node.gradientFrom || node.gradientTo) && !hasCssBackground(node) && node.renderChoice !== 'css') {
      node.renderStrategy = 'crop'
      node.type = 'image'
    } else if (hasCssBackground(node) || node.renderChoice === 'css') {
      node.renderStrategy = 'primitive'
      if (node.type === 'image' && node.renderChoice === 'css') node.type = 'shape'
    }
  }
  return updated
}

export function normalizeTreeStrategies(tree) {
  const updated = biasAutoToCrop(tree)
  for (const node of updated.children || []) {
    if (node.renderStrategy === 'crop' || resolveRenderStrategy(node) === 'crop') {
      if (!RASTER_TYPES.has(node.type)) node.type = 'image'
      node.renderStrategy = 'crop'
    } else if (node.renderStrategy === 'primitive') {
      node.renderStrategy = 'primitive'
    }
  }
  return updated
}

function _unionBBox(nodes) {
  let xs = []
  let ys = []
  let x2 = []
  let y2 = []
  for (const n of nodes) {
    xs.push(n.x)
    ys.push(n.y)
    x2.push(n.x + n.width)
    y2.push(n.y + n.height)
  }
  return [Math.min(...xs), Math.min(...ys), Math.max(...x2), Math.max(...y2)]
}

function _bboxArea(x, y, x2, y2) {
  return Math.max(0, x2 - x) * Math.max(0, y2 - y)
}

function _overlaps(a, b) {
  const [ax, ay, ax2, ay2] = a
  const [bx, by, bx2, by2] = b
  return ax < bx2 && ax2 > bx && ay < by2 && ay2 > by
}

export function heuristicAudit(tree) {
  const issues = []

  const children = tree.children || []
  if (!children.length) {
    issues.push({
      code: 'missing_raster',
      message: 'Tree has no children',
      retry_hint: 'Return a complete tree covering the full frame.',
    })
    return issues
  }

  const raster = children.filter((n) => RASTER_TYPES.has(n.type))
  const primitives = children.filter((n) => PRIMITIVE_TYPES.has(n.type))
  const frameArea = Math.max(1, tree.width * tree.height)

  const hasDecorBackground = children.some((n) => {
    const area = (n.width || 0) * (n.height || 0)
    const role = (n.role || '').toLowerCase()
    return (
      role === 'background_fill' ||
      hasCssBackground(n) ||
      (n.type === 'shape' && area >= frameArea * 0.25 && (n.zIndex ?? 0) <= 8)
    )
  })
  const hasProduct = children.some((n) => (n.role || '').toLowerCase() === 'product' || n.type === 'image')
  if (hasProduct && !hasDecorBackground && children.length >= 3) {
    issues.push({
      code: 'missing_background_layer',
      message: 'No background_fill / large shape layer for patterned or gradient backgrounds',
      retry_hint:
        'Add a full-frame or central type shape (role background_fill, zIndex 0-2) with cssBackground ' +
        '(e.g. repeating-conic-gradient for sunburst rays) OR type image crop of the pattern region. ' +
        'Set renderChoice ambiguous with renderOptions if unsure.',
    })
  }

  if (children.length >= 4 && raster.length === 0) {
    issues.push({
      code: 'missing_raster',
      message: 'No image/logo/background crops — likely photographic or complex ad',
      retry_hint:
        'Add type image|logo|background nodes with accurate bounding boxes for every non-flat region: photos, products, icons, textured areas, reflections.',
    })
  }

  // Cluster: many primitives in same vertical band without a covering crop
  const bandH = Math.max(40, tree.height * 0.12)
  const bands = {}
  for (const n of primitives) {
    if (n.type === 'rating') continue
    const key = Math.floor(n.y / bandH)
    bands[key] = bands[key] || []
    bands[key].push(n)
  }

  for (const [key, group] of Object.entries(bands)) {
    if (group.length < 3) continue
    const [ux, uy, ux2, uy2] = _unionBBox(group)
    const union = [ux, uy, ux2, uy2]
    const covered2 = raster.some((r) => {
      const rb = [r.x, r.y, r.x + r.width, r.y + r.height]
      return _overlaps(union, rb)
    })
    const areaRatio = _bboxArea(ux, uy, ux2, uy2) / Math.max(1, tree.width * tree.height)

    if (!covered2 && areaRatio > 0.04) {
      issues.push({
        code: 'primitive_cluster',
        message: `Band ${key}: ${group.length} primitives overlap without an image crop`,
        node_ids: group.map((n) => n.id),
        retry_hint:
          `Replace nodes ${group.map((n) => n.id).slice(0, 5).join(', ')} with ONE type image node ` +
          `covering bbox approximately x=${Math.floor(ux)},y=${Math.floor(uy)},width=${Math.floor(ux2 - ux)},height=${Math.floor(uy2 - uy)} ` +
          'OR use a single polygon shape if it is a flat color diagonal panel only.',
      })
    }
  }

  const textRasters = children.filter(
    (n) =>
      RASTER_TYPES.has(n.type) &&
      (['headline', 'tagline', 'body_text', 'cta'].includes((n.role || '').toLowerCase()) ||
        /headline|tagline|title|header|text|slogan/i.test(String(n.id || ''))),
  )
  if (textRasters.length) {
    issues.push({
      code: 'text_as_raster',
      message: `Typography cropped as image: ${textRasters.map((n) => n.id).join(', ')}`,
      node_ids: textRasters.map((n) => n.id),
      retry_hint:
        'Use type "text" with exact copy for headlines/taglines on patterned backgrounds — do NOT use image crops for plain text.',
    })
  }

  // Rating modeled as small shapes (empty squares problem)
  const bottomCut = tree.height * 0.65
  const starShapes = children.filter(
    (n) =>
      n.y >= bottomCut &&
      n.type === 'shape' &&
      n.width < tree.width * 0.08 &&
      n.height < tree.height * 0.08,
  )
  const hasRating = children.some((n) => n.type === 'rating')
  if (starShapes.length >= 4 && !hasRating) {
    issues.push({
      code: 'rating_as_shapes',
      message: 'Multiple small bottom shapes may be a botched star rating',
      node_ids: starShapes.map((n) => n.id),
      retry_hint:
        'Remove placeholder shapes; add one type "rating" node with ratingValue (e.g. 4.5) OR crop the whole rating strip as type image.',
    })
  }

  // Text nodes overlapping large image without renderStrategy crop on text
  for (const t of children.filter((n) => n.type === 'text' && n.text)) {
    const tb = [t.x, t.y, t.x + t.width, t.y + t.height]
    for (const r of raster) {
      const rb = [r.x, r.y, r.x + r.width, r.y + r.height]
      if (_overlaps(tb, rb) && r.width * r.height > t.width * t.height * 2) {
        issues.push({
          code: 'text_on_photo',
          message: `Text "${t.id}" overlaps image "${r.id}" — label may belong inside crop`,
          node_ids: [t.id, r.id],
          retry_hint: `Expand image node ${r.id} to include text, or remove text node ${t.id} if duplicated.`,
        })
        break
      }
    }
  }

  return issues
}

export function buildRetryPrompt(basePrompt, issues, maxHints = 2) {
  const hints = (issues || []).map((i) => i.retry_hint).filter(Boolean).slice(0, maxHints)
  if (!hints.length) return basePrompt
  return basePrompt + '\n\nAUDIT FIXES REQUIRED:\n' + hints.map((h) => `- ${h}`).join('\n')
}

