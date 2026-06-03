/**
 * Browser DOM renderer for Design Tree (matches DesignTreeNode / html-from-tree).
 */

function normalizePoints(value) {
  if (value == null) return null
  if (Array.isArray(value) && value.length && typeof value[0] === 'number') {
    return value.map(Number)
  }
  if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
    const flat = []
    for (const p of value) {
      flat.push(Number(p.x ?? p.X ?? 0), Number(p.y ?? p.Y ?? 0))
    }
    return flat.length >= 6 ? flat : null
  }
  return null
}

export function resolveAssetUrl(src, assetsBaseUrl) {
  if (!src) return null
  if (/^(data:|blob:|https?:)/.test(src)) return src
  const base = String(src).replace(/^assets\//, '').replace(/^\//, '')
  return `${String(assetsBaseUrl).replace(/\/$/, '')}/${base}`
}

function fillBackground(node) {
  if (node.cssBackground && String(node.cssBackground).trim()) {
    return String(node.cssBackground).trim()
  }
  if (node.gradientFrom && node.gradientTo) {
    const angle = node.gradientAngle ?? 90
    return `linear-gradient(${angle}deg, ${node.gradientFrom}, ${node.gradientTo})`
  }
  return node.fill ?? node.backgroundColor ?? 'transparent'
}

function applyBoxStyle(el, node) {
  el.style.position = 'absolute'
  el.style.boxSizing = 'border-box'
  el.style.left = `${node.x ?? 0}px`
  el.style.top = `${node.y ?? 0}px`
  el.style.width = `${node.width ?? 100}px`
  el.style.height = `${node.height ?? 40}px`
  el.style.zIndex = String(node.zIndex ?? 0)
  el.style.opacity = String(node.opacity ?? 1)
  el.dataset.nodeId = node.id
  el.classList.add('dt-layer')
}

function createRasterEl(node, assetsBaseUrl) {
  const img = document.createElement('img')
  img.alt = node.id
  const url = resolveAssetUrl(node.src, assetsBaseUrl)
  if (url) img.src = url
  let fit = node.objectFit === 'contain' ? 'contain' : 'cover'
  if (node.role === 'product' || node.id === 'product' || node.role === 'logo' || node.id === 'logo') {
    fit = 'contain'
  }
  img.style.objectFit = fit
  img.style.objectPosition = 'center'
  img.style.width = '100%'
  img.style.height = '100%'
  img.style.display = 'block'
  img.draggable = false
  applyBoxStyle(img, node)
  return img
}

function createTextEl(node) {
  const el = document.createElement('div')
  applyBoxStyle(el, node)
  const fs = node.fontSize ?? 24
  const align = node.textAlign ?? 'left'
  el.style.color = node.color ?? '#000'
  el.style.fontSize = `${fs}px`
  el.style.lineHeight = `${Math.ceil(fs * 1.2)}px`
  el.style.fontWeight = node.fontWeight === 'bold' ? '700' : '400'
  el.style.fontFamily = node.fontFamily ?? 'system-ui, sans-serif'
  el.style.textAlign = align
  el.style.display = 'flex'
  el.style.alignItems = 'center'
  el.style.justifyContent =
    align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
  el.style.whiteSpace = 'pre-wrap'
  el.style.overflow = 'hidden'
  el.style.wordBreak = 'break-word'
  if (node.boxShadow) el.style.boxShadow = node.boxShadow
  el.textContent = node.text ?? ''
  return el
}

function createButtonEl(node) {
  const el = document.createElement('div')
  applyBoxStyle(el, node)
  el.style.background = node.backgroundColor ?? '#e11'
  el.style.borderRadius = `${node.borderRadius ?? 8}px`
  el.style.display = 'flex'
  el.style.alignItems = 'center'
  el.style.justifyContent = 'center'
  el.style.color = node.color ?? '#fff'
  el.style.fontSize = `${node.fontSize ?? 18}px`
  el.style.fontWeight = node.fontWeight === 'bold' ? '700' : '500'
  el.style.fontFamily = node.fontFamily ?? 'system-ui, sans-serif'
  if (node.boxShadow) el.style.boxShadow = node.boxShadow
  el.textContent = node.text ?? ''
  return el
}

function createRatingEl(node) {
  const el = document.createElement('div')
  applyBoxStyle(el, node)
  const value = Math.max(0, Math.min(5, Number(node.ratingValue ?? 5)))
  const fs = Math.min((node.height ?? 40) * 0.85, (node.width ?? 100) / 6)
  el.style.display = 'flex'
  el.style.alignItems = 'center'
  el.style.justifyContent = 'space-around'
  el.style.color = node.color ?? '#fff'
  el.style.fontSize = `${fs}px`
  el.style.lineHeight = '1'
  let stars = ''
  for (let i = 0; i < 5; i += 1) {
    const on = value >= i + 1 || value >= i + 0.5
    stars += `<span style="opacity:${on ? 1 : 0.35}">${on ? '★' : '☆'}</span>`
  }
  el.innerHTML = stars
  return el
}

function createShapeEl(node) {
  const el = document.createElement('div')
  applyBoxStyle(el, node)
  const bg = fillBackground(node)
  const border =
    node.stroke && node.strokeWidth ? `${node.strokeWidth}px solid ${node.stroke}` : ''

  if (node.shape === 'ellipse') {
    el.style.background = bg
    el.style.borderRadius = '50%'
    if (border) el.style.border = border
  } else {
    const points = normalizePoints(node.points)
    if (points && points.length >= 6) {
      const pairs = []
      for (let i = 0; i < points.length; i += 2) {
        pairs.push(`${points[i]}px ${points[i + 1]}px`)
      }
      el.style.background = bg
      el.style.clipPath = `polygon(${pairs.join(', ')})`
      if (border) el.style.border = border
    } else {
      el.style.background = bg
      el.style.borderRadius = `${node.borderRadius ?? 0}px`
      if (border) el.style.border = border
    }
  }
  if (node.boxShadow) el.style.boxShadow = node.boxShadow
  return el
}

export function createLayerElement(node, assetsBaseUrl) {
  const raster = new Set(['image', 'logo', 'background'])
  if (raster.has(node.type) && node.src) return createRasterEl(node, assetsBaseUrl)
  if (node.type === 'rating') return createRatingEl(node)
  if (node.type === 'text') return createTextEl(node)
  if (node.type === 'button') return createButtonEl(node)
  return createShapeEl(node)
}

/**
 * Render design tree into a frame container. Returns Map nodeId -> HTMLElement.
 */
export function renderTreeToDOM(frameEl, tree, assetsBaseUrl) {
  frameEl.innerHTML = ''
  frameEl.style.position = 'relative'
  frameEl.style.width = `${tree.width}px`
  frameEl.style.height = `${tree.height}px`
  frameEl.style.background = tree.backgroundColor ?? '#ffffff'
  frameEl.style.overflow = 'hidden'

  const layerMap = new Map()
  const children = [...(tree.children || [])].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))

  for (const node of children) {
    const el = createLayerElement(node, assetsBaseUrl)
    frameEl.appendChild(el)
    layerMap.set(node.id, el)
  }

  return layerMap
}

export function readNodeBoundsFromElement(el, tree) {
  const id = el.dataset.nodeId
  const node = (tree.children || []).find((n) => n.id === id)
  if (!node) return null
  return {
    x: Math.round(parseFloat(el.style.left) || node.x || 0),
    y: Math.round(parseFloat(el.style.top) || node.y || 0),
    width: Math.round(parseFloat(el.style.width) || node.width || 100),
    height: Math.round(parseFloat(el.style.height) || node.height || 40),
  }
}

export function applyNodeBoundsToElement(el, node) {
  el.style.left = `${node.x ?? 0}px`
  el.style.top = `${node.y ?? 0}px`
  el.style.width = `${node.width ?? 100}px`
  el.style.height = `${node.height ?? 40}px`
  el.style.zIndex = String(node.zIndex ?? 0)
}
