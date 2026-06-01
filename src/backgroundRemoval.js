import fs from 'fs'
import path from 'path'

import { callMcpTool } from './mcpClient.js'

/**
 * Remove background via Shopalyst MCP `remove_background` tool.
 * Requires a publicly reachable imageUrl (set PUBLIC_BASE_URL for local dev / tunnel).
 *
 * @param {string} imageUrl - public HTTP(S) URL of the source image
 * @param {{ crop?: boolean, useProxy?: boolean }} opts
 * @returns {Promise<string>} URL of the transparent PNG
 */
export async function removeImageBackgroundFromUrl(imageUrl, opts = {}) {
  const result = await callMcpTool('remove_background', {
    imageUrl,
    crop: opts.crop !== false ? 'true' : 'false',
    useProxy: opts.useProxy !== false ? 'true' : 'false',
  })

  const text = result?.content?.find((c) => c.type === 'text')?.text?.trim()
  if (!text || !/^https?:\/\//i.test(text)) {
    throw new Error(text || 'MCP remove_background did not return an image URL')
  }
  return text
}

async function downloadToFile(url, outputPath) {
  const res = await fetch(url, { signal: AbortSignal.timeout(120000) })
  if (!res.ok) throw new Error(`Failed to download processed image (${res.status})`)
  const buf = Buffer.from(await res.arrayBuffer())
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, buf)
  return outputPath
}

/**
 * @param {string} imagePath - local file already saved under the job folder
 * @param {string} outputPath - where to write PNG (e.g. assets/product.png)
 * @param {{ publicBaseUrl: string, jobId: string, crop?: boolean }} opts
 */
export async function removeBackgroundToFile(imagePath, outputPath, opts = {}) {
  const { publicBaseUrl, jobId, sourceUrl } = opts

  let imageUrl = sourceUrl?.trim() || ''
  if (imageUrl) {
    if (!/^https?:\/\//i.test(imageUrl)) {
      throw new Error('sourceUrl must be a public http(s) URL')
    }
  } else {
    if (!publicBaseUrl || !jobId) {
      throw new Error('removeBackgroundToFile requires sourceUrl or publicBaseUrl + jobId')
    }
    const fileName = path.basename(imagePath)
    imageUrl = `${String(publicBaseUrl).replace(/\/$/, '')}/runs/${jobId}/${fileName.split('/').map(encodeURIComponent).join('/')}`
  }

  const resultUrl = await removeImageBackgroundFromUrl(imageUrl, opts)
  return downloadToFile(resultUrl, outputPath)
}
