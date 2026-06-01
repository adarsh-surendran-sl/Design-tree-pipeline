import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { RASTER_TYPES } from './capabilities.js'

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

function treeBoxToPixels(node, srcW, srcH, scaleX, scaleY) {
  const pad = 1
  let x0 = Math.round(node.x * scaleX) - pad
  let y0 = Math.round(node.y * scaleY) - pad
  let x1 = Math.round((node.x + node.width) * scaleX) + pad
  let y1 = Math.round((node.y + node.height) * scaleY) + pad

  x0 = Math.max(0, Math.min(x0, srcW - 1))
  y0 = Math.max(0, Math.min(y0, srcH - 1))
  x1 = Math.max(x0 + 1, Math.min(x1, srcW))
  y1 = Math.max(y0 + 1, Math.min(y1, srcH))
  if (x1 - x0 < 2 || y1 - y0 < 2) return null
  return { left: x0, top: y0, width: x1 - x0, height: y1 - y0 }
}

export async function embedRasterAssets(tree, sourceImagePath, assetsDir) {
  assetsDir = path.resolve(assetsDir)
  fs.mkdirSync(assetsDir, { recursive: true })

  const sourceImage = path.resolve(sourceImagePath)
  const [srcW, srcH] = await getImageDimensions(sourceImage)

  const scaleX = tree.width ? srcW / tree.width : 1.0
  const scaleY = tree.height ? srcH / tree.height : 1.0

  const updated = JSON.parse(JSON.stringify(tree))
  const src = sharp(sourceImage)

  const frameArea = Math.max(1, updated.width * updated.height)

  for (const node of updated.children || []) {
    if (!RASTER_TYPES.has(node.type)) continue
    // User-provided asset: keep src set by upload API
    if (node.contentSource === 'user' && node.src) continue
    if (node.width < 2 || node.height < 2) continue
    const area = node.width * node.height
    if (area >= frameArea * 0.82) continue
    const cropBox = treeBoxToPixels(node, srcW, srcH, scaleX, scaleY)
    if (!cropBox) continue

    const dest = path.join(assetsDir, `${safeId(node.id)}.png`)
    await src.clone().extract(cropBox).png().toFile(dest)
    node.src = `assets/${path.basename(dest)}`
  }
  return updated
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

  // Match sizes
  let oImg = sharp(originalPath).resize(oW, oH, { fit: 'fill' })
  let rImg = sharp(renderedPath)
  if (rMeta.width !== oW || rMeta.height !== oH) {
    rImg = rImg.resize(oW, oH, { fit: 'fill' })
  }

  const maxHeight = 1568
  const scale = oH > maxHeight ? maxHeight / oH : 1
  const labelH = 28
  const gap = 8
  const outH = Math.round(oH * scale) + labelH
  const outW = Math.round(oW * scale) * 2 + gap

  const oResizedW = Math.round(oW * scale)
  const oResizedH = Math.round(oH * scale)

  oImg = oImg.resize(oResizedW, oResizedH)
  rImg = rImg.resize(oResizedW, oResizedH)

  const bg = { r: 32, g: 32, b: 32 }
  const base = sharp({
    create: {
      width: outW,
      height: outH,
      channels: 3,
      background: bg,
    },
  })

  const labelSvg = (text, x) => {
    return `<svg width="${outW}" height="${labelH}">
      <rect x="0" y="0" width="${outW}" height="${labelH}" fill="transparent"/>
      <text x="${x}" y="${Math.round(labelH * 0.78)}" fill="rgb(220,220,220)" font-size="20" font-family="Arial, Helvetica, sans-serif">${text}</text>
    </svg>`
  }

  const label1 = await sharp(Buffer.from(labelSvg('ORIGINAL', 8))).png().toBuffer()
  const label2 = await sharp(
    Buffer.from(labelSvg('RECONSTRUCTED', Math.round(oResizedW + gap + 8))),
  ).png().toBuffer()

  const composite = [
    { input: await oImg.png().toBuffer(), left: 0, top: labelH },
    { input: await rImg.png().toBuffer(), left: Math.round(oResizedW + gap), top: labelH },
    { input: label1, left: 0, top: 0 },
    { input: label2, left: 0, top: 0 },
  ]

  await base.composite(composite).png().toFile(outputPath)
  return outputPath
}

