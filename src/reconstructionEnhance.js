import { applyBackgroundPresets } from './backgroundPresets.js'
import { RASTER_TYPES } from './capabilities.js'

const HEADLINE_FONT = 'Barlow Condensed, sans-serif'
const BODY_FONT = 'Inter, system-ui, sans-serif'

function isProductNode(node) {
  return node.role === 'product' || String(node.id || '').includes('product')
}

function isHeadlineNode(node) {
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

function isCtaRaster(node, frameH) {
  if (node.type !== 'image' && node.type !== 'background') return false
  const id = String(node.id || '').toLowerCase()
  const role = (node.role || '').toLowerCase()
  const bottom = (node.y ?? 0) > frameH * 0.72
  return bottom && (id.includes('discount') || id.includes('cta') || role === 'cta' || role === 'badge')
}

/** Promote bottom discount strips from image crops to editable buttons. */
export function convertCtaRasterToButton(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  const frameW = updated.width ?? 1080
  const frameH = updated.height ?? 1080
  const kept = []

  for (const node of updated.children || []) {
    if (!isCtaRaster(node, frameH)) {
      kept.push(node)
      continue
    }

    const text = node.ctaText || node.text || guessCtaText(node)
    kept.push({
      id: node.id.includes('cta') ? node.id : `${node.id}_cta`,
      type: 'button',
      role: 'cta',
      renderStrategy: 'primitive',
      text,
      x: node.x ?? Math.round(frameW * 0.2),
      y: node.y ?? Math.round(frameH * 0.88),
      width: node.width ?? Math.round(frameW * 0.6),
      height: Math.max(node.height ?? 56, 48),
      zIndex: Math.max(node.zIndex ?? 20, 15),
      fontSize: node.fontSize ?? 22,
      fontWeight: 'bold',
      fontFamily: BODY_FONT,
      textAlign: 'center',
      color: node.color || '#111111',
      backgroundColor: node.backgroundColor || '#f5f0d8',
      borderRadius: node.borderRadius ?? 4,
    })
  }

  updated.children = kept
  return updated
}

function guessCtaText(node) {
  const id = String(node.id || '').toLowerCase()
  if (id.includes('discount')) return 'Enjoy 30% Discount'
  return 'Shop Now'
}

/** Headline / subheadline typography and roles. */
export function applyReconstructionTypography(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  const headlines = (updated.children || []).filter(isHeadlineNode).sort((a, b) => (a.y ?? 0) - (b.y ?? 0))

  for (let i = 0; i < headlines.length; i += 1) {
    const node = headlines[i]
    if (i === 0) node.role = node.role || 'headline'
    else node.role = node.role || 'tagline'
    node.fontFamily = HEADLINE_FONT
    node.fontWeight = 'bold'
    node.textAlign = 'center'
    if (!node.fontSize) node.fontSize = i === 0 ? 96 : 58
    if (i === 1 && headlines[0]?.fontSize) {
      node.fontSize = Math.round(headlines[0].fontSize * 0.58)
    }
    node.color = node.color || '#f0f8d8'
  }

  for (const node of updated.children || []) {
    if (node.type === 'button' || node.role === 'cta') {
      node.fontFamily = node.fontFamily || BODY_FONT
      node.textAlign = 'center'
    }
    if (isProductNode(node)) {
      node.objectFit = 'contain'
    }
  }

  return updated
}

/** Keep headline lines as separate centered nodes with consistent width. */
export function stackHeadlineLines(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  const frameW = updated.width ?? 1080
  const headlines = (updated.children || []).filter(isHeadlineNode).sort((a, b) => (a.y ?? 0) - (b.y ?? 0))
  if (!headlines.length) return updated

  const boxW = Math.round(frameW * 0.92)
  const boxX = Math.round((frameW - boxW) / 2)
  let y = headlines[0].y ?? Math.round((updated.height ?? 1080) * 0.04)

  for (const node of headlines) {
    node.x = boxX
    node.width = boxW
    node.textAlign = 'center'
    node.y = Math.round(y)
    y += (node.height ?? 80) + 8
  }

  return updated
}

/** Remove narrow vertical panels that are not in the original (common LLM mistake). */
export function removeNarrowBackgroundPanels(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  const frameW = updated.width ?? 1080
  const frameH = updated.height ?? 1080
  const kept = []

  for (const node of updated.children || []) {
    const role = (node.role || '').toLowerCase()
    const w = node.width ?? 0
    const h = node.height ?? 0
    const isNarrowPanel =
      node.type === 'shape' &&
      role !== 'product' &&
      w > 0 &&
      w < frameW * 0.55 &&
      h >= frameH * 0.5 &&
      w < h * 0.65 &&
      !String(node.cssBackground || '').includes('repeating-conic')
    if (isNarrowPanel) continue
    kept.push(node)
  }

  updated.children = kept
  return updated
}

function isRenderChoiceLocked(node) {
  return Boolean(
    node.renderChoiceResolved ||
      node.renderChoice === 'css' ||
      node.renderChoice === 'crop',
  )
}

/** Add renderOptions for background when only CSS exists without crop fallback. */
export function ensureBackgroundRenderOptions(tree) {
  const updated = JSON.parse(JSON.stringify(tree))
  const frameW = updated.width ?? 1080
  const frameH = updated.height ?? 1080

  for (const node of updated.children || []) {
    if (isRenderChoiceLocked(node)) continue
    const role = (node.role || '').toLowerCase()
    if (role !== 'background_fill' && !String(node.id || '').includes('sunburst')) continue
    if (node.renderOptions?.css && node.renderOptions?.crop) continue

    const cssOpts = {
      type: 'shape',
      role: 'background_fill',
      cssBackground: node.cssBackground,
      summary: 'CSS sunburst / gradient',
    }
    const cropOpts = {
      type: 'image',
      role: 'background_fill',
      x: 0,
      y: 0,
      width: frameW,
      height: frameH,
      summary: 'Full-frame background crop from original',
    }

    if (node.cssBackground && !node.renderOptions) {
      node.renderOptions = { css: cssOpts, crop: cropOpts }
      node.renderChoice = node.renderChoice || 'ambiguous'
    }
  }

  return updated
}

/**
 * Run all deterministic reconstruction enhancements (no LLM).
 */
export function enhanceReconstructionTree(tree, options = {}) {
  const { skipReambiguous = false, respectRenderChoices = false } = options
  let t = JSON.parse(JSON.stringify(tree))
  t = removeNarrowBackgroundPanels(t)
  if (!respectRenderChoices) {
    t = applyBackgroundPresets(t, { presetId: options.backgroundPreset || 'sunburst_lime' })
  } else {
    t = applyBackgroundPresets(t, {
      presetId: options.backgroundPreset || 'sunburst_lime',
      skipNodeIds: new Set(
        (t.children || [])
          .filter((n) => n.renderChoiceResolved === 'crop' || n.renderChoice === 'crop')
          .map((n) => n.id),
      ),
    })
  }
  t = convertCtaRasterToButton(t)
  t = applyReconstructionTypography(t)
  t = stackHeadlineLines(t)
  if (!skipReambiguous) t = ensureBackgroundRenderOptions(t)
  return t
}
