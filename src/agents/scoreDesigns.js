import { visionJson } from '../llmClient.js'

const SCORE_SYSTEM = `You score rendered advertisement designs for production readiness.
Output ONLY valid JSON:
{
  "scores": [
    {"id":"design_1","overall":8.5,"productVisibility":9,"textReadability":8,"layoutBalance":8,"creativeImpact":7,"notes":"one line"}
  ]
}
Scores are 0-10 (decimals allowed). Higher = better.
Be strict on: clipped text, cropped products, overlapping text blocks, empty CTA buttons, invisible logos on dark backgrounds, weak hierarchy.`

export async function scoreDesignCandidates({ candidates, productImagePath, brief, llm }) {
  const list = candidates.map((c) => ({
    id: c.id,
    name: c.name,
    concept: c.concept,
    previewPath: c.previewPath,
  }))

  const prompt =
    `Score these ${list.length} ad designs for product "${brief.title}".\n` +
    `Designs:\n${JSON.stringify(list, null, 2)}\n\n` +
    `You will receive the product image then each rendered ad in order (${list.length} images). ` +
    `Return scores array with matching ids.`

  const imagePaths = [productImagePath, ...candidates.map((c) => c.previewPath)]

  const data = await visionJson(prompt, SCORE_SYSTEM, imagePaths, llm, { maxAttempts: 3 })
  const scores = Array.isArray(data.scores) ? data.scores : []

  const byId = new Map(scores.map((s) => [String(s.id), s]))

  return candidates
    .map((c) => {
      const s = byId.get(c.id) || {}
      const vision = Number(s.overall ?? 0)
      const layout = Number(c.layoutQualityScore ?? 10)
      const combined = vision * 0.72 + layout * 0.28
      return {
        ...c,
        score: combined,
        scoreDetails: { ...s, layoutQualityScore: layout },
      }
    })
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

export function pickTopDesigns(ranked, count = 4) {
  return ranked.slice(0, count).map((d, i) => ({
    ...d,
    id: `design_${i + 1}`,
    displayRank: i + 1,
  }))
}
