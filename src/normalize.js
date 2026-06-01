const SHAPE_ALIASES = {
  rect: 'rect',
  rectangle: 'rect',
  box: 'rect',
  square: 'rect',
  rounded_rect: 'rect',
  roundedrect: 'rect',
  ellipse: 'ellipse',
  circle: 'ellipse',
  oval: 'ellipse',
  circular: 'ellipse',
  polygon: 'polygon',
  poly: 'polygon',
}

export function normalizeShape(value) {
  if (value == null) return null
  if (typeof value !== 'string') return null
  const key = value
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_')
  return SHAPE_ALIASES[key] ?? null
}

export function normalizePoints(value) {
  if (value == null) return null

  if (Array.isArray(value) && value.length && typeof value[0] === 'number') {
    return value.map((v) => Number(v))
  }

  if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
    const flat = []
    for (const p of value) {
      flat.push(Number(p.x ?? p.X ?? 0), Number(p.y ?? p.Y ?? 0))
    }
    return flat.length >= 6 ? flat : null
  }

  if (typeof value === 'object' && value && 'points' in value) {
    return normalizePoints(value.points)
  }

  return null
}

const NUMERIC_NODE_KEYS = [
  'x',
  'y',
  'width',
  'height',
  'fontSize',
  'zIndex',
  'opacity',
  'borderRadius',
  'ratingValue',
  'gradientAngle',
  'strokeWidth',
]

function coerceNumber(value) {
  if (value == null || value === '') return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function coerceChildNumbers(child) {
  const out = { ...child }
  if (out.align && !out.textAlign) {
    const a = String(out.align).toLowerCase()
    if (a === 'center' || a === 'left' || a === 'right') out.textAlign = a
  }
  for (const key of NUMERIC_NODE_KEYS) {
    if (key in out && out[key] != null) {
      const n = coerceNumber(out[key])
      if (n !== undefined) out[key] = key === 'zIndex' ? Math.round(n) : n
    }
  }
  return out
}

const SUGGESTED_TO_TYPE = {
  image: 'image',
  logo: 'logo',
  background: 'background',
  text: 'text',
  button: 'button',
  shape: 'shape',
  badge: 'badge',
  overlay: 'overlay',
  rating: 'rating',
}

/** LLMs often use Figma-like type names — map to schema node types. */
const TYPE_ALIASES = {
  rectangle: 'shape',
  rect: 'shape',
  rounded_rectangle: 'shape',
  ellipse: 'shape',
  circle: 'shape',
  oval: 'shape',
  polygon: 'shape',
  poly: 'shape',
  line: 'shape',
  star: 'shape',
}

function normalizeNodeType(out) {
  if (!out.type) return out
  const key = String(out.type)
    .trim()
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_')
  const mapped = TYPE_ALIASES[key]
  if (!mapped) return out

  if (!out.shape) {
    const geom = normalizeShape(key)
    out.shape = geom || (key.includes('poly') ? 'polygon' : key.includes('ellip') || key.includes('circ') ? 'ellipse' : 'rect')
  }
  out.type = mapped
  return out
}

export function normalizeChildDict(child) {
  let out = { ...(child ?? {}) }
  out = coerceChildNumbers(out)

  if (!out.type && out.suggestedType) {
    const st = String(out.suggestedType).toLowerCase()
    out.type = SUGGESTED_TO_TYPE[st] || 'image'
  }
  out = normalizeNodeType(out)
  if (!out.id) out.id = `node_${Math.random().toString(36).slice(2, 9)}`

  if ('points' in out) out.points = normalizePoints(out.points)
  if ('shape' in out) {
    const normalized = normalizeShape(out.shape)
    if (normalized) out.shape = normalized
  }
  return out
}

/** Unwrap common LLM wrappers: { designTree: {...} }, { frame: {...} }, etc. */
export function unwrapTreePayload(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return data
  for (const key of ['designTree', 'design_tree', 'frame', 'tree', 'result']) {
    const inner = data[key]
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      return inner
    }
  }
  return data
}

/**
 * Normalize frame JSON before schema validation.
 * @param {object} data - raw LLM JSON
 * @param {{ width?: number, height?: number }} [frameDefaults] - from source image when LLM omits dims
 */
export function normalizeTreeDict(data, frameDefaults = null) {
  let out = unwrapTreePayload(data)
  out = { ...(out ?? {}) }

  const children = out.children
  if (Array.isArray(children)) {
    out.children = children.map((c) => (typeof c === 'object' && c ? normalizeChildDict(c) : c))
  }

  const regions = out.regions
  if (Array.isArray(regions) && !Array.isArray(out.children)) {
    out.children = regions.map((r) => (typeof r === 'object' && r ? normalizeChildDict(r) : r))
  }

  const fw = coerceNumber(out.width) ?? frameDefaults?.width
  const fh = coerceNumber(out.height) ?? frameDefaults?.height
  if (fw != null) out.width = Math.round(fw)
  if (fh != null) out.height = Math.round(fh)

  if (!out.type) out.type = 'frame'
  if (!out.backgroundColor) out.backgroundColor = '#ffffff'

  return out
}

