/** Category-specific layout hints (no external recipe API). */

const HINTS = {
  cookware: 'Hero product center or lower-third; warm kitchen palette; emphasize durability and non-stick.',
  fashion: 'Full-bleed minimal; product right, copy left; elegant serif or condensed sans headline.',
  beauty: 'Soft gradient background; product 45% frame; benefit-led headline; pastel or bold pop.',
  electronics: 'Dark tech background; product floating center; spec callouts as small text nodes.',
  food: 'Vibrant colors; product + appetite cues; promo badge top-right; CTA bottom.',
  fmcg: 'High contrast promo; large discount badge; product + pack shot; urgent CTA.',
  default: 'Clear product hero, readable headline, single CTA, balanced negative space.',
}

export function categoryLayoutHint(category) {
  if (!category) return HINTS.default
  const key = String(category).toLowerCase().trim()
  for (const [k, v] of Object.entries(HINTS)) {
    if (key.includes(k)) return v
  }
  return HINTS.default
}
