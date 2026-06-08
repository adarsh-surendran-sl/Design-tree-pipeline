#!/usr/bin/env node
import {
  RegionPlanJsonSchema,
  PatchResponseJsonSchema,
  ProductBboxPatchJsonSchema,
  AuditRenderJsonSchema,
  TextPromoteJsonSchema,
} from '../src/llmSchemas.js'

function findOpenObjects(schema, path = 'root') {
  if (!schema || typeof schema !== 'object') return []
  const hits = []
  if (schema.type === 'object' && schema.additionalProperties !== false) {
    hits.push(`${path} (additionalProperties=${schema.additionalProperties})`)
  }
  if (schema.properties) {
    for (const [k, v] of Object.entries(schema.properties)) {
      hits.push(...findOpenObjects(v, `${path}.properties.${k}`))
    }
  }
  if (schema.items) hits.push(...findOpenObjects(schema.items, `${path}.items`))
  return hits
}

const schemas = {
  RegionPlanJsonSchema,
  PatchResponseJsonSchema,
  ProductBboxPatchJsonSchema,
  AuditRenderJsonSchema,
  TextPromoteJsonSchema,
}

let failed = false
for (const [name, schema] of Object.entries(schemas)) {
  const bad = findOpenObjects(schema, name)
  if (bad.length) {
    failed = true
    console.error(`✗ ${name}:`)
    for (const b of bad) console.error(`    ${b}`)
  } else {
    console.log(`✓ ${name}`)
  }
}

if (failed) process.exit(1)
console.log('\nAll schemas are Anthropic-compatible (additionalProperties: false).')
