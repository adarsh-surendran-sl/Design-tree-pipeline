import sharp from 'sharp'

export const RECONSTRUCTION_SCORE_GOOD = 0.82
export const RECONSTRUCTION_SCORE_RETRY = 0.72

/**
 * Similarity score 0–1 (1 = identical) via mean absolute error on resized RGB.
 */
export async function scoreReconstruction(originalPath, renderedPath) {
  const size = 256
  const [oBuf, rBuf] = await Promise.all([
    sharp(originalPath).resize(size, size, { fit: 'fill' }).removeAlpha().raw().toBuffer(),
    sharp(renderedPath).resize(size, size, { fit: 'fill' }).removeAlpha().raw().toBuffer(),
  ])

  const n = Math.min(oBuf.length, rBuf.length)
  if (!n) return { similarity: 0, mae: 255 }

  let sum = 0
  for (let i = 0; i < n; i += 1) sum += Math.abs(oBuf[i] - rBuf[i])
  const mae = sum / n
  const similarity = Math.max(0, Math.min(1, 1 - mae / 128))

  return {
    similarity: Math.round(similarity * 1000) / 1000,
    mae: Math.round(mae * 10) / 10,
    passes: similarity >= RECONSTRUCTION_SCORE_GOOD,
    needsRetry: similarity < RECONSTRUCTION_SCORE_RETRY,
  }
}
