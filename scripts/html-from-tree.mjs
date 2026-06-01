/**
 * Build standalone HTML from a Design Tree JSON (same rules as React DesignNodeView).
 */
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'

export function normalizePoints(value) {
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

/**
 * Resolve image src for HTML. Prefer paths relative to the HTML file so
 * Playwright can load them via file:// (setContent + file:// img src is blocked).
 */
export function resolveAssetUrl(src, assetsDir, htmlFile = null) {
  if (!src) return null
  if (/^data:/.test(src)) return src
  if (/^https?:/.test(src)) return src

  const base = path.basename(src)
  const candidates = [
    path.join(assetsDir, base),
    path.isAbsolute(src) ? src : path.join(assetsDir, src),
    src.startsWith('assets/') || src.startsWith('assets\\')
      ? path.join(path.dirname(assetsDir), src)
      : path.join(assetsDir, src),
  ]
  for (const c of candidates) {
    if (!c || !fs.existsSync(c)) continue
    const resolved = path.resolve(c)
    if (htmlFile) {
      const rel = path.relative(path.dirname(path.resolve(htmlFile)), resolved)
      return rel.split(path.sep).join('/')
    }
    return pathToFileURL(resolved).href
  }
  return null
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function boxStyle(node) {
  return [
    `left:${node.x}px`,
    `top:${node.y}px`,
    `width:${node.width}px`,
    `height:${node.height}px`,
    `z-index:${node.zIndex ?? 0}`,
    `opacity:${node.opacity ?? 1}`,
  ].join(';')
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

function renderNode(node, assetsDir, htmlFile) {
  const base = `position:absolute;box-sizing:border-box;${boxStyle(node)}`
  const raster = new Set(['image', 'logo', 'background'])

  if (raster.has(node.type) && node.src) {
    const url = resolveAssetUrl(node.src, assetsDir, htmlFile)
    let fit = node.objectFit === 'contain' ? 'contain' : 'cover'
    if (node.role === 'product' || node.id === 'product' || node.role === 'logo' || node.id === 'logo') {
      fit = 'contain'
    }
    if (!url) {
      return `<div style="${base};background:#444;border:1px solid #888;display:flex;align-items:center;justify-content:center;font-size:11px;color:#ccc">missing asset</div>`
    }
    return `<img alt="${esc(node.id)}" src="${esc(url)}" style="${base};object-fit:${fit};object-position:center" />`
  }

  if (node.type === 'rating') {
    const value = Math.max(0, Math.min(5, Number(node.ratingValue ?? 5)))
    let stars = ''
    for (let i = 0; i < 5; i += 1) {
      const on = value >= i + 1 || value >= i + 0.5
      stars += `<span style="opacity:${on ? 1 : 0.35}">${on ? '★' : '☆'}</span>`
    }
    const fs = Math.min(node.height * 0.85, node.width / 6)
    return `<div style="${base};display:flex;align-items:center;justify-content:space-around;color:${node.color ?? '#fff'};font-size:${fs}px;line-height:1">${stars}</div>`
  }

  if (node.type === 'text') {
    const lh = Math.ceil((node.fontSize ?? 24) * 1.2)
    return `<div style="${base};color:${node.color ?? '#000'};font-size:${node.fontSize ?? 24}px;line-height:${lh}px;font-weight:${node.fontWeight === 'bold' ? 700 : 400};font-family:${node.fontFamily ?? 'system-ui,sans-serif'};text-align:${node.textAlign ?? 'left'};display:flex;align-items:center;justify-content:${node.textAlign === 'center' ? 'center' : node.textAlign === 'right' ? 'flex-end' : 'flex-start'};white-space:pre-wrap;overflow:hidden;word-break:break-word;${node.boxShadow ? `box-shadow:${node.boxShadow}` : ''}">${esc(node.text ?? '')}</div>`
  }

  if (node.type === 'button') {
    return `<div style="${base};background:${node.backgroundColor ?? '#e11'};border-radius:${node.borderRadius ?? 8}px;display:flex;align-items:center;justify-content:center;color:${node.color ?? '#fff'};font-size:${node.fontSize ?? 18}px;font-weight:${node.fontWeight === 'bold' ? 700 : 500};${node.boxShadow ? `box-shadow:${node.boxShadow}` : ''}">${esc(node.text ?? '')}</div>`
  }

  const bg = fillBackground(node)
  const stroke = node.stroke
  const sw = node.strokeWidth ?? 0
  const border = stroke && sw ? `border:${sw}px solid ${stroke}` : ''

  if (node.shape === 'ellipse') {
    return `<div style="${base};background:${bg};border-radius:50%;${border};${node.boxShadow ? `box-shadow:${node.boxShadow}` : ''}"></div>`
  }

  const points = normalizePoints(node.points)
  if (points && points.length >= 6) {
    const pairs = []
    for (let i = 0; i < points.length; i += 2) {
      pairs.push(`${points[i]}px ${points[i + 1]}px`)
    }
    return `<div style="${base};background:${bg};clip-path:polygon(${pairs.join(',')});${border};${node.boxShadow ? `box-shadow:${node.boxShadow}` : ''}"></div>`
  }

  return `<div style="${base};background:${bg};border-radius:${node.borderRadius ?? 0}px;${border};${node.boxShadow ? `box-shadow:${node.boxShadow}` : ''}"></div>`
}

/**
 * @param {object} tree
 * @param {string} assetsDir
 */
const GOOGLE_FONTS_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com" />' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' +
  '<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />'

export function buildHtmlDocument(tree, assetsDir, htmlFile = null) {
  const children = [...(tree.children ?? [])].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  const body = children.map((n) => renderNode(n, assetsDir, htmlFile)).join('\n')
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
${GOOGLE_FONTS_LINK}
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${tree.width}px; height: ${tree.height}px; overflow: hidden; }
  #frame {
    position: relative;
    width: ${tree.width}px;
    height: ${tree.height}px;
    background: ${tree.backgroundColor ?? '#fff'};
    overflow: hidden;
  }
</style>
</head>
<body>
<div id="frame">${body}</div>
</body>
</html>`
}

