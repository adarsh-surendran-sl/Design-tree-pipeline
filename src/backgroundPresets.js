/**
 * Curated CSS background presets for ad reconstruction (sunburst, radial, stripes).
 */

export const BACKGROUND_PRESETS = {
  sunburst_lime: {
    id: 'sunburst_lime',
    label: 'Lime sunburst (12° rays)',
    css: (c1 = '#8fd420', c2 = '#6aac0c', cx = 50, cy = 55, step = 12) =>
      `repeating-conic-gradient(from 0deg at ${cx}% ${cy}%, ${c1} 0deg ${step}deg, ${c2} ${step}deg ${step * 2}deg)`,
  },
  sunburst_soft: {
    id: 'sunburst_soft',
    label: 'Soft sunburst (18° rays)',
    css: (c1 = '#aed581', c2 = '#7cb342', cx = 50, cy = 50, step = 18) =>
      `repeating-conic-gradient(from 0deg at ${cx}% ${cy}%, ${c1} 0deg ${step}deg, ${c2} ${step}deg ${step * 2}deg)`,
  },
  radial_glow: {
    id: 'radial_glow',
    label: 'Radial glow',
    css: (c1 = '#9ccc65', c2 = '#558b2f', cx = 50, cy = 48) =>
      `radial-gradient(circle at ${cx}% ${cy}%, ${c1} 0%, ${c2} 72%, ${c2} 100%)`,
  },
  vertical_stripes: {
    id: 'vertical_stripes',
    label: 'Vertical stripes',
    css: (c1 = '#c5e1a5', c2 = '#8bc34a') =>
      `repeating-linear-gradient(90deg, ${c1} 0px, ${c1} 24px, ${c2} 24px, ${c2} 48px)`,
  },
}

function isBackgroundNode(node) {
  const role = (node.role || '').toLowerCase()
  const id = String(node.id || '').toLowerCase()
  return (
    role === 'background_fill' ||
    id.includes('sunburst') ||
    id.includes('background') ||
    id.includes('bg_') ||
    id === 'bg'
  )
}

function looksLikeSunburst(node) {
  const bg = String(node.cssBackground || '').toLowerCase()
  return bg.includes('conic') || bg.includes('sunburst') || bg.includes('ray')
}

function inferColors(tree, node) {
  const base = tree.backgroundColor || node.fill || '#8fd420'
  const alt = node.gradientTo || node.gradientFrom || shadeHex(base, -0.12)
  return { c1: base, c2: alt }
}

function shadeHex(hex, amount) {
  const h = String(hex).replace('#', '')
  if (h.length !== 6) return hex
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + amount * 255)))
  return `#${[f(r), f(g), f(b)].map((x) => x.toString(16).padStart(2, '0')).join('')}`
}

/** Apply or upgrade background layers with preset CSS. */
export function applyBackgroundPresets(tree, { presetId = 'sunburst_lime', skipNodeIds = new Set() } = {}) {
  const updated = JSON.parse(JSON.stringify(tree))
  const preset = BACKGROUND_PRESETS[presetId] || BACKGROUND_PRESETS.sunburst_lime
  const frameW = updated.width ?? 1080
  const frameH = updated.height ?? 1080
  const colors = inferColors(updated, {})

  let bgNode = (updated.children || []).find(
    (n) => isBackgroundNode(n) && n.type === 'shape' && !skipNodeIds.has(n.id),
  )

  if (!bgNode) {
    bgNode = {
      id: 'background_sunburst',
      type: 'shape',
      role: 'background_fill',
      renderStrategy: 'primitive',
      shape: 'rect',
      x: 0,
      y: 0,
      width: frameW,
      height: frameH,
      zIndex: 0,
    }
    updated.children = [bgNode, ...(updated.children || [])]
  }

  for (const node of updated.children || []) {
    if (skipNodeIds.has(node.id)) continue
    if (node.renderChoiceResolved === 'crop' || node.renderChoice === 'crop') continue
    if (!isBackgroundNode(node) && node.type !== 'shape') continue
    if (!isBackgroundNode(node) && !looksLikeSunburst(node)) continue
    if ((node.width ?? 0) < frameW * 0.5 && (node.height ?? 0) < frameH * 0.5) continue

    node.type = 'shape'
    node.role = 'background_fill'
    node.renderStrategy = 'primitive'
    node.shape = 'rect'
    node.x = 0
    node.y = 0
    node.width = frameW
    node.height = frameH
    node.zIndex = Math.min(node.zIndex ?? 0, 2)
    node.cssBackground = preset.css(colors.c1, colors.c2)
    node.backgroundPreset = preset.id
    delete node.gradientFrom
    delete node.gradientTo
  }

  return updated
}

export function listBackgroundPresets() {
  return Object.values(BACKGROUND_PRESETS).map((p) => ({ id: p.id, label: p.label }))
}
