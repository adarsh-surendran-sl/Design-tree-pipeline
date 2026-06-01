function normalizePoints(value) {
  if (value == null) return null
  if (Array.isArray(value) && value.length && typeof value[0] === 'number') {
    return value.map(Number)
  }
  if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
    const flat = []
    for (const p of value) {
      flat.push(Number(p.x ?? p.X ?? 0), Number(p.y ?? p.Y ?? 0))
    }
    return flat.length >= 6 ? flat : null
  }
  return null
}

function resolveAssetUrl(src, assetsBaseUrl) {
  if (!src) return null
  if (/^(data:|blob:|https?:)/.test(src)) return src
  const base = src.replace(/^assets\//, '')
  return `${assetsBaseUrl.replace(/\/$/, '')}/${base}`
}

function boxStyle(node) {
  return {
    position: 'absolute',
    boxSizing: 'border-box',
    left: node.x ?? 0,
    top: node.y ?? 0,
    width: node.width ?? 100,
    height: node.height ?? 40,
    zIndex: node.zIndex ?? 0,
    opacity: node.opacity ?? 1,
  }
}

function fillBackground(node) {
  if (node.cssBackground && String(node.cssBackground).trim()) {
    return String(node.cssBackground).trim()
  }
  if (node.gradientFrom && node.gradientTo) {
    const angle = node.gradientAngle ?? 90
    return `linear-gradient(${angle}deg, ${node.gradientFrom}, ${node.gradientTo})`
  }
  return node.fill ?? node.backgroundColor ?? 'transparent'
}

export function DesignTreeNode({ node, assetsBaseUrl }) {
  const base = boxStyle(node)
  const raster = new Set(['image', 'logo', 'background'])

  if (raster.has(node.type) && node.src) {
    const url = resolveAssetUrl(node.src, assetsBaseUrl)
    let fit = node.objectFit === 'contain' ? 'contain' : 'cover'
    if (node.role === 'product' || node.id === 'product' || node.role === 'logo' || node.id === 'logo') {
      fit = 'contain'
    }
    return (
      <img
        alt={node.id}
        src={url}
        style={{ ...base, objectFit: fit, objectPosition: 'center' }}
      />
    )
  }

  if (node.type === 'rating') {
    const value = Math.max(0, Math.min(5, Number(node.ratingValue ?? 5)))
    const fs = Math.min((node.height ?? 40) * 0.85, (node.width ?? 100) / 6)
    const stars = []
    for (let i = 0; i < 5; i += 1) {
      const on = value >= i + 1 || value >= i + 0.5
      stars.push(
        <span key={i} style={{ opacity: on ? 1 : 0.35 }}>
          {on ? '★' : '☆'}
        </span>,
      )
    }
    return (
      <div
        style={{
          ...base,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          color: node.color ?? '#fff',
          fontSize: fs,
          lineHeight: 1,
        }}
      >
        {stars}
      </div>
    )
  }

  if (node.type === 'text') {
    const fs = node.fontSize ?? 24
    const align = node.textAlign ?? 'left'
    return (
      <div
        style={{
          ...base,
          color: node.color ?? '#000',
          fontSize: fs,
          lineHeight: `${Math.ceil(fs * 1.2)}px`,
          fontWeight: node.fontWeight === 'bold' ? 700 : 400,
          fontFamily: node.fontFamily ?? 'system-ui, sans-serif',
          textAlign: align,
          display: 'flex',
          alignItems: 'center',
          justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          wordBreak: 'break-word',
          boxShadow: node.boxShadow,
        }}
      >
        {node.text ?? ''}
      </div>
    )
  }

  if (node.type === 'button') {
    return (
      <div
        style={{
          ...base,
          background: node.backgroundColor ?? '#e11',
          borderRadius: node.borderRadius ?? 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: node.color ?? '#fff',
          fontSize: node.fontSize ?? 18,
          fontWeight: node.fontWeight === 'bold' ? 700 : 500,
          boxShadow: node.boxShadow,
        }}
      >
        {node.text ?? ''}
      </div>
    )
  }

  const bg = fillBackground(node)
  const border =
    node.stroke && node.strokeWidth
      ? `${node.strokeWidth}px solid ${node.stroke}`
      : undefined

  if (node.shape === 'ellipse') {
    return (
      <div
        style={{
          ...base,
          background: bg,
          borderRadius: '50%',
          border,
          boxShadow: node.boxShadow,
        }}
      />
    )
  }

  const points = normalizePoints(node.points)
  if (points && points.length >= 6) {
    const pairs = []
    for (let i = 0; i < points.length; i += 2) {
      pairs.push(`${points[i]}px ${points[i + 1]}px`)
    }
    return (
      <div
        style={{
          ...base,
          background: bg,
          clipPath: `polygon(${pairs.join(', ')})`,
          border,
          boxShadow: node.boxShadow,
        }}
      />
    )
  }

  return (
    <div
      style={{
        ...base,
        background: bg,
        borderRadius: node.borderRadius ?? 0,
        border,
        boxShadow: node.boxShadow,
      }}
    />
  )
}
