#!/usr/bin/env node
/**
 * Test ad template pipeline (design step only if --from-analysis).
 *
 * Usage:
 *   node bin/test-ad-template.js [jobDir]
 *   node bin/test-ad-template.js --full [jobDir]
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { loadEnv, PROJECT_ROOT } from '../src/loadEnv.js'
import { runAdTemplatePipeline } from '../src/adTemplatePipeline.js'
import { createDesignConcepts } from '../src/agents/designCreatorAgent.js'

loadEnv()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const defaultJob =
  'runs/ad_1780032868951_12-Piece_Brilliance_Nonstick_Cookware_Set'

const args = process.argv.slice(2)
const fullRun = args.includes('--full')
const jobArg = args.filter((a) => !a.startsWith('--'))[0] || defaultJob
const jobDir = path.isAbsolute(jobArg) ? jobArg : path.join(PROJECT_ROOT, jobArg)

function findProductImage(dir) {
  for (const name of ['product.jpeg', 'product.jpg', 'product.png']) {
    const p = path.join(dir, name)
    if (fs.existsSync(p)) return p
  }
  throw new Error(`No product image in ${dir}`)
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY in .env.local')
    process.exit(1)
  }

  const briefPath = path.join(jobDir, 'brief.json')
  if (!fs.existsSync(briefPath)) {
    console.error(`Job not found: ${jobDir}`)
    process.exit(1)
  }

  const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'))
  const productImagePath = findProductImage(jobDir)
  const logoPath = fs.existsSync(path.join(jobDir, 'logo.png'))
    ? path.join(jobDir, 'logo.png')
    : null
  const referencePath = fs.existsSync(path.join(jobDir, 'reference.png'))
    ? path.join(jobDir, 'reference.png')
    : null

  const log = (msg) => console.log(`[test] ${msg}`)

  if (fullRun) {
    const outDir = path.join(PROJECT_ROOT, 'runs', `test_${Date.now()}`)
    fs.mkdirSync(outDir, { recursive: true })
    fs.copyFileSync(productImagePath, path.join(outDir, path.basename(productImagePath)))
    if (logoPath) fs.copyFileSync(logoPath, path.join(outDir, 'logo.png'))

    const result = await runAdTemplatePipeline({
      jobDir: outDir,
      brief,
      productImagePath: findProductImage(outDir),
      referenceImagePath: referencePath,
      logoPath: logoPath ? path.join(outDir, 'logo.png') : null,
      onProgress: (msg, phase) => log(`[${phase || '?'}] ${msg}`),
    })
    console.log('\n✓ Full pipeline OK:', result.designs.length, 'designs')
    console.log('  Output:', outDir)
    return
  }

  const analysisPath = path.join(jobDir, 'product_analysis.json')
  if (!fs.existsSync(analysisPath)) {
    console.error('No product_analysis.json — run with --full or complete agent 1 first')
    process.exit(1)
  }

  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'))
  log('Testing design agent only (4 sequential calls)…')

  const designs = await createDesignConcepts({
    brief,
    analysis,
    productImagePath,
    referenceImagePath: referencePath,
    logoPath,
    onProgress: log,
  })

  console.log('\n✓ Design agent OK:', designs.length, 'designs')
  for (const d of designs) {
    console.log(`  - ${d.id}: ${d.name} (${(d.designTree.children || []).length} nodes)`)
  }
}

main().catch((e) => {
  console.error('\n✗ Test failed:', e.message)
  process.exit(1)
})
