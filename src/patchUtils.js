import { normalizePoints, normalizeShape, normalizeTreeDict } from './normalize.js'
import { coercePatch, parseDesignTree, parsePatches } from './schemas.js'

const ALLOWED_PATCH_KEYS = new Set([
  'x',
  'y',
  'width',
  'height',
  'text',
  'fontSize',
  'color',
  'backgroundColor',
  'fill',
  'zIndex',
  'textAlign',
  'fontWeight',
  'opacity',
  'borderRadius',
  'shape',
  'type',
  'renderStrategy',
  'role',
  'objectFit',
  'ratingValue',
  'points',
  'gradientFrom',
  'gradientTo',
  'gradientAngle',
  'cssBackground',
  'renderChoice',
  'fontFamily',
])

export function mergePatches(patches) {
  const normalized = Array.isArray(patches)
    ? parsePatches({ patches })
    : parsePatches(patches)

  const merged = new Map()
  const order = []
  for (const p of normalized) {
    const coerced = coercePatch(p) || p
    const element = coerced?.element
    const changes = coerced?.changes
    if (!element || !changes || typeof changes !== 'object') continue
    if (!merged.has(element)) {
      merged.set(element, {})
      order.push(element)
    }
    for (const [k, v] of Object.entries(changes)) {
      if (ALLOWED_PATCH_KEYS.has(k) && v !== undefined) merged.get(element)[k] = v
    }
  }
  return order
    .filter((el) => merged.get(el) && Object.keys(merged.get(el)).length)
    .map((el) => ({ element: el, changes: merged.get(el) }))
}

function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(value, hi))
}

export function sanitizeChanges(node, tree, changes) {
  const out = {}
  const fw = Number(tree.width)
  const fh = Number(tree.height)

  for (const [key, value] of Object.entries(changes || {})) {
    if (!ALLOWED_PATCH_KEYS.has(key)) continue
    out[key] = value
  }

  if ('width' in out) out.width = clamp(Number(out.width), 1, fw)
  if ('height' in out) out.height = clamp(Number(out.height), 1, fh)

  if ('x' in out) {
    const w = Number(out.width ?? node.width)
    out.x = clamp(Number(out.x), 0, Math.max(0, fw - w))
  }
  if ('y' in out) {
    const h = Number(out.height ?? node.height)
    out.y = clamp(Number(out.y), 0, Math.max(0, fh - h))
  }

  if ('fontSize' in out) out.fontSize = clamp(Number(out.fontSize), 6, 400)
  if ('opacity' in out) out.opacity = clamp(Number(out.opacity), 0, 1)
  if ('zIndex' in out) out.zIndex = parseInt(out.zIndex, 10)

  if ('points' in out) out.points = normalizePoints(out.points)
  if ('shape' in out) {
    const normalized = normalizeShape(out.shape)
    if (normalized) out.shape = normalized
    else delete out.shape
  }

  return out
}

export function applyPatchesSafe(tree, patches) {
  const t = typeof tree?.model_dump_json === 'function' ? tree : parseDesignTree(tree)
  const updated = JSON.parse(JSON.stringify(t))

  const merged = mergePatches(
    Array.isArray(patches) ? { patches } : patches,
  )
  for (const p of merged) {
    const node = (updated.children || []).find((n) => n.id === p.element)
    if (!node) continue
    const changes = sanitizeChanges(node, updated, p.changes)
    for (const [k, v] of Object.entries(changes)) node[k] = v
  }

  return updated
}

