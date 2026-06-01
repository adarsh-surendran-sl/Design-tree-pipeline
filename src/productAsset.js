import sharp from 'sharp'

/**
 * Trim fully transparent padding from PNG product assets so objectFit:contain uses the hero better.
 */
export async function trimTransparentPng(inputPath, outputPath) {
  const img = sharp(inputPath)
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  if (!width || !height) return false

  let minX = width
  let minY = height
  let maxX = 0
  let maxY = 0
  let found = false

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * channels
      const a = data[i + (channels - 1)]
      if (a > 12) {
        found = true
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      }
    }
  }

  if (!found || maxX <= minX || maxY <= minY) return false

  const pad = 2
  const left = Math.max(0, minX - pad)
  const top = Math.max(0, minY - pad)
  const w = Math.min(width - left, maxX - minX + 1 + pad * 2)
  const h = Math.min(height - top, maxY - minY + 1 + pad * 2)

  await sharp(inputPath).extract({ left, top, width: w, height: h }).png().toFile(outputPath)
  return true
}
