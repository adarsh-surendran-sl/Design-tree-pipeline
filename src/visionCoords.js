/**
 * Map bbox coordinates from Claude vision API space to source image pixels.
 * Claude resizes images; bboxes in patches may be relative to that space.
 */

/** Standard Claude vision long-edge target (approximate). */
export const CLAUDE_VISION_MAX_EDGE = 1568

/**
 * Compute scale and padding when image is fit inside max edge (preserve aspect).
 * @returns {{ scale: number, padX: number, padY: number, apiW: number, apiH: number }}
 */
export function claudeVisionTransform(srcW, srcH, maxEdge = CLAUDE_VISION_MAX_EDGE) {
  const scale = Math.min(maxEdge / srcW, maxEdge / srcH, 1)
  const apiW = Math.round(srcW * scale)
  const apiH = Math.round(srcH * scale)
  return { scale, padX: 0, padY: 0, apiW, apiH }
}

/** Map point/box from API-normalized 0..1 coords to source pixels. */
export function normalizedBoxToSource(norm, srcW, srcH) {
  const [a, b, c, d] = norm.map(Number)
  if (c <= 1 && d <= 1 && a <= 1 && b <= 1) {
    return {
      x: Math.round(a * srcW),
      y: Math.round(b * srcH),
      width: Math.max(1, Math.round((c - a) * srcW)),
      height: Math.max(1, Math.round((d - b) * srcH)),
    }
  }
  return { x: Math.round(a), y: Math.round(b), width: Math.max(1, Math.round(c - a)), height: Math.max(1, Math.round(d - b)) }
}

/**
 * If bbox values look like API-scaled coords (smaller than frame), scale up to source.
 */
export function rescaleBboxPatchChanges(changes, srcW, srcH, frameW, frameH) {
  if (!changes || typeof changes !== 'object') return changes
  const out = { ...changes }
  const keys = ['x', 'y', 'width', 'height']
  const hasBbox = keys.some((k) => out[k] != null)
  if (!hasBbox) return out

  const fw = frameW || srcW
  const fh = frameH || srcH
  if (fw === srcW && fh === srcH) return out

  const sx = srcW / fw
  const sy = srcH / fh
  if (Math.abs(sx - 1) < 0.02 && Math.abs(sy - 1) < 0.02) return out

  for (const k of keys) {
    if (out[k] == null) continue
    out[k] = Math.round(Number(out[k]) * (k === 'x' || k === 'width' ? sx : sy))
  }
  if (Array.isArray(out.points)) {
    out.points = out.points.map((v, i) => Math.round(Number(v) * (i % 2 === 0 ? sx : sy)))
  }
  return out
}

/** Apply rescaling to all patches in a compare response. */
export function rescalePatchesToSource(patches, srcW, srcH, tree) {
  const fw = tree?.width || srcW
  const fh = tree?.height || srcH
  return (patches || []).map((p) => ({
    ...p,
    changes: rescaleBboxPatchChanges(p.changes, srcW, srcH, fw, fh),
  }))
}
