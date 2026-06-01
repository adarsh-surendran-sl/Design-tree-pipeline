import { textJson } from '../llmClient.js'
import { summarizeAnalysisForDesign } from './designCreatorAgent.js'
import { designSkillsPromptBlock } from '../designSkills.js'

function buildStrategySystem() {
  return (
    `You are a design strategist planning 4 distinct ad creatives.
Apply the Marketing Ad Design Playbook (DesignSkills) for layout archetypes, color theory, hierarchy, layers, and CTA placement.
Given product analysis, output ONLY valid JSON:
{
  "summary": "Markdown summary for the user (2-4 paragraphs: overall creative direction, why these 4 approaches, how they map to audience and competitors)",
  "concepts": [
    {
      "id": "design_1",
      "name": "Short name",
      "layoutApproach": "e.g. hero center",
      "messagingAngle": "which angle from analysis",
      "colorMood": "palette mood",
      "keyElements": ["headline", "product hero", "CTA", "price badge"],
      "expectedPerformance": "high|medium|experimental"
    }
  ]
}
Exactly 4 concepts, visually distinct for THIS product and audience — do not default to the same four layouts every time (hero-center / split / minimal / promo). Vary layoutApproach names and composition based on analysis and category.
STRICT: keyElements must only reference content the user provided in the brief (or Custom design direction). Do not plan invented reviews, urgency, or extra badges.` +
    designSkillsPromptBlock()
  )
}

export async function generateDesignStrategy({ brief, analysis, llm }) {
  const analysisSummary = summarizeAnalysisForDesign(analysis)
  const prompt =
    `Plan 4 ad design concepts for:\n` +
    `PRODUCT: ${brief.title}\n` +
    (brief.category ? `CATEGORY: ${brief.category}\n` : '') +
    (brief.merchantInfo ? `MERCHANT: ${brief.merchantInfo}\n` : '') +
    (brief.tagline ? `TAGLINE: ${brief.tagline}\n` : '') +
    (brief.salePrice || brief.offerPrice || brief.discount
      ? `PRICING: sale=${brief.salePrice || '—'} offer=${brief.offerPrice || '—'} discount=${brief.discount || '—'}\n`
      : '') +
    (brief.customPrompt ? `CUSTOM DIRECTION (authorizes extras): ${brief.customPrompt}\n` : '') +
    (brief.audienceDetails ? `AUDIENCE: ${brief.audienceDetails}\n` : '') +
    (brief.rating ? `STAR RATING (use exactly in concepts): ${brief.rating}\n` : '') +
    `\nANALYSIS:\n${JSON.stringify(analysisSummary, null, 2)}\n\n` +
    `Output strategy JSON with a clear summary the user can read while designs are being built.`

  const data = await textJson(prompt, buildStrategySystem(), llm, { maxAttempts: 3 })
  const concepts = (data.concepts || []).slice(0, 4)
  return {
    summary: data.summary || 'Four distinct concepts planned based on market analysis.',
    concepts,
    createdAt: new Date().toISOString(),
  }
}
