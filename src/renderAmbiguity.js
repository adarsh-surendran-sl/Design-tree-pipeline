import { RASTER_TYPES } from './capabilities.js'
import { hasCssBackground } from './renderBackground.js'

function isPatternBackground(node) {
  const role = (node.role || '').toLowerCase()
  const id = String(node.id || '').toLowerCase()
  return (
    role === 'background_fill' ||
    id.includes('sunburst') ||
    id.includes('background') ||
    hasCssBackground(node) ||
    hasCssBackground(node.renderOptions?.css)
  )
}

function pickDefaultChoice(node) {
  const opts = node.renderOptions
  if (!opts?.css && !opts?.crop) return null
  if (isPatternBackground(node) && opts.crop) return 'crop'
  if (opts.css && hasCssBackground(opts.css)) return 'css'
  if (opts.css && !opts.crop) return 'css'
  if (opts.crop && !opts.css) return 'crop'
  return 'css'
}

/**
 * Nodes where the agent could not decide CSS primitive vs image crop.
 */
export function getAmbiguousNodes(tree) {
  return (tree.children || []).filter((n) => {
    if (n.renderChoiceResolved === 'css' || n.renderChoiceResolved === 'crop') return false
    if (n.renderChoice === 'css' || n.renderChoice === 'crop') return false
    if (n.renderChoice === 'ambiguous') return true
    const opts = n.renderOptions
    return Boolean(opts?.css && opts?.crop)
  })
}

export function describeRenderAmbiguities(tree) {
  return getAmbiguousNodes(tree).map((n) => {
    const opts = n.renderOptions || {}
    const css = opts.css || {}
    const crop = opts.crop || {}
    return {
      id: n.id,
      role: n.role || '',
      label: n.ambiguityReason || n.role || n.id,
      defaultChoice: n.renderChoiceResolved || n.renderChoice || pickDefaultChoice(n) || 'crop',
      resolved: Boolean(n.renderChoiceResolved),
      css: {
        summary: css.summary || css.cssBackground || 'CSS shape / gradient',
        cssBackground: css.cssBackground || null,
        type: css.type || 'shape',
      },
      crop: {
        summary: crop.summary || 'Crop from original image',
        type: crop.type || 'image',
        role: crop.role || n.role || 'background_fill',
      },
    }
  })
}

function mergeOption(base, option) {
  const out = { ...base }
  for (const [k, v] of Object.entries(option || {})) {
    if (v === undefined || v === null) continue
    if (k === 'summary') continue
    out[k] = v
  }
  return out
}

/**
 * Apply user render choice per node: "css" | "crop".
 * choices: { [nodeId]: "css" | "crop" }
 */
export function applyRenderChoices(tree, choices = {}) {
  const updated = JSON.parse(JSON.stringify(tree))
  for (const node of updated.children || []) {
    let choice = choices[node.id]
    const opts = node.renderOptions

    if (node.renderChoice === 'ambiguous' || (opts?.css && opts?.crop)) {
      if (!choice) choice = node.renderChoiceResolved || pickDefaultChoice(node) || 'crop'
      if (choice === 'css' && opts?.css) {
        Object.assign(node, mergeOption(node, opts.css))
        node.type = opts.css.type || 'shape'
        node.renderStrategy = 'primitive'
        node.renderChoice = 'css'
      } else if (choice === 'crop' && opts?.crop) {
        Object.assign(node, mergeOption(node, opts.crop))
        node.type = opts.crop.type || 'image'
        node.renderStrategy = 'crop'
        node.renderChoice = 'crop'
      }
      delete node.renderOptions
      node.renderChoiceResolved = choice
      continue
    }

    if (node.renderChoice === 'css' || node.renderChoice === 'crop') {
      node.renderChoiceResolved = node.renderChoice
    }
  }
  return updated
}

/** Apply defaults for any still-ambiguous nodes (before raster embed). */
export function resolveAmbiguitiesWithDefaults(tree, choices = {}) {
  const amb = getAmbiguousNodes(tree)
  if (!amb.length) return tree
  const merged = { ...choices }
  for (const n of amb) {
    if (!merged[n.id]) merged[n.id] = pickDefaultChoice(n) || 'crop'
  }
  return applyRenderChoices(tree, merged)
}

export function nodeNeedsCropBeforeEmbed(node) {
  if (node.renderOptions?.css && node.renderOptions?.crop && node.renderChoice !== 'css') {
    if (!node.renderChoiceResolved) return true
  }
  return RASTER_TYPES.has(node.type) && node.renderStrategy !== 'primitive'
}
