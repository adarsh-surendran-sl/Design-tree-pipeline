import { multiRegionCompareEnabled } from './compareRegions.js'
import { RECONSTRUCTION_SCORE_GOOD, RECONSTRUCTION_SCORE_RETRY } from './reconstructionScore.js'

/** Skip all compare LLM calls when reconstruction already matches well. */
export function shouldSkipCompareLlm(score) {
  if (!score || process.env.RECONSTRUCTION_SMART_COMPARE === '0') return false
  return score.similarity >= RECONSTRUCTION_SCORE_GOOD && !score.needsRetry
}

/**
 * Which compare vision passes to run (main / regional / fine).
 * Smart mode uses score to avoid 2–3 redundant calls per loop.
 */
export function comparePassPlan({ highAccuracy = true, score = null } = {}) {
  if (process.env.RECONSTRUCTION_COMPARE_LITE === '1') {
    return { main: true, regional: false, fine: false }
  }
  if (shouldSkipCompareLlm(score)) {
    return { main: false, regional: false, fine: false }
  }
  if (score && score.similarity >= RECONSTRUCTION_SCORE_RETRY && !score.needsRetry) {
    return { main: true, regional: false, fine: false }
  }
  return {
    main: true,
    regional: highAccuracy && multiRegionCompareEnabled(highAccuracy),
    fine: highAccuracy && process.env.RECONSTRUCTION_COMPARE_FINE !== '0',
  }
}
