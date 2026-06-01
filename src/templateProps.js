import { RASTER_TYPES } from './capabilities.js'

const ROLE_LABELS = {
  product: 'Product image',
  logo: 'Logo',
  headline: 'Headline',
  tagline: 'Tagline',
  body_text: 'Body text',
  cta: 'Call to action',
  badge: 'Badge / offer',
  price: 'Price',
  rating: 'Rating',
  background_fill: 'Background',
  decorative: 'Decoration',
  overlay: 'Overlay',
  icon: 'Icon',
}

const PRIORITY_BY_ROLE = {
  product: 1,
  headline: 2,
  tagline: 3,
  cta: 4,
  rating: 5,
  price: 6,
  badge: 7,
  logo: 8,
  body_text: 9,
  icon: 10,
  decorative: 11,
  overlay: 12,
  background_fill: 13,
}

function nodeLabel(node) {
  if (node.role && ROLE_LABELS[node.role]) return ROLE_LABELS[node.role]
  if (node.id === 'product') return 'Product image'
  if (node.id === 'logo') return 'Logo'
  return node.id || 'Layer'
}

function isRasterNode(node) {
  return RASTER_TYPES.has(node.type) || node.role === 'product' || node.role === 'logo'
}

function isTextNode(node) {
  return node.type === 'text' || node.type === 'button'
}

function field(key, kind, label, value, extra = {}) {
  return { key, kind, label, value: value ?? '', ...extra }
}

function fieldsForNode(node, assetsBaseUrl) {
  const fields = []

  if (isTextNode(node)) {
    fields.push(field('text', 'textarea', 'Text', node.text || ''))
    fields.push(field('color', 'color', 'Text color', node.color || '#111111'))
    fields.push(field('fontSize', 'number', 'Font size (px)', node.fontSize ?? 24, { min: 8, max: 160 }))
    fields.push(field('fontWeight', 'select', 'Weight', node.fontWeight || 'normal', {
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'bold', label: 'Bold' },
      ],
    }))
    fields.push(field('textAlign', 'select', 'Alignment', node.textAlign || 'center', {
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    }))
    if (node.type === 'button') {
      fields.push(field('backgroundColor', 'color', 'Button fill', node.backgroundColor || '#e85d04'))
    }
  }

  if (isRasterNode(node)) {
    const previewSrc =
      node.src && assetsBaseUrl
        ? `${assetsBaseUrl.replace(/\/$/, '')}/${String(node.src).replace(/^\//, '')}`
        : null
    fields.push(
      field('image', 'image', 'Replace image', node.src || '', {
        hint: 'PNG/JPG/WebP — keeps layout size',
        currentSrc: node.src || null,
        previewSrc,
      }),
    )
  }

  if (node.type === 'shape') {
    if (node.cssBackground) {
      fields.push(field('cssBackground', 'text', 'CSS background', node.cssBackground))
    }
    if (node.gradientFrom && node.gradientTo) {
      fields.push(field('gradientFrom', 'color', 'Gradient start', node.gradientFrom))
      fields.push(field('gradientTo', 'color', 'Gradient end', node.gradientTo))
    } else if (!node.cssBackground) {
      fields.push(field('fill', 'color', 'Fill color', node.fill || node.backgroundColor || '#cccccc'))
    }
    if (node.opacity != null && node.opacity < 1) {
      fields.push(field('opacity', 'number', 'Opacity', node.opacity, { min: 0, max: 1, step: 0.05 }))
    }
  }

  if (node.type === 'rating') {
    fields.push(field('ratingValue', 'number', 'Stars', node.ratingValue ?? 5, { min: 0, max: 5, step: 0.5 }))
  }

  return fields
}

/**
 * Describe editable template properties for the customization UI.
 */
export function describeTemplateProps(tree, { assetsBaseUrl = null, brief = null } = {}) {
  const nodes = (tree.children || [])
    .map((node) => {
      const fields = fieldsForNode(node, assetsBaseUrl)
      if (!fields.length) return null
      return {
        id: node.id,
        type: node.type,
        role: node.role || '',
        priority: PRIORITY_BY_ROLE[node.role || ''] || 99,
        label: nodeLabel(node),
        box: {
          x: node.x,
          y: node.y,
          width: node.width,
          height: node.height,
        },
        fields,
        previewSrc:
          isRasterNode(node) && node.src && assetsBaseUrl
            ? `${assetsBaseUrl.replace(/\/$/, '')}/${node.src.replace(/^\//, '')}`
            : null,
      }
    })
    .filter(Boolean)

  nodes.sort((a, b) => {
    const ai = a.priority ?? 99
    const bi = b.priority ?? 99
    if (ai !== bi) return ai - bi
    return a.id.localeCompare(b.id)
  })

  const briefRating = brief?.rating ? Number(brief.rating) : null
  if (briefRating != null && Number.isFinite(briefRating)) {
    const ratingNode = nodes.find((n) => n.id === 'rating' || n.role === 'rating')
    if (ratingNode) {
      const f = ratingNode.fields.find((x) => x.key === 'ratingValue')
      if (f) f.value = briefRating
    }
  }

  return {
    frame: {
      width: tree.width ?? 1080,
      height: tree.height ?? 1080,
      backgroundColor: tree.backgroundColor ?? '#ffffff',
      fields: [
        field('backgroundColor', 'color', 'Canvas background', tree.backgroundColor ?? '#ffffff'),
      ],
    },
    nodes,
    summary: {
      textLayers: nodes.filter((n) => n.fields.some((f) => f.key === 'text')).length,
      imageLayers: nodes.filter((n) => n.fields.some((f) => f.key === 'image')).length,
    },
  }
}
