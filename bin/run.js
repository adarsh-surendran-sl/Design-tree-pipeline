#!/usr/bin/env node
import path from 'path'

import { loadEnv } from '../src/loadEnv.js'
import { runPipeline } from '../src/pipeline.js'

loadEnv()

function getArg(name) {
  const idx = process.argv.indexOf(name)
  if (idx === -1) return null
  return process.argv[idx + 1] ?? null
}

function hasFlag(flag) {
  return process.argv.includes(flag)
}

async function main() {
  const imagePath = getArg('--image') || getArg('--imagePath')
  const out = getArg('--out') || getArg('--outputDir')
  const maxLoops = Number(getArg('--maxLoops') || 10)
  const highAccuracy = hasFlag('--highAccuracy') ? true : hasFlag('--noHighAccuracy') ? false : true

  if (!imagePath) {
    console.error('Usage: node bin/run.js --image "/path/ad.png" [--out "./runs"] [--maxLoops 10] [--noHighAccuracy]')
    process.exit(2)
  }

  const result = await runPipeline({
    imagePath: path.resolve(imagePath),
    outputDir: out ? path.resolve(out) : undefined,
    maxLoops,
    highAccuracy,
  })

  console.log(`\nFinal tree: ${result.final_tree_path}`)
}

main().catch((e) => {
  console.error(e?.message || e)
  process.exit(1)
})

