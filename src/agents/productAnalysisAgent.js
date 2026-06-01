import { textJson, visionJson } from '../llmClient.js'
import { gatherMarketResearch, fetchProductPageContext } from '../webResearch.js'

const ANALYSIS_SYSTEM = `You are a senior performance marketing strategist and competitive intelligence analyst.
Your job is to produce deep product analysis for ad creative generation.

Output ONLY valid JSON (no markdown) matching this schema:
{
  "productSummary": "2-3 sentence overview of the product and positioning",
  "categoryInsights": "What works in this category's ad creative",
  "targetAudience": {
    "primary": "Primary audience segment",
    "demographics": "Age, location, income, lifestyle signals",
    "psychographics": "Values, motivations, pain points",
    "platformBehavior": "How they consume ads on social"
  },
  "competitorPatterns": [
    {
      "pattern": "Named pattern e.g. hero-product-center",
      "description": "What competitors do",
      "whyItWorks": "Psychological/market reason",
      "exampleElements": ["headline top-left", "price badge", "gradient bg"]
    }
  ],
  "visualTrends": {
    "colorPalettes": ["#hex pairs or palette names"],
    "typography": "Font style trends (bold sans, serif luxury, etc.)",
    "layoutPatterns": ["split-screen", "full-bleed product", etc.],
    "ctaStyles": "Button styles that convert in this category"
  },
  "messagingAngles": [
    {
      "angle": "Short name",
      "headline": "Example headline",
      "tagline": "Example tagline",
      "rationale": "Why this angle works"
    }
  ],
  "seasonalContext": "How posting timeline affects creative (if provided)",
  "referenceImageAnalysis": "What the user's reference ad communicates (style, mood, layout)",
  "designRecommendations": [
    "Actionable recommendation for the design agent"
  ],
  "riskFactors": ["Things to avoid in creative"],
  "confidenceScore": 0.85
}

Be specific and actionable. Base analysis on provided data, category knowledge, and web research snippets.
If web research is sparse, use strong category inference from product title and image.`

function buildBriefText(brief) {
  const lines = []
  const fields = [
    ['title', 'Product title'],
    ['tagline', 'Tagline'],
    ['captions', 'Captions'],
    ['hashtags', 'Hashtags'],
    ['salePrice', 'Sale price'],
    ['offerPrice', 'Offer price'],
    ['discount', 'Discount'],
    ['rating', 'Star rating (0–5)'],
    ['language', 'Language'],
    ['category', 'Category'],
    ['customPrompt', 'Custom design direction'],
    ['audienceDetails', 'Target audience details'],
    ['merchantInfo', 'Merchant info'],
    ['productPageUrl', 'Marketplace product page URL'],
    ['demography', 'Demography'],
    ['postingTimeline', 'Posting timeline / seasonality'],
  ]
  for (const [key, label] of fields) {
    if (brief[key]) lines.push(`${label}: ${brief[key]}`)
  }
  return lines.join('\n')
}

function formatResearch(research) {
  if (!research?.length) return '(No web snippets retrieved — rely on vision and category knowledge.)'
  return research
    .map((block) => {
      const hits = (block.results || [])
        .map((r) => `- ${r.title}: ${r.snippet}`)
        .join('\n')
      return `Query: ${block.query}\n${hits || '(no results)'}`
    })
    .join('\n\n')
}

/**
 * Agent 1: Product & market analysis.
 * @returns {Promise<object>} Product analysis data
 */
export async function analyzeProduct({ brief, productImagePath, referenceImagePath, logoPath, llm, onProgress }) {
  onProgress?.('Gathering market research from the web…')
  const webResearch = await gatherMarketResearch(brief)
  let productPageContext = null
  if (brief.productPageUrl) {
    onProgress?.('Fetching marketplace product page details…')
    productPageContext = await fetchProductPageContext(brief.productPageUrl)
  }

  onProgress?.('Analyzing product, category, and competitor ad patterns…')

  const imagePaths = [productImagePath]
  if (referenceImagePath) imagePaths.push(referenceImagePath)
  if (logoPath) imagePaths.push(logoPath)

  const prompt =
    `Analyze this product for high-performing ad creative generation.\n\n` +
    `USER BRIEF:\n${buildBriefText(brief)}\n\n` +
    `WEB RESEARCH SNIPPETS:\n${formatResearch(webResearch)}\n\n` +
    `MARKETPLACE PAGE CONTEXT:\n${
      productPageContext
        ? `URL: ${productPageContext.url}\nTitle: ${productPageContext.title}\nDescription: ${productPageContext.description}\nExcerpt: ${productPageContext.excerpt}`
        : '(No product page context available.)'
    }\n\n` +
    `IMAGES ATTACHED (in order):\n` +
    `1. Product image (required)\n` +
    (referenceImagePath ? '2. Reference ad / style inspiration\n' : '') +
    (logoPath ? `${referenceImagePath ? '3' : '2'}. Brand logo\n` : '') +
    `\nProduce comprehensive product analysis data for a design strategist agent.`

  const analysis = await visionJson(prompt, ANALYSIS_SYSTEM, imagePaths, llm)

  return {
    ...analysis,
    webResearch,
    productPageContext,
    analyzedAt: new Date().toISOString(),
    inputBrief: brief,
  }
}
