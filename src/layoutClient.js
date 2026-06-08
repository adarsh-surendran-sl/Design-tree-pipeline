import fs from 'fs'
import path from 'path'

const DEFAULT_TIMEOUT = Number(process.env.LAYOUT_SERVICE_TIMEOUT_MS || 30000)

export function isLayoutServiceEnabled() {
  if (process.env.LAYOUT_SERVICE_ENABLED === '0') return false
  if (process.env.LAYOUT_SERVICE_ENABLED === '1') return Boolean(process.env.LAYOUT_SERVICE_URL)
  return Boolean(process.env.LAYOUT_SERVICE_URL)
}

export function getLayoutServiceUrl() {
  return String(process.env.LAYOUT_SERVICE_URL || '').replace(/\/$/, '')
}

export async function checkLayoutServiceHealth() {
  const base = getLayoutServiceUrl()
  if (!base) return false
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 5000)
    const res = await fetch(`${base}/health`, { signal: ctrl.signal })
    clearTimeout(t)
    return res.ok
  } catch {
    return false
  }
}

/**
 * @returns {Promise<import('./mergeLayoutRegions.js').LayoutAnalysis|null>}
 */
export async function analyzeLayout(imagePath, { jobDir = null } = {}) {
  if (!isLayoutServiceEnabled()) return null

  const base = getLayoutServiceUrl()
  const timeout = DEFAULT_TIMEOUT
  const imagePathResolved = path.resolve(imagePath)

  const form = new FormData()
  const buf = fs.readFileSync(imagePathResolved)
  const ext = path.extname(imagePathResolved).toLowerCase()
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  form.append('file', new Blob([buf], { type: mime }), path.basename(imagePathResolved))

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)

  try {
    const res = await fetch(`${base}/v1/analyze`, {
      method: 'POST',
      body: form,
      signal: ctrl.signal,
    })
    clearTimeout(timer)
    if (!res.ok) {
      console.warn(`Layout service HTTP ${res.status}`)
      return null
    }
    const data = await res.json()
    if (jobDir) {
      try {
        fs.mkdirSync(jobDir, { recursive: true })
        fs.writeFileSync(path.join(jobDir, 'layout_analysis.json'), JSON.stringify(data, null, 2), 'utf8')
      } catch {
        /* ignore */
      }
    }
    return data
  } catch (e) {
    clearTimeout(timer)
    console.warn('Layout service analyze failed:', e?.message || e)
    return null
  }
}

/**
 * @returns {Promise<{ bbox: number[], engine?: string }|null>}
 */
export async function segmentProductLayout(imagePath, bbox) {
  if (!isLayoutServiceEnabled()) return null
  const base = getLayoutServiceUrl()
  const imagePathResolved = path.resolve(imagePath)
  const [x0, y0, x1, y1] = (bbox || [0, 0, 0, 0]).map(Math.round)

  const form = new FormData()
  const buf = fs.readFileSync(imagePathResolved)
  const ext = path.extname(imagePathResolved).toLowerCase()
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  form.append('file', new Blob([buf], { type: mime }), path.basename(imagePathResolved))

  const url = new URL(`${base}/v1/segment/product`)
  url.searchParams.set('bbox_x0', String(x0))
  url.searchParams.set('bbox_y0', String(y0))
  url.searchParams.set('bbox_x1', String(x1))
  url.searchParams.set('bbox_y1', String(y1))

  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), DEFAULT_TIMEOUT)
  try {
    const res = await fetch(url.toString(), { method: 'POST', body: form, signal: ctrl.signal })
    clearTimeout(timer)
    if (!res.ok) return null
    return res.json()
  } catch (e) {
    clearTimeout(timer)
    console.warn('Layout segment/product failed:', e?.message || e)
    return null
  }
}

/**
 * Score pair via layout service (optional perceptual).
 */
export async function scoreLayoutPair(originalPath, renderedPath) {
  if (!isLayoutServiceEnabled()) return null
  const base = getLayoutServiceUrl()
  try {
    const res = await fetch(`${base}/v1/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        original_path: path.resolve(originalPath),
        rendered_path: path.resolve(renderedPath),
      }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
