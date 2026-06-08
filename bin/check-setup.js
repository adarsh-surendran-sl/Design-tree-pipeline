#!/usr/bin/env node
/**
 * Verify "full power" Image → Tree setup (env, sidecar, MCP, Playwright).
 */
import { loadEnv, PROJECT_ROOT } from '../src/loadEnv.js'
import { checkLayoutServiceHealth, isLayoutServiceEnabled } from '../src/layoutClient.js'
import { checkMcpHealth } from '../src/mcpClient.js'
import { useStructuredOutputs } from '../src/llmSchemas.js'
import { multiRegionCompareEnabled } from '../src/compareRegions.js'

loadEnv()

const checks = []

function add(name, ok, detail = '') {
  checks.push({ name, ok, detail })
}

add('ANTHROPIC_API_KEY', Boolean(process.env.ANTHROPIC_API_KEY))
add('ANTHROPIC_MODEL', Boolean(process.env.ANTHROPIC_MODEL), process.env.ANTHROPIC_MODEL || '')
add('structured outputs', useStructuredOutputs())
add('multi-region compare', multiRegionCompareEnabled(true))
add('layout service enabled', isLayoutServiceEnabled(), process.env.LAYOUT_SERVICE_URL || '')

let layoutOk = false
if (isLayoutServiceEnabled()) {
  layoutOk = await checkLayoutServiceHealth()
  add('layout sidecar reachable', layoutOk)
} else {
  add('layout sidecar reachable', false, 'Set LAYOUT_SERVICE_ENABLED=1 and URL')
}

let playwrightOk = false
try {
  await import('playwright')
  playwrightOk = true
} catch {
  playwrightOk = false
}
add('Playwright', playwrightOk, playwrightOk ? '' : 'npm run setup-browser')

const mcpOk = await checkMcpHealth()
add('MCP ui-tools', mcpOk)
const publicBase = String(process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '')
add('PUBLIC_BASE_URL (MCP bg removal)', Boolean(publicBase), publicBase || 'ngrok http 8787 → paste URL in .env.local')

const fullPower =
  checks.every((c) => c.ok) ||
  checks
    .filter((c) => c.name !== 'PUBLIC_BASE_URL (MCP bg removal)')
    .every((c) => c.ok) &&
    layoutOk &&
    playwrightOk

console.log('\nDesign Tree Pipeline — setup check\n')
for (const c of checks) {
  const mark = c.ok ? '✓' : '✗'
  const extra = c.detail ? ` (${c.detail})` : ''
  console.log(`  ${mark} ${c.name}${extra}`)
}

console.log('')
if (fullPower && publicBase) {
  console.log('Full power: all features including MCP background removal.\n')
} else if (layoutOk && playwrightOk && process.env.ANTHROPIC_API_KEY) {
  console.log('Near full power: run Image → Tree with High accuracy ON, analyze-only OFF.')
  if (!publicBase) {
    console.log('Optional: PUBLIC_BASE_URL + ngrok for cleaner product cutouts via MCP.\n')
  }
} else {
  console.log('Fix items marked ✗, then restart: npm run ui (+ npm run layout-service).\n')
  process.exitCode = 1
}

console.log('UI: http://localhost:8787/image-to-tree')
console.log('Terminals: npm run layout-service  |  npm run ui\n')
