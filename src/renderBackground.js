/**
 * Resolve CSS background for shape/frame nodes.
 * Prefer explicit cssBackground (conic-gradient, repeating patterns, etc.)
 * over two-stop linear gradient fields.
 */

export function resolveNodeBackground(node) {
  if (node?.cssBackground && String(node.cssBackground).trim()) {
    return String(node.cssBackground).trim()
  }
  if (node?.gradientFrom && node?.gradientTo) {
    const angle = node.gradientAngle ?? 90
    return `linear-gradient(${angle}deg, ${node.gradientFrom}, ${node.gradientTo})`
  }
  return node?.fill ?? node?.backgroundColor ?? 'transparent'
}

export function hasCssBackground(node) {
  return Boolean(node?.cssBackground && String(node.cssBackground).trim())
}
