/**
 * Pure helpers for design tree editor (testable without DOM).
 */

export function findNode(tree, nodeId) {
  return (tree.children || []).find((n) => n.id === nodeId) || null
}

export function updateNodeBounds(tree, nodeId, bounds) {
  const node = findNode(tree, nodeId)
  if (!node || !bounds) return tree
  if (bounds.x != null) node.x = Math.round(Number(bounds.x))
  if (bounds.y != null) node.y = Math.round(Number(bounds.y))
  if (bounds.width != null) node.width = Math.max(1, Math.round(Number(bounds.width)))
  if (bounds.height != null) node.height = Math.max(1, Math.round(Number(bounds.height)))
  return tree
}

export function updateNodeField(tree, nodeId, key, value) {
  const node = findNode(tree, nodeId)
  if (!node) return tree
  if (value === undefined || value === null) return tree
  if (key === 'fontSize' || key === 'zIndex' || key === 'ratingValue' || key === 'opacity') {
    node[key] = Number(value)
  } else {
    node[key] = value
  }
  return tree
}

export function reorderNodeZIndex(tree, nodeId, direction) {
  const children = [...(tree.children || [])].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  const idx = children.findIndex((n) => n.id === nodeId)
  if (idx < 0) return tree
  const swap = direction === 'up' ? idx + 1 : idx - 1
  if (swap < 0 || swap >= children.length) return tree
  const a = children[idx]
  const b = children[swap]
  const tmp = a.zIndex ?? idx
  a.zIndex = b.zIndex ?? swap
  b.zIndex = tmp
  return tree
}

export function applyOverridesFromProps(tree, overrides) {
  const updated = JSON.parse(JSON.stringify(tree))
  if (overrides.frame?.backgroundColor) {
    updated.backgroundColor = overrides.frame.backgroundColor
  }
  for (const [nodeId, o] of Object.entries(overrides.nodes || overrides)) {
    if (nodeId === 'frame' || nodeId === 'nodes') continue
    const node = findNode(updated, nodeId)
    if (!node || typeof o !== 'object') continue
    for (const [k, v] of Object.entries(o)) {
      if (v !== undefined && v !== null) node[k] = v
    }
  }
  return updated
}
