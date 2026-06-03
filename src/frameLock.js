/**
 * Lock design tree frame to source image dimensions and rescale child bboxes.
 */

/** Uniform scale from tree coords → source pixels (same for x and y). */
export function computeTreeScale(tree, srcW, srcH) {
  const tw = tree?.width || srcW
  const th = tree?.height || srcH
  if (!tw || !th) return 1
  return Math.min(srcW / tw, srcH / th)
}

function rescaleNodeBounds(node, sx, sy) {
  if (node.x != null) node.x = Math.round(node.x * sx)
  if (node.y != null) node.y = Math.round(node.y * sy)
  if (node.width != null) node.width = Math.max(1, Math.round(node.width * sx))
  if (node.height != null) node.height = Math.max(1, Math.round(node.height * sy))
  if (Array.isArray(node.points) && node.points.length >= 2) {
    node.points = node.points.map((v, i) => Math.round(v * (i % 2 === 0 ? sx : sy)))
  }
}

/**
 * Force tree.width/height to source pixels; rescale children if LLM frame differed.
 */
export function lockFrameToSource(tree, srcW, srcH) {
  const updated = JSON.parse(JSON.stringify(tree))
  const oldW = updated.width || srcW
  const oldH = updated.height || srcH

  if (oldW === srcW && oldH === srcH) {
    updated.width = srcW
    updated.height = srcH
    return updated
  }

  const sx = srcW / oldW
  const sy = srcH / oldH
  for (const node of updated.children || []) {
    rescaleNodeBounds(node, sx, sy)
  }

  updated.width = srcW
  updated.height = srcH
  updated._frameRescaled = { from: { width: oldW, height: oldH }, to: { width: srcW, height: srcH } }
  return updated
}

/** Map tree-space bbox to source pixel crop box using uniform scale. */
export function treeBoxToSourcePixels(node, srcW, srcH, tree) {
  const scale = computeTreeScale(tree, srcW, srcH)
  const pad = 1
  let x0 = Math.round(node.x * scale) - pad
  let y0 = Math.round(node.y * scale) - pad
  let x1 = Math.round((node.x + node.width) * scale) + pad
  let y1 = Math.round((node.y + node.height) * scale) + pad

  x0 = Math.max(0, Math.min(x0, srcW - 1))
  y0 = Math.max(0, Math.min(y0, srcH - 1))
  x1 = Math.max(x0 + 1, Math.min(x1, srcW))
  y1 = Math.max(y0 + 1, Math.min(y1, srcH))
  if (x1 - x0 < 2 || y1 - y0 < 2) return null
  return { left: x0, top: y0, width: x1 - x0, height: y1 - y0 }
}

/** Map source pixel bbox to tree coordinates. */
export function sourcePixelsToTreeBox(bbox, srcW, srcH, tree) {
  const scale = computeTreeScale(tree, srcW, srcH)
  if (!scale) return bbox
  return {
    x: Math.round(bbox.left / scale),
    y: Math.round(bbox.top / scale),
    width: Math.max(1, Math.round(bbox.width / scale)),
    height: Math.max(1, Math.round(bbox.height / scale)),
  }
}
