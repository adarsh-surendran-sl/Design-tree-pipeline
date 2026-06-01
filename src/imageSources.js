import fs from 'fs'
import path from 'path'

const EXT_FROM_MIME = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/gif': '.gif',
}

function extFromUrl(url) {
  try {
    const p = new URL(url).pathname.toLowerCase()
    const m = p.match(/\.(png|jpe?g|webp|gif)$/)
    if (m) return m[0] === '.jpeg' ? '.jpg' : m[0]
  } catch {
    /* ignore */
  }
  return '.png'
}

export function isValidImageUrl(url) {
  try {
    const u = new URL(String(url).trim())
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Download image from a public URL into job folder (for vision + local assets).
 */
export async function downloadImageFromUrl(imageUrl, destPath) {
  imageUrl = String(imageUrl).trim()
  if (!isValidImageUrl(imageUrl)) {
    throw new Error('Invalid image URL — must start with http:// or https://')
  }

  const res = await fetch(imageUrl, {
    redirect: 'follow',
    signal: AbortSignal.timeout(60000),
    headers: { Accept: 'image/*' },
  })

  if (!res.ok) {
    throw new Error(`Could not download image (${res.status}): ${imageUrl}`)
  }

  const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() || ''
  if (contentType && !contentType.startsWith('image/')) {
    throw new Error(`URL did not return an image (content-type: ${contentType || 'unknown'})`)
  }

  let ext = EXT_FROM_MIME[contentType] || extFromUrl(imageUrl)
  if (!destPath.match(/\.(png|jpe?g|webp|gif)$/i)) {
    destPath = destPath.replace(/\.\w+$/, '') + ext
  }

  const buf = Buffer.from(await res.arrayBuffer())
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  fs.writeFileSync(destPath, buf)
  return { path: destPath, buffer: buf }
}
