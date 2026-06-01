import { AbsoluteFill } from 'remotion'
import { DesignTreeNode } from './DesignTreeNode.jsx'

/**
 * Common Remotion component that renders any design tree JSON.
 * Used as a Still composition and in the Player preview grid.
 */
export function DesignTreeFrame({ tree, assetsBaseUrl = '' }) {
  if (!tree) return null

  const children = [...(tree.children ?? [])].sort(
    (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0),
  )

  return (
    <AbsoluteFill
      style={{
        width: tree.width,
        height: tree.height,
        background: tree.backgroundColor ?? '#ffffff',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: tree.width,
          height: tree.height,
          background: tree.backgroundColor ?? '#ffffff',
        }}
      >
        {children.map((node) => (
          <DesignTreeNode key={node.id} node={node} assetsBaseUrl={assetsBaseUrl} />
        ))}
      </div>
    </AbsoluteFill>
  )
}
