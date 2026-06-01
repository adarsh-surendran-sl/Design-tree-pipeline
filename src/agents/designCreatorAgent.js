import { capabilityPromptBlock, normalizeTreeStrategies } from '../capabilities.js'
import { regionsToChildren } from '../composition.js'
import { parseDesignTree } from '../schemas.js'
import { visionJson } from '../llmClient.js'
import { resolveFrameFormat, safeMarginForFrame } from '../frameFormats.js'
import { categoryLayoutHint } from '../templates/categoryHints.js'
import { designSkillsPromptBlock } from '../designSkills.js'

const DEFAULT_GENERATE_COUNT = Number(process.env.AD_GENERATE_COUNT) || 6
const DEFAULT_OUTPUT_COUNT = Number(process.env.AD_OUTPUT_COUNT) || 4

/** Fallback layout hints only when strategist concepts are missing (not the primary driver). */
const FALLBACK_ANGLES = [
  'editorial magazine — oversized type, product lower third',
  'lifestyle frame — soft gradient, product floating with shadow',
  'offer-first — price badge dominant, product secondary',
  'story vertical — stacked headline, hero product, bottom CTA',
  'asymmetric grid — off-center product, bold color block',
  'frame-within-frame — product inset panel, outer brand field',
  'diagonal split — angled color panel separating copy and product',
  'typography-led — headline dominates, product supporting',
]

function conceptDirectionForIndex({ designStrategy, analysis, index, usedDirections }) {
  const concepts = designStrategy?.concepts || []
  const concept = concepts[index]
  if (concept) {
    const parts = [
      concept.layoutApproach && `Layout: ${concept.layoutApproach}`,
      concept.messagingAngle && `Messaging: ${concept.messagingAngle}`,
      concept.colorMood && `Palette: ${concept.colorMood}`,
      concept.keyElements?.length && `Layers: ${concept.keyElements.join(', ')}`,
      concept.name && `Concept: ${concept.name}`,
      concept.expectedPerformance && `Goal: ${concept.expectedPerformance} performer`,
    ].filter(Boolean)
    const direction = parts.join('. ')
    usedDirections.add(direction)
    return { direction, concept }
  }

  const messaging = analysis?.messagingAngles || []
  const msgIdx = index - concepts.length
  if (msgIdx >= 0 && messaging[msgIdx]) {
    const direction = `Product-specific angle: ${messaging[msgIdx]} — invent a fresh layout for this angle (do not reuse a default template).`
    usedDirections.add(direction)
    return { direction, concept: null }
  }

  const pool = FALLBACK_ANGLES.filter((a) => !usedDirections.has(a))
  const direction = pool[(index - concepts.length) % Math.max(pool.length, 1)] ||
    FALLBACK_ANGLES[index % FALLBACK_ANGLES.length]
  usedDirections.add(direction)
  return { direction, concept: null }
}

const TYPOGRAPHY_HINT = `
TYPOGRAPHY (use these fontFamily values exactly):
- Headlines / CTA: "Barlow Condensed, sans-serif" fontWeight bold
- Body / tagline: "Inter, sans-serif"
- Allow 2-line headlines via short line breaks only if needed (max 2 lines, use \\n once)
`

function figmaStandards(width, height) {
  const margin = safeMarginForFrame(width, height)
  return `
FIGMA / LAYOUT STANDARDS (critical):
- Frame ${width}x${height}px. SAFE ZONE: content inside ${margin}px from each edge.
- 8px grid for x,y,width,height.
- PRODUCT (id product): 40-55% of frame width; objectFit contain; never crop product.
- HEADLINE: prominent placement (designer chooses position); fontSize scaled to frame height.
- CTA: must include visible label text; min height 48px; place for thumb reach on vertical formats when sensible.
- LOGO: corner placement; max 140x80px; light backing on dark backgrounds.
- zIndex: background 0-2, product 10, shadow 9, text 20-25, logo 30.
${TYPOGRAPHY_HINT}
`
}

const LAYOUT_PLAN_SYSTEM = `You are an ad layout planner. Output ONLY valid JSON (no markdown).

${capabilityPromptBlock()}

Schema:
{
  "palette": {"background":"#hex","primary":"#hex","accent":"#hex"},
  "regions":[
    {"id":"unique","role":"background|product|headline|tagline|cta|badge|logo|decorative",
     "x":0,"y":0,"width":0,"height":0,"zIndex":0}
  ],
  "copy":{"headline":"max 40 chars","tagline":"optional","cta":"2-4 words","badge":"optional"}
}

Rules:
- 6-12 regions covering full frame; designer chooses layout freely (split, stack, editorial — not a fixed template)
- Product region large (40%+ of frame area)
- Assign separate non-overlapping regions for headline, tagline, price, CTA — do not stack multiple copy lines in one bbox
- Every button node must include visible CTA text (2-4 words)
- Integer pixels only`

function withDesignSkills(system) {
  return system + designSkillsPromptBlock()
}

const ENRICH_FROM_PLAN_SYSTEM = `You build a complete Design Tree from a layout plan for a NEW ad (not photo reconstruction).
Output ONLY valid JSON Design Tree with type frame, width, height, backgroundColor, children[].

${capabilityPromptBlock()}

RULES:
- Keep region ids and bounding boxes from the plan
- Add shapes for backgrounds/gradients (type shape, gradientFrom/gradientTo)
- Product: type image, id product, src "assets/product.png", objectFit contain
- Logo if requested: type logo, src "assets/logo.png"
- Text nodes with exact copy from plan; apply palette colors
- Shapes: type "shape" with shape "rect"|"ellipse" (never rectangle)
- 8-14 children total
${TYPOGRAPHY_HINT}`

const SINGLE_DESIGN_SYSTEM = `You are an elite ad creative director. Output ONE design tree as valid JSON only (no markdown).

Schema:
{
  "id": "design_N",
  "name": "Short name",
  "concept": "One sentence",
  "rationale": "Why it performs",
  "messagingAngle": "Angle used",
  "expectedPerformance": "high|medium|experimental",
  "designTree": {
    "type": "frame",
    "width": W,
    "height": H,
    "backgroundColor": "#hex",
    "children": [ /* 8-12 nodes */ ]
  }
}

${capabilityPromptBlock()}

RULES:
- Return exactly ONE design in the schema above (not an array).
- Product: id "product", type "image", src "assets/product.png", objectFit "contain"
- STRICT: Only include copy/elements from the user brief (§0 DesignSkills). No invented headlines, badges, social proof, or urgency unless Custom design direction allows it; ask user before adding extras.
- Preserve user-provided content exactly when present: title/tagline/pricing/rating/merchant text must not be rewritten.
- Do not create empty text nodes or empty buttons.
- Never place decorative lines/shapes through the product hero (keep decor behind product).
- If background is dark, ensure logo sits on a light backing shape for contrast.
- Standard JSON only. Integer pixel coordinates.
${TYPOGRAPHY_HINT}`

export function summarizeAnalysisForDesign(analysis) {
  return {
    productSummary: analysis.productSummary,
    categoryInsights: analysis.categoryInsights,
    targetAudience: analysis.targetAudience,
    competitorPatterns: (analysis.competitorPatterns || []).slice(0, 4),
    visualTrends: analysis.visualTrends,
    messagingAngles: (analysis.messagingAngles || []).slice(0, 4),
    designRecommendations: (analysis.designRecommendations || []).slice(0, 6),
    referenceImageAnalysis: analysis.referenceImageAnalysis,
    riskFactors: (analysis.riskFactors || []).slice(0, 4),
  }
}

function buildSingleDesignPrompt(
  brief,
  analysisSummary,
  index,
  total,
  previousNames,
  hasLogo,
  frame,
  categoryHint,
  conceptDirection,
  conceptMeta,
) {
  const angle = conceptDirection
  const priceBlock = [brief.salePrice, brief.offerPrice, brief.discount].some(Boolean)
    ? `Pricing: sale=${brief.salePrice || '—'}, offer=${brief.offerPrice || '—'}, discount=${brief.discount || '—'}`
    : ''
  const ratingBlock = brief.rating ? `Rating: ${brief.rating}` : ''

  return (
    `Create design ${index + 1} of ${total} for this product ad.\n\n` +
    `CANVAS: ${frame.width}x${frame.height}px (${frame.id})\n` +
    `CATEGORY LAYOUT HINT: ${categoryHint}\n` +
    `VISUAL STRATEGY (from Design Strategist — follow closely, do not swap for a generic template):\n${angle}\n` +
    (conceptMeta?.name ? `CONCEPT NAME: ${conceptMeta.name}\n` : '') +
    (previousNames.length ? `Already created (must differ): ${previousNames.join(', ')}\n` : '') +
    `\nPRODUCT: ${brief.title}\n` +
    (brief.tagline ? `TAGLINE: ${brief.tagline}\n` : '') +
    (priceBlock ? `${priceBlock}\n` : '') +
    (ratingBlock ? `${ratingBlock}\n` : '') +
    (brief.language ? `LANGUAGE: ${brief.language}\n` : '') +
    (brief.category ? `CATEGORY: ${brief.category}\n` : '') +
    (brief.merchantInfo ? `MERCHANT (exact copy only): ${brief.merchantInfo}\n` : '') +
    (brief.customPrompt ? `CUSTOM DIRECTION (only source for extra elements beyond form): ${brief.customPrompt}\n` : '') +
    (brief.audienceDetails ? `AUDIENCE: ${brief.audienceDetails}\n` : '') +
    `\nANALYSIS:\n${JSON.stringify(analysisSummary)}\n\n` +
    `id must be "design_${index + 1}".\n` +
    `Keep PRODUCT title and TAGLINE exactly as provided when present; do not paraphrase.\n` +
    `If rating is provided, include it as a rating layer or concise text without changing the value.\n` +
    `Do not include any text node with empty text.\n` +
    (hasLogo ? 'Include logo node src assets/logo.png.\n' : 'No logo.\n') +
    `Use product image for composition. Compact valid JSON only.\n` +
    figmaStandards(frame.width, frame.height)
  )
}

function parseSingleDesign(data, index, frameDefaults) {
  const d = data?.designTree ? data : data?.designs?.[0] || data
  const tree = parseDesignTree(d.designTree || d.tree || d, frameDefaults)
  const normalized = normalizeTreeStrategies(tree)

  return {
    id: d.id || `design_${index + 1}`,
    name: d.name || `Design ${index + 1}`,
    concept: d.concept || '',
    rationale: d.rationale || '',
    messagingAngle: d.messagingAngle || '',
    expectedPerformance: d.expectedPerformance || 'medium',
    designTree: normalized,
  }
}

async function createDesignTwoPass({
  brief,
  analysisSummary,
  index,
  total,
  previousNames,
  hasLogo,
  frame,
  categoryHint,
  conceptDirection,
  conceptMeta,
  imagePaths,
  designLlm,
}) {
  const angle = conceptDirection
  const planPrompt =
    `Plan layout for ad ${index + 1}/${total}.\n` +
    `Frame ${frame.width}x${frame.height} (${frame.id}).\n` +
    `STRATEGIST DIRECTION (unique to this design — do not reuse another design's layout):\n${angle}\n` +
    (conceptMeta?.name ? `Concept: ${conceptMeta.name}\n` : '') +
    `Product: ${brief.title}. ${categoryHint}\n` +
    (brief.tagline ? `Tagline: ${brief.tagline}\n` : '') +
    (brief.rating ? `Rating: ${brief.rating}\n` : '') +
    `Analysis summary: ${JSON.stringify(analysisSummary).slice(0, 2000)}\n` +
    `Preserve provided title/tagline/rating values exactly; do not invent empty text blocks.\n` +
    (hasLogo ? 'Include logo region.\n' : '') +
    figmaStandards(frame.width, frame.height)

  const planData = await visionJson(planPrompt, withDesignSkills(LAYOUT_PLAN_SYSTEM), imagePaths, designLlm, {
    maxAttempts: 3,
  })
  const regions = planData?.regions || []

  const enrichPrompt =
    `Frame ${frame.width}x${frame.height}px.\n` +
    `LAYOUT PLAN:\n${JSON.stringify(planData, null, 2)}\n\n` +
    `Product title: ${brief.title}. id must be design_${index + 1}.\n` +
    (brief.tagline ? `Tagline must remain exactly: ${brief.tagline}\n` : '') +
    (brief.rating ? `Rating value must remain exactly: ${brief.rating}\n` : '') +
    `Also return metadata: name, concept, rationale, messagingAngle, expectedPerformance.\n` +
    `Do not output children with empty text.\n` +
    `Wrap as: {"id":"design_N","name":"...","concept":"...","designTree":{...}}`

  const enrichData = await visionJson(enrichPrompt, withDesignSkills(ENRICH_FROM_PLAN_SYSTEM), imagePaths, designLlm, {
    maxAttempts: 4,
  })

  let tree = enrichData?.designTree || enrichData
  if (!tree?.children?.length && regions.length) {
    tree = {
      type: 'frame',
      width: frame.width,
      height: frame.height,
      backgroundColor: planData.palette?.background || '#ffffff',
      children: regionsToChildren(regions, { width: frame.width, height: frame.height }),
    }
  }

  return parseSingleDesign(
    {
      id: enrichData.id || `design_${index + 1}`,
      name: enrichData.name || planData.copy?.headline?.slice(0, 32) || `Design ${index + 1}`,
      concept: enrichData.concept || angle,
      rationale: enrichData.rationale || '',
      messagingAngle: enrichData.messagingAngle || angle,
      expectedPerformance: enrichData.expectedPerformance || 'medium',
      designTree: tree,
    },
    index,
    { width: frame.width, height: frame.height },
  )
}

/**
 * Agent 2: creates N design concepts (two-pass layout plan → tree by default).
 */
export async function createDesignConcepts({
  brief,
  analysis,
  designStrategy = null,
  productImagePath,
  referenceImagePath,
  logoPath,
  llm,
  onProgress,
  frameFormat,
  generateCount = DEFAULT_GENERATE_COUNT,
  twoPass = true,
}) {
  const frame = frameFormat || resolveFrameFormat(brief.frameFormat)
  const count = Math.min(Math.max(Number(generateCount) || DEFAULT_GENERATE_COUNT, 4), 8)
  const analysisSummary = summarizeAnalysisForDesign(analysis)
  const categoryHint = categoryLayoutHint(brief.category)
  const hasLogo = Boolean(logoPath)
  const imagePaths = [productImagePath]
  if (referenceImagePath) imagePaths.push(referenceImagePath)
  if (logoPath) imagePaths.push(logoPath)

  const designLlm = {
    ...llm,
    maxTokens: llm?.maxTokens ?? Math.max(8192, Number(process.env.ANTHROPIC_MAX_TOKENS) || 8192),
  }

  const frameDefaults = { width: frame.width, height: frame.height }
  const designs = []
  const previousNames = []
  const usedDirections = new Set()

  for (let i = 0; i < count; i += 1) {
    const { direction, concept } = conceptDirectionForIndex({
      designStrategy,
      analysis,
      index: i,
      usedDirections,
    })
    onProgress?.(`Creating design ${i + 1}/${count} (${twoPass ? 'layout + enrich' : 'single pass'})…`)

    let design
    if (twoPass) {
      design = await createDesignTwoPass({
        brief,
        analysisSummary,
        index: i,
        total: count,
        previousNames,
        hasLogo,
        frame,
        categoryHint,
        conceptDirection: direction,
        conceptMeta: concept,
        imagePaths,
        designLlm,
      })
    } else {
      const prompt = buildSingleDesignPrompt(
        brief,
        analysisSummary,
        i,
        count,
        previousNames,
        hasLogo,
        frame,
        categoryHint,
        direction,
        concept,
      )
      const system = withDesignSkills(SINGLE_DESIGN_SYSTEM + figmaStandards(frame.width, frame.height))
      const data = await visionJson(prompt, system, imagePaths, designLlm, { maxAttempts: 4 })
      design = parseSingleDesign(data, i, frameDefaults)
    }

    if (concept?.name && design.name === `Design ${i + 1}`) {
      design.name = concept.name
    }
    if (concept?.messagingAngle && !design.messagingAngle) {
      design.messagingAngle = concept.messagingAngle
    }
    designs.push(design)
    previousNames.push(design.name)
  }

  onProgress?.(`Validated ${designs.length} design trees.`)
  return designs
}

export { DEFAULT_GENERATE_COUNT, DEFAULT_OUTPUT_COUNT }
