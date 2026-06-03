#!/usr/bin/env node
/**
 * Regression: product bbox must cover full packshot on vertical product-hero ads.
 */
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { estimateProductBBox, estimateFooterBBox } from '../src/segmentation.js'
import { lockFrameToSource } from '../src/frameLock.js'
import { applySegmentationBBoxToTree } from '../src/segmentation.js'
import { ensureProductBBoxFidelity } from '../src/productBboxRefine.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SAMPLE = path.join(__dirname, '..', 'test-fixtures', 'glycolic-vertical.png')

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function run() {
  const img = SAMPLE
  const meta = await sharp(img).metadata()
  const srcH = meta.height
  const productBbox = await estimateProductBBox(img)
  const footerBbox = await estimateFooterBBox(img)

  assert(productBbox, 'product bbox required')
  assert(productBbox.height >= srcH * 0.3, `product height too small: ${productBbox.height} vs frame ${srcH}`)
  assert(footerBbox, 'footer bbox required')
  assert(productBbox.top + productBbox.height <= footerBbox.top + 8, 'product must sit above footer')

  let tree = lockFrameToSource(
    {
      width: meta.width,
      height: meta.height,
      children: [
        { id: 'product_jar', type: 'image', role: 'product', x: 40, y: 95, width: 155, height: 70, zIndex: 5 },
      ],
    },
    meta.width,
    meta.height,
  )

  tree = applySegmentationBBoxToTree(tree, productBbox, meta.width, meta.height)
  tree = await ensureProductBBoxFidelity(tree, img)
  const node = tree.children.find((n) => n.role === 'product')
  assert((node.height ?? 0) >= Math.round(srcH * 0.3), `tree product height ${node.height} too small`)

  console.log('✓ product bbox isolation')
  console.log(`  detected product ${productBbox.width}x${productBbox.height} at (${productBbox.left},${productBbox.top})`)
  console.log(`  tree product ${node.width}x${node.height} at (${node.x},${node.y})`)
}

run().catch((e) => {
  console.error('Product bbox test failed:', e.message)
  process.exit(1)
})
