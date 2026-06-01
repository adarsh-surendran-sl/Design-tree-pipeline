import { resolveNodeBackground } from './renderBackground.js'

function layerCss(node, tree) {
  const lines = [
    `position: absolute;`,
    `left: ${node.x ?? 0}px;`,
    `top: ${node.y ?? 0}px;`,
    `width: ${node.width ?? 100}px;`,
    `height: ${node.height ?? 40}px;`,
    `z-index: ${node.zIndex ?? 0};`,
  ]

  if (node.type === 'text' || node.type === 'button') {
    lines.push(`font-size: ${node.fontSize ?? 24}px;`)
    lines.push(`color: ${node.color ?? '#000'};`)
    lines.push(`font-family: ${node.fontFamily ?? 'system-ui'};`)
    lines.push(`text-align: ${node.textAlign ?? 'left'};`)
    if (node.type === 'button') lines.push(`background: ${node.backgroundColor ?? '#eee'};`)
  }

  if (node.type === 'shape' || node.cssBackground) {
    lines.push(`background: ${resolveNodeBackground(node)};`)
  }

  if (node.src) lines.push(`/* asset: ${node.src} */`)

  return lines.join('\n  ')
}

/**
 * Export design tree as a Figma-style layer reference (JSON + markdown).
 */
export function exportLayersReference(tree) {
  const children = [...(tree.children || [])].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  const layers = children.map((node, i) => ({
    index: i + 1,
    id: node.id,
    type: node.type,
    role: node.role || '',
    renderStrategy: node.renderStrategy || 'auto',
    box: { x: node.x, y: node.y, width: node.width, height: node.height },
    zIndex: node.zIndex ?? 0,
    text: node.text || null,
    cssBackground: node.cssBackground || null,
    src: node.src || null,
    css: layerCss(node, tree),
  }))

  const md = [
    `# Design layers — ${tree.width}×${tree.height}`,
    ``,
    `Frame background: \`${tree.backgroundColor ?? '#fff'}\``,
    ``,
    ...layers.map(
      (l) =>
        `## ${l.index}. ${l.id} (\`${l.type}\`, ${l.role || 'no role'})\n\n` +
        `Box: x=${l.box.x}, y=${l.box.y}, ${l.box.width}×${l.box.height}, z=${l.zIndex}\n\n` +
        (l.text ? `Text: "${l.text}"\n\n` : '') +
        '```css\n' +
        l.css +
        '\n```\n',
    ),
  ].join('\n')

  return {
    format: 'design-layers-v1',
    frame: {
      width: tree.width,
      height: tree.height,
      backgroundColor: tree.backgroundColor,
    },
    layers,
    markdown: md,
  }
}
