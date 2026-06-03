/**
 * Align price-banner / product-hero footer nodes from source image detection.
 */
import sharp from 'sharp'

import { estimateFooterBBox, estimateBadgeBBox } from './segmentation.js'
import { sourcePixelsToTreeBox } from './frameLock.js'
import { ARCHETYPES } from './layoutArchetype.js'

function isPriceBannerArchetype(layoutMeta) {
  const a = layoutMeta?.archetype
  return (
    a === ARCHETYPES.productHero ||
    a === ARCHETYPES.priceBanner ||
    a === ARCHETYPES.verticalStory
  )
}

function isFooterShape(node, frameH) {
  const role = String(node.role || '').toLowerCase()
  const id = String(node.id || '').toLowerCase()
  const y = node.y ?? 0
  return (
    node.type === 'shape' &&
    y >= frameH * 0.45 &&
    (role === 'overlay' || role === 'price' || role === 'badge' || id.includes('price') || id.includes('banner'))
  )
}

function isBadgeNode(node, frameH) {
  const role = String(node.role || '').toLowerCase()
  const id = String(node.id || '').toLowerCase()
  const y = node.y ?? 0
  return (
    (node.type === 'shape' || node.type === 'text') &&
    y >= frameH * 0.35 &&
    y < frameH * 0.78 &&
    (role === 'badge' || id.includes('volume') || id.includes('badge') || (node.text && /^\d+\s*ml$/i.test(String(node.text))))
  )
}

function isPriceTextNode(node, frameH) {
  const role = String(node.role || '').toLowerCase()
  const id = String(node.id || '').toLowerCase()
  const y = node.y ?? 0
  if (node.type !== 'text' && node.type !== 'button') return false
  if (role === 'price' || id.includes('price')) return true
  return y >= frameH * 0.55 && node.text && /₹|\$|€|£|onwards|%/i.test(String(node.text))
}

function applyTreeBox(node, treeBox) {
  node.x = treeBox.x
  node.y = treeBox.y
  node.width = treeBox.width
  node.height = treeBox.height
}

/**
 * Snap footer bar, badge, and price text nodes to detected source regions.
 */
export async function syncPriceBannerLayout(tree, imagePath, layoutMeta = null) {
  if (!isPriceBannerArchetype(layoutMeta)) return tree

  const meta = await sharp(imagePath).metadata()
  const srcW = meta.width || tree.width
  const srcH = meta.height || tree.height
  if (!srcW || !srcH) return tree

  const footerBbox = await estimateFooterBBox(imagePath)
  const badgeBbox = await estimateBadgeBBox(imagePath)
  if (!footerBbox && !badgeBbox) return tree

  const updated = JSON.parse(JSON.stringify(tree))
  const frameH = updated.height ?? srcH
  const footerShapes = (updated.children || []).filter((n) => isFooterShape(n, frameH))

  if (footerBbox) {
    const footerBox = sourcePixelsToTreeBox(footerBbox, srcW, srcH, updated)
    if (footerShapes.length) {
      const primary = footerShapes.sort((a, b) => (b.width ?? 0) - (a.width ?? 0))[0]
      applyTreeBox(primary, footerBox)
      primary.role = primary.role || 'overlay'
      updated.children = updated.children.filter((n) => !footerShapes.includes(n) || n.id === primary.id)
    } else {
      updated.children.push({
        id: 'price_bar',
        type: 'shape',
        role: 'overlay',
        renderStrategy: 'primitive',
        fill: '#d8c8e8',
        ...footerBox,
        zIndex: 10,
      })
    }

    const priceNodes = updated.children.filter((n) => isPriceTextNode(n, frameH))
    for (const node of priceNodes) {
      node.y = footerBox.y + Math.round(footerBox.height * 0.15)
      node.x = footerBox.x + Math.round(footerBox.width * 0.04)
      node.width = Math.max(node.width ?? 120, Math.round(footerBox.width * 0.55))
      node.height = Math.max(node.height ?? 32, Math.round(footerBox.height * 0.7))
      node.textAlign = node.textAlign || 'left'
      node.role = node.role || 'price'
    }
  }

  if (badgeBbox) {
    const badgeBox = sourcePixelsToTreeBox(badgeBbox, srcW, srcH, updated)
    const badgeNodes = updated.children.filter((n) => isBadgeNode(n, frameH))
    if (badgeNodes.length) {
      applyTreeBox(badgeNodes[0], badgeBox)
      updated.children = updated.children.filter((n) => !badgeNodes.includes(n) || n.id === badgeNodes[0].id)
    }
  }

  return updated
}
