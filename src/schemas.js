import { z } from 'zod'
import { normalizeChildDict, normalizePoints, normalizeTreeDict } from './normalize.js'

const ShapeEnum = z.enum(['rect', 'ellipse', 'polygon'])
const NodeTypeEnum = z.enum([
  'text',
  'button',
  'shape',
  'image',
  'badge',
  'logo',
  'background',
  'overlay',
  'rating',
])

const RenderStrategyEnum = z.enum(['auto', 'crop', 'primitive'])
const FontWeightEnum = z.enum(['normal', 'bold'])
const TextAlignEnum = z.enum(['left', 'center', 'right'])
const ObjectFitEnum = z.enum(['cover', 'contain'])

export const DesignNodeSchema = z
  .object({
    id: z.string(),
    type: NodeTypeEnum,
    renderStrategy: RenderStrategyEnum.optional().default('auto'),
    role: z.string().optional(),

    x: z.number().optional().default(0),
    y: z.number().optional().default(0),
    width: z.number().optional().default(100),
    height: z.number().optional().default(40),
    zIndex: z.number().int().optional().default(0),

    text: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: FontWeightEnum.optional(),
    textAlign: TextAlignEnum.optional().default('left'),
    color: z.string().optional().default('#000000'),
    backgroundColor: z.string().optional(),
    fill: z.string().optional(),

    src: z.string().optional(),

    shape: ShapeEnum.optional().default('rect'),
    points: z.array(z.number()).optional(),

    gradientFrom: z.string().optional(),
    gradientTo: z.string().optional(),
    gradientAngle: z.number().optional(),
    cssBackground: z.string().optional(),
    renderChoice: z.enum(['css', 'crop', 'ambiguous']).optional(),
    renderOptions: z.record(z.any()).optional(),
    ambiguityReason: z.string().optional(),
    opacity: z.number().optional().default(1.0),
    borderRadius: z.number().optional().default(0),
    objectFit: ObjectFitEnum.optional().default('cover'),
    stroke: z.string().optional(),
    strokeWidth: z.number().optional(),
    ratingValue: z.number().optional(),
  })
  .passthrough()
  .transform((node) => {
    // Normalize points to flat [x1,y1,x2,y2,...]
    if ('points' in node) {
      node.points = normalizePoints(node.points)
    }
    return node
  })

export const DesignTreeSchema = z
  .object({
    type: z.literal('frame').optional().default('frame'),
    width: z.number().int(),
    height: z.number().int(),
    backgroundColor: z.string().optional().default('#ffffff'),
    children: z.array(DesignNodeSchema).optional().default([]),
  })
  .passthrough()

function parseChildrenLoose(childList) {
  const children = []
  const skipped = []
  for (const raw of childList || []) {
    if (!raw || typeof raw !== 'object') continue
    const result = DesignNodeSchema.safeParse(normalizeChildDict(raw))
    if (result.success) {
      children.push(result.data)
    } else {
      skipped.push({ id: raw.id, error: result.error.issues?.[0]?.message })
    }
  }
  return { children, skipped }
}

export function parseDesignTree(raw, frameDefaults = null) {
  const normalized = normalizeTreeDict(raw, frameDefaults)
  const frameOnly = {
    type: normalized.type || 'frame',
    width: normalized.width,
    height: normalized.height,
    backgroundColor: normalized.backgroundColor,
  }
  try {
    const frame = DesignTreeSchema.pick({ type: true, width: true, height: true, backgroundColor: true }).parse(
      frameOnly,
    )
    const { children, skipped } = parseChildrenLoose(normalized.children)
    if (skipped.length) {
      console.warn(`Skipped ${skipped.length} invalid node(s):`, skipped.slice(0, 3))
    }
    return { ...frame, children }
  } catch (err) {
    const msg =
      err?.issues?.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') ||
      err?.message ||
      String(err)
    throw new Error(
      `Invalid design tree JSON (${msg}). ` +
        (frameDefaults
          ? `Expected frame ${frameDefaults.width}x${frameDefaults.height}px.`
          : 'Frame width/height missing.'),
    )
  }
}

export function parseDesignNode(raw) {
  // shape aliases are normalized in normalizeTreeDict already, but keep safe:
  const normalized = normalizeTreeDict({ children: [raw] }).children[0]
  return DesignNodeSchema.parse(normalized)
}

export const DesignPatchSchema = z.object({
  element: z.string(),
  changes: z.record(z.any()),
})

export const PatchResponseSchema = z.object({
  patches: z.array(DesignPatchSchema).default([]),
})

const PATCH_META_KEYS = new Set([
  'element',
  'id',
  'node_id',
  'nodeId',
  'target',
  'node',
  'changes',
  'attrs',
  'properties',
  'updates',
  'style',
  'reason',
  'note',
  'description',
])

/** Normalize LLM patch variants → { element, changes }. */
export function coercePatch(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null

  const element = raw.element ?? raw.id ?? raw.node_id ?? raw.nodeId ?? raw.target ?? raw.node
  let changes = raw.changes ?? raw.attrs ?? raw.properties ?? raw.updates ?? raw.style

  if ((!changes || typeof changes !== 'object' || Array.isArray(changes)) && element) {
    const flat = {}
    for (const [k, v] of Object.entries(raw)) {
      if (!PATCH_META_KEYS.has(k) && v !== undefined && v !== null) flat[k] = v
    }
    if (Object.keys(flat).length) changes = flat
  }

  if (!element || typeof element !== 'string') return null
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) return null

  return { element: String(element), changes }
}

function patchesObjectToList(obj) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return []
  return Object.entries(obj).map(([id, changes]) => ({
    element: id,
    changes: changes && typeof changes === 'object' && !Array.isArray(changes) ? changes : {},
  }))
}

function extractPatchList(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object') {
    if (Array.isArray(raw.patches)) return raw.patches
    if (raw.patches && typeof raw.patches === 'object' && !Array.isArray(raw.patches)) {
      return patchesObjectToList(raw.patches)
    }
    const single = coercePatch(raw)
    if (single) return [single]
  }
  return []
}

/** Lenient patch parsing — never throws; skips malformed entries. */
export function parsePatches(raw) {
  const list = extractPatchList(raw)
  const out = []
  for (const item of list) {
    const coerced = coercePatch(item)
    if (!coerced?.element || !coerced.changes || typeof coerced.changes !== 'object') continue
    out.push(coerced)
  }
  return out
}

