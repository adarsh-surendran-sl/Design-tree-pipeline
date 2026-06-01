/**
 * Apply user-supplied content from the UI onto design tree nodes.
 * overrides: { [nodeId]: { text?, contentSource?, color?, fontSize?, ... } }
 */
export function applyUserOverrides(tree, overrides = {}) {
  const updated = JSON.parse(JSON.stringify(tree))
  const byId = overrides && typeof overrides === 'object' ? overrides : {}

  for (const node of updated.children || []) {
    const o = byId[node.id]
    if (!o) continue

    if (o.contentSource === 'user' || o.contentSource === 'crop') {
      node.contentSource = o.contentSource
    }
    if (o.text != null && o.text !== '') node.text = String(o.text)
    if (o.color != null) node.color = o.color
    if (o.fontSize != null) node.fontSize = Number(o.fontSize)
    if (o.fontWeight != null) node.fontWeight = o.fontWeight
    if (o.textAlign != null) node.textAlign = o.textAlign
    if (o.backgroundColor != null) node.backgroundColor = o.backgroundColor
    if (o.fill != null) node.fill = o.fill
    if (o.x != null) node.x = Number(o.x)
    if (o.y != null) node.y = Number(o.y)
    if (o.width != null) node.width = Number(o.width)
    if (o.height != null) node.height = Number(o.height)
    if (o.zIndex != null) node.zIndex = Number(o.zIndex)
    if (o.src) node.src = o.src
    if (o.fill != null) node.fill = o.fill
    if (o.stroke != null) node.stroke = o.stroke
    if (o.strokeWidth != null) node.strokeWidth = Number(o.strokeWidth)
    if (o.opacity != null) node.opacity = Number(o.opacity)
    if (o.borderRadius != null) node.borderRadius = Number(o.borderRadius)
    if (o.ratingValue != null) node.ratingValue = Number(o.ratingValue)
    if (o.gradientFrom != null) node.gradientFrom = o.gradientFrom
    if (o.gradientTo != null) node.gradientTo = o.gradientTo
    if (o.gradientAngle != null) node.gradientAngle = Number(o.gradientAngle)
    if (o.fontFamily != null) node.fontFamily = o.fontFamily
    if (o.objectFit != null) node.objectFit = o.objectFit
    if (o.type != null) node.type = o.type
    if (o.cssBackground != null) node.cssBackground = o.cssBackground
    if (o.renderChoice != null) node.renderChoice = o.renderChoice
  }

  return updated
}
