/**
 * Human-readable summaries for agent progress UI.
 */

export function formatAnalysisSummary(analysis) {
  if (!analysis) return 'No analysis available yet.'

  const lines = []
  if (analysis.productSummary) {
    lines.push(`**Overview**\n${analysis.productSummary}`)
  }
  if (analysis.categoryInsights) {
    lines.push(`**Category**\n${analysis.categoryInsights}`)
  }

  const aud = analysis.targetAudience
  if (aud) {
    lines.push(
      `**Audience**\n` +
        `- Primary: ${aud.primary || '—'}\n` +
        `- Demographics: ${aud.demographics || '—'}\n` +
        `- Motivations: ${aud.psychographics || '—'}`,
    )
  }

  const patterns = analysis.competitorPatterns || []
  if (patterns.length) {
    lines.push(
      `**Top competitor patterns**\n` +
        patterns
          .slice(0, 4)
          .map((p, i) => `${i + 1}. **${p.pattern}** — ${p.description}`)
          .join('\n'),
    )
  }

  const angles = analysis.messagingAngles || []
  if (angles.length) {
    lines.push(
      `**Messaging angles**\n` +
        angles
          .slice(0, 4)
          .map((a) => `- **${a.angle}**: "${a.headline}" — ${a.rationale || ''}`)
          .join('\n'),
    )
  }

  const recs = analysis.designRecommendations || []
  if (recs.length) {
    lines.push(`**Recommendations for design**\n` + recs.slice(0, 5).map((r) => `- ${r}`).join('\n'))
  }

  if (analysis.referenceImageAnalysis) {
    lines.push(`**Reference style**\n${analysis.referenceImageAnalysis}`)
  }

  return lines.join('\n\n')
}

export function formatDesignStrategySummary(strategy, designs = []) {
  if (strategy?.summary) return strategy.summary

  if (!designs?.length) return 'Design strategy pending…'

  return designs
    .map(
      (d, i) =>
        `**${i + 1}. ${d.name}** (${d.expectedPerformance || 'medium'})\n` +
        `- Concept: ${d.concept}\n` +
        `- Angle: ${d.messagingAngle || '—'}\n` +
        `- Rationale: ${d.rationale}`,
    )
    .join('\n\n')
}

/** Simple markdown → HTML for agent panels (bold, lists, paragraphs). */
export function markdownToHtml(md) {
  const escaped = String(md ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped
    .split(/\n\n+/)
    .map((block) => {
      const withBold = block.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      if (/^[-*] /m.test(withBold)) {
        const items = withBold
          .split('\n')
          .filter((l) => /^[-*] /.test(l))
          .map((l) => `<li>${l.replace(/^[-*] /, '')}</li>`)
          .join('')
        const head = withBold.split('\n').find((l) => !/^[-*] /.test(l) && l.trim())
        return (head ? `<p>${head}</p>` : '') + `<ul>${items}</ul>`
      }
      return `<p>${withBold.replace(/\n/g, '<br>')}</p>`
    })
    .join('')
}
