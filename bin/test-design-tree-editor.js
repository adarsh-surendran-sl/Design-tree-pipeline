#!/usr/bin/env node
/**
 * DOM-less tests for design tree editor helpers.
 */
import assert from 'node:assert/strict'
import {
  findNode,
  updateNodeBounds,
  updateNodeField,
  reorderNodeZIndex,
  applyOverridesFromProps,
} from '../src/treeEditorHelpers.js'

const sampleTree = {
  width: 1080,
  height: 1080,
  backgroundColor: '#fff',
  children: [
    { id: 'bg', type: 'shape', x: 0, y: 0, width: 1080, height: 1080, zIndex: 0 },
    { id: 'headline', type: 'text', x: 100, y: 80, width: 400, height: 60, zIndex: 2, text: 'Hi' },
    { id: 'product', type: 'image', x: 200, y: 300, width: 500, height: 500, zIndex: 1, src: 'assets/product.png' },
  ],
}

function clone() {
  return JSON.parse(JSON.stringify(sampleTree))
}

let passed = 0
function test(name, fn) {
  try {
    fn()
    passed += 1
    console.log(`  ok ${name}`)
  } catch (e) {
    console.error(`  FAIL ${name}:`, e.message)
    process.exitCode = 1
  }
}

console.log('design-tree-editor helpers')

test('findNode', () => {
  const t = clone()
  assert.equal(findNode(t, 'headline')?.text, 'Hi')
  assert.equal(findNode(t, 'missing'), null)
})

test('updateNodeBounds', () => {
  const t = clone()
  updateNodeBounds(t, 'headline', { x: 10, y: 20, width: 300, height: 50 })
  const n = findNode(t, 'headline')
  assert.equal(n.x, 10)
  assert.equal(n.y, 20)
  assert.equal(n.width, 300)
  assert.equal(n.height, 50)
})

test('updateNodeField', () => {
  const t = clone()
  updateNodeField(t, 'headline', 'text', 'Hello')
  updateNodeField(t, 'headline', 'fontSize', '32')
  const n = findNode(t, 'headline')
  assert.equal(n.text, 'Hello')
  assert.equal(n.fontSize, 32)
})

test('reorderNodeZIndex', () => {
  const t = clone()
  const productZ = findNode(t, 'product').zIndex
  reorderNodeZIndex(t, 'product', 'up')
  assert.notEqual(findNode(t, 'product').zIndex, productZ)
})

test('applyOverridesFromProps', () => {
  const t = clone()
  const out = applyOverridesFromProps(t, {
    frame: { backgroundColor: '#000000' },
    nodes: {
      headline: { text: 'Sale', color: '#ff0000' },
    },
  })
  assert.equal(out.backgroundColor, '#000000')
  assert.equal(findNode(out, 'headline').text, 'Sale')
  assert.equal(findNode(out, 'headline').color, '#ff0000')
})

console.log(`\n${passed} passed`)
if (process.exitCode) process.exit(process.exitCode)
