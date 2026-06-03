import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { RASTER_TYPES } from './capabilities.js'
import { computeTreeScale, treeBoxToSourcePixels } from './frameLock.js'
import { trimTransparentPng } from './productAsset.js'

export async function getImageDimensions(imagePath) {
  const meta = await sharp(imagePath).metadata()
  if (!meta.width || !meta.height) throw new Error(`Cannot read image dims: ${imagePath}`)
  return [meta.width, meta.height]
}

function safeId(nodeId) {
  return String(nodeId)
    .split('')
    .map((c) => (/[a-zA-Z0-9_-]/.test(c) ? c : '_'))
    .join('')
    .slice(0, 64)
}

function isProductLike(node) {
  const role = String(node.role || '').toLowerCase()
  const id = String(node.id || '').toLowerCase()
  return (
    role === 'product' ||
    role === 'logo' ||
    role === 'hero' ||
    id.includes('product') ||
    id.includes('bottle') ||
    id.includes('hero') ||
    id === 'logo'
  )
}

export async function embedRasterAssets(tree, sourceImagePath, assetsDir) {
  assetsDir = path.resolve(assetsDir)
  fs.mkdirSync(assetsDir, { recursive: true })

  const sourceImage = path.resolve(sourceImagePath)
  const [srcW, srcH] = await getImageDimensions(sourceImage)

  const updated = JSON.parse(JSON.stringify(tree))
  const src = sharp(sourceImage)

  const frameArea = Math.max(1, updated.width * updated.height)

  for (const node of updated.children || []) {
    if (!RASTER_TYPES.has(node.type)) continue
    if (node.contentSource === 'user' && node.src) continue
    if (node.width < 2 || node.height < 2) continue
    const area = node.width * node.height
    if (area >= frameArea * 0.82) continue

    const cropBox = treeBoxToSourcePixels(node, srcW, srcH, updated)
    if (!cropBox) continue

    const dest = path.join(assetsDir, `${safeId(node.id)}.png`)
    await src.clone().extract(cropBox).png().toFile(dest)

    if (isProductLike(node)) {
      const trimmed = path.join(assetsDir, `${safeId(node.id)}_trim.png`)
      if (await trimTransparentPng(dest, trimmed)) {
        fs.copyFileSync(trimmed, dest)
        fs.unlinkSync(trimmed)
      }
      node.objectFit = 'contain'
    }

    node.src = `assets/${path.basename(dest)}`
  }
  return updated
}

/** Letterbox two images to same canvas (preserves aspect ratio). */
async function letterboxToSize(inputPath, targetW, targetH, bg = { r: 255, g: 255, b: 255 }) {
  const meta = await sharp(inputPath).metadata()
  if (!meta.width || !meta.height) throw new Error(`Missing dims: ${inputPath}`)

  const scale = Math.min(targetW / meta.width, targetH / meta.height)
  const w = Math.round(meta.width * scale)
  const h = Math.round(meta.height * scale)
  const left = Math.round((targetW - w) / 2)
  const top = Math.round((targetH - h) / 2)

  const resized = await sharp(inputPath).resize(w, h, { fit: 'inside' }).removeAlpha().png().toBuffer()
  return sharp({
    create: { width: targetW, height: targetH, channels: 3, background: bg },
  })
    .composite([{ input: resized, left, top }])
    .png()
    .toBuffer()
}

export async function buildCompareStrip(originalPath, renderedPath, outputPath) {
  originalPath = path.resolve(originalPath)
  renderedPath = path.resolve(renderedPath)
  outputPath = path.resolve(outputPath)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })

  const [oMeta, rMeta] = await Promise.all([sharp(originalPath).metadata(), sharp(renderedPath).metadata()])
  const oW = oMeta.width
  const oH = oMeta.height
  if (!oW || !oH) throw new Error('Missing original dimensions')
  if (!rMeta.width || !rMeta.height) throw new Error('Missing rendered dimensions')

  const canvasW = oW
  const canvasH = oH

  const maxHeight = 1568
  const scale = oH > maxHeight ? maxHeight / oH : 1
  const labelH = 28
  const gap = 8
  const panelW = Math.round(canvasW * scale)
  const panelH = Math.round(canvasH * scale)
  const outH = panelH + labelH
  const outW = panelW * 2 + gap

  const bg = { r: 32, g: 32, b: 32 }
  const [oPanel, rPanel] = await Promise.all([
    letterboxToSize(originalPath, panelW, panelH, { r: 32, g: 32, b: 32 }),
    letterboxToSize(renderedPath, panelW, panelH, { r: 32, g: 32, b: 32 }),
  ])

  const labelSvg = (text, x) =>
    `<svg width="${outW}" height="${labelH}">
      <rect x="0" y="0" width="${outW}" height="${labelH}" fill="transparent"/>
      <text x="${x}" y="${Math.round(labelH * 0.78)}" fill="rgb(220,220,220)" font-size="20" font-family="Arial, Helvetica, sans-serif">${text}</text>
    </svg>`

  const label1 = await sharp(Buffer.from(labelSvg('ORIGINAL', 8))).png().toBuffer()
  const label2 = await sharp(
    Buffer.from(labelSvg('RECONSTRUCTED', Math.round(panelW + gap + 8))),
  ).png().toBuffer()

  const base = sharp({
    create: { width: outW, height: outH, channels: 3, background: bg },
  })

  await base
    .composite([
      { input: oPanel, left: 0, top: labelH },
      { input: rPanel, left: Math.round(panelW + gap), top: labelH },
      { input: label1, left: 0, top: 0 },
      { input: label2, left: 0, top: 0 },
    ])
    .png()
    .toFile(outputPath)

  return outputPath
}

export { computeTreeScale, treeBoxToSourcePixels }
