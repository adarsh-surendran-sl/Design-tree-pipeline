#!/usr/bin/env node
/**
 * Tests layout region merge without live sidecar (fixture JSON).
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import {
  layoutRegionsToPlan,
  mergeLayoutIntoTreePlan,
  enforceProductBboxFromLayout,
  applyOcrFromLayout,
  bboxToRegionFields,
} from '../src/mergeLayoutRegions.js'
import { parseDesignTree } from '../src/schemas.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FIXTURE = path.join(__dirname, '..', 'test-fixtures', 'layout-glycolic.json')

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function run() {
  const analysis = JSON.parse(fs.readFileSync(FIXTURE, 'utf8'))
  const plan = layoutRegionsToPlan(analysis)
  assert(plan?.regions?.length >= 2, 'plan must have regions')

  const product = plan.regions.find((r) => r.role === 'product')
  assert(product.height >= analysis.height * 0.3, 'product height in plan')

  const merged = mergeLayoutIntoTreePlan(analysis, { width: analysis.width, height: analysis.height })
  assert(merged.children.length >= 2, 'merged children')

  const rawProduct = analysis.regions.find((r) => r.role === 'product')
  const box = bboxToRegionFields(rawProduct.bbox)
  assert(box.width > 0 && box.height > 0, 'bbox conversion')

  let tree = parseDesignTree(
    {
      type: 'frame',
      width: analysis.width,
      height: analysis.height,
      children: [
        {
          id: 'product_jar',
          type: 'image',
          role: 'product',
          x: 40,
          y: 95,
          width: 80,
          height: 50,
          zIndex: 5,
        },
      ],
    },
    { width: analysis.width, height: analysis.height },
  )

  tree = enforceProductBboxFromLayout(tree, analysis)
  const p = tree.children.find((n) => n.role === 'product')
  assert((p.height ?? 0) >= analysis.height * 0.28, 'enforce product bbox expanded')

  tree = applyOcrFromLayout(tree, analysis)
  const price = tree.children.find((n) => n.role === 'price')
  assert(price?.text && /343/.test(price.text), 'OCR price text applied')

  console.log('✓ layout merge tests passed')
}

run().catch((e) => {
  console.error('Layout merge tests failed:', e.message)
  process.exit(1)
})
