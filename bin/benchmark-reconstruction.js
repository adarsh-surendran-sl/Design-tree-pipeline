#!/usr/bin/env node
/**
 * Batch-score reconstruction outputs under runs/.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { scoreReconstruction } from '../src/reconstructionScore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RUNS = path.join(__dirname, '..', 'runs')

async function run() {
  if (!fs.existsSync(RUNS)) {
    console.log('No runs/ directory')
    return
  }

  const jobs = fs.readdirSync(RUNS).filter((d) => fs.statSync(path.join(RUNS, d)).isDirectory())
  const rows = []

  for (const job of jobs) {
    const dir = path.join(RUNS, job)
    const orig = fs.readdirSync(dir).find((f) => f.startsWith('original.'))
    const preview = path.join(dir, 'preview.png')
    if (!orig || !fs.existsSync(preview)) continue

    let tree = null
    const treePath = path.join(dir, 'design_tree_final.json')
    if (fs.existsSync(treePath)) {
      tree = JSON.parse(fs.readFileSync(treePath, 'utf8'))
    }

    const score = await scoreReconstruction(path.join(dir, orig), preview, tree)
    rows.push({ job, ...score })
  }

  rows.sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
  for (const r of rows) {
    console.log(
      `${r.job}: ${Math.round((r.similarity ?? 0) * 100)}% ` +
        `(product IoU ${Math.round((r.productIoU ?? 0) * 100)}%, footer ${Math.round((r.footerIoU ?? 0) * 100)}%)`,
    )
  }
  console.log(`\nScored ${rows.length} job(s)`)
}

run().catch((e) => {
  console.error(e)
  process.exit(1)
})
