/** JSON Schema definitions for Claude structured outputs (reconstruction agents). */

/** Anthropic requires additionalProperties: false on every object type. */
export function anthropicJsonSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema
  if (Array.isArray(schema)) return schema.map(anthropicJsonSchema)

  const out = { ...schema }
  if (out.type === 'object') {
    out.additionalProperties = false
    if (out.properties && typeof out.properties === 'object') {
      out.properties = Object.fromEntries(
        Object.entries(out.properties).map(([k, v]) => [k, anthropicJsonSchema(v)]),
      )
    }
  }
  if (out.type === 'array' && out.items) {
    out.items = anthropicJsonSchema(out.items)
  }
  return out
}

const regionItemSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    renderStrategy: { type: 'string' },
    suggestedType: { type: 'string' },
    role: { type: 'string' },
    x: { type: 'integer' },
    y: { type: 'integer' },
    width: { type: 'integer' },
    height: { type: 'integer' },
    zIndex: { type: 'integer' },
    text: { type: 'string' },
  },
  required: ['id', 'x', 'y', 'width', 'height'],
  additionalProperties: false,
}

/** Small patch changes object (Anthropic schema complexity limit). */
const patchChangesMinimalSchema = {
  type: 'object',
  properties: {
    x: { type: 'integer' },
    y: { type: 'integer' },
    width: { type: 'integer' },
    height: { type: 'integer' },
    zIndex: { type: 'integer' },
    text: { type: 'string' },
    color: { type: 'string' },
    fontSize: { type: 'number' },
    cssBackground: { type: 'string' },
  },
  additionalProperties: false,
}

const patchItemSchema = {
  type: 'object',
  properties: {
    element: { type: 'string' },
    changes: patchChangesMinimalSchema,
  },
  required: ['element', 'changes'],
  additionalProperties: false,
}

export const RegionPlanJsonSchema = anthropicJsonSchema({
  type: 'object',
  properties: {
    width: { type: 'integer' },
    height: { type: 'integer' },
    backgroundColor: { type: 'string' },
    regions: {
      type: 'array',
      items: regionItemSchema,
    },
  },
  required: ['width', 'height', 'regions'],
  additionalProperties: false,
})

/** Full design trees are too large for structured output — use visionJson + parseDesignTree instead. */
export const DesignTreeLlmJsonSchema = null

export const PatchResponseJsonSchema = anthropicJsonSchema({
  type: 'object',
  properties: {
    patches: {
      type: 'array',
      items: patchItemSchema,
    },
  },
  required: ['patches'],
  additionalProperties: false,
})

/** Product bbox refine only needs geometry. */
export const ProductBboxPatchJsonSchema = anthropicJsonSchema({
  type: 'object',
  properties: {
    patches: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          element: { type: 'string' },
          changes: {
            type: 'object',
            properties: {
              x: { type: 'integer' },
              y: { type: 'integer' },
              width: { type: 'integer' },
              height: { type: 'integer' },
            },
            additionalProperties: false,
          },
        },
        required: ['element', 'changes'],
        additionalProperties: false,
      },
    },
  },
  required: ['patches'],
  additionalProperties: false,
})

export const AuditRenderJsonSchema = anthropicJsonSchema({
  type: 'object',
  properties: {
    convert_to_image: { type: 'array', items: { type: 'string' } },
  },
  required: ['convert_to_image'],
  additionalProperties: false,
})

export const TextPromoteJsonSchema = anthropicJsonSchema({
  type: 'object',
  properties: {
    conversions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          element: { type: 'string' },
          text: { type: 'string' },
          role: { type: 'string' },
          color: { type: 'string' },
          fontSize: { type: 'number' },
        },
        required: ['element', 'text'],
        additionalProperties: false,
      },
    },
  },
  required: ['conversions'],
  additionalProperties: false,
})

export function useStructuredOutputs() {
  if (process.env.ANTHROPIC_USE_STRUCTURED_OUTPUTS === '0') return false
  return process.env.ANTHROPIC_USE_STRUCTURED_OUTPUTS !== '0'
}
