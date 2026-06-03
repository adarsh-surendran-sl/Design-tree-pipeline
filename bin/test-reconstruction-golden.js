#!/usr/bin/env node
/**
 * Deterministic golden tests for image-to-tree reconstruction helpers (no LLM).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { enhanceReconstructionTree } from '../src/reconstructionEnhance.js'
import { fixReconstructionLayout } from '../src/reconstructionLayout.js'
import { applyBackgroundPresets, treeHasPatternedBackground } from '../src/backgroundPresets.js'
import { exportLayersReference } from '../src/layerExport.js'
import { scoreReconstruction } from '../src/reconstructionScore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const GOLDEN = path.join(ROOT, 'golden')

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

function loadCase(c) {
  const treePath = path.join(GOLDEN, c.tree)
  return JSON.parse(fs.readFileSync(treePath, 'utf8'))
}

async function run() {
  const manifest = JSON.parse(fs.readFileSync(path.join(GOLDEN, 'manifest.json'), 'utf8'))
  let passed = 0

  for (const c of manifest.cases) {
    const expectPatterned = c.expectPatternedBg === true
    const tree = loadCase(c)
    let t = enhanceReconstructionTree(tree)
    t = fixReconstructionLayout(t)

    if (expectPatterned) {
      const headline = t.children.find((n) => n.id === 'headline_text')
      assert(headline?.textAlign === 'center', `${c.id}: headline must be centered`)
      assert(
        headline?.fontFamily?.includes('Barlow'),
        `${c.id}: headline should use Barlow Condensed`,
      )

      const product = t.children.find((n) => n.id === 'product_bottle')
      assert(product?.objectFit === 'contain', `${c.id}: product objectFit must be contain`)

      const cta = t.children.find((n) => n.role === 'cta' || n.type === 'button')
      assert(cta?.type === 'button', `${c.id}: discount strip should become button`)
    } else {
      const product = t.children.find((n) => n.role === 'product' || n.id === 'product')
      assert(product?.objectFit === 'contain', `${c.id}: product objectFit must be contain`)
    }

    const bg = t.children.find((n) => n.role === 'background_fill' || String(n.id).includes('sunburst'))
    if (expectPatterned) {
      assert(bg?.cssBackground?.includes('conic'), `${c.id}: background needs conic/sunburst css`)
    } else {
      assert(!t.children.some((n) => String(n.cssBackground || '').includes('conic')), `${c.id}: must not inject sunburst`)
      assert(!t.children.some((n) => n.id === 'background_sunburst'), `${c.id}: must not add background_sunburst layer`)
    }

    const layers = exportLayersReference(t)
    assert(layers.layers.length >= 2, `${c.id}: layer export count`)

    if (expectPatterned) {
      const withPreset = applyBackgroundPresets(tree)
      assert(
        withPreset.children.some((n) => n.backgroundPreset || String(n.cssBackground || '').includes('conic')),
        `${c.id}: background preset applied`,
      )
      assert(treeHasPatternedBackground(tree), `${c.id}: patterned bg detected`)
    } else {
      assert(!treeHasPatternedBackground(tree), `${c.id}: flat tree must not be patterned`)
      const withPreset = applyBackgroundPresets(tree)
      assert(!withPreset.children.some((n) => n.id === 'background_sunburst'), `${c.id}: preset must not invent sunburst`)
    }

    console.log(`✓ ${c.id}`)
    passed += 1
  }

  const runsDir = path.join(ROOT, 'runs')
  const dirs = fs.existsSync(runsDir)
    ? fs.readdirSync(runsDir).filter((d) => d.includes('dove'))
    : []
  if (dirs.length) {
    const job = dirs.sort().pop()
    const orig = fs.readdirSync(path.join(runsDir, job)).find((f) => f.startsWith('original.'))
    const preview = path.join(runsDir, job, 'preview.png')
    if (orig && fs.existsSync(preview)) {
      const score = await scoreReconstruction(path.join(runsDir, job, orig), preview)
      console.log(`  dove run score: ${Math.round(score.similarity * 100)}% (informational)`)
    }
  }

  console.log(`\n${passed}/${manifest.cases.length} golden checks passed`)
}

run().catch((e) => {
  console.error('Golden tests failed:', e.message)
  process.exit(1)
})
