import fs from 'fs'
import path from 'path'

import { PROJECT_ROOT } from './loadEnv.js'

const SKILL_PATH = path.join(PROJECT_ROOT, '.cursor/skills/design-strategist/DesignSkills.md')

let cachedSkills = null
let cachedMtime = 0

/** Load DesignSkills.md for strategist / creator prompts. */
export function loadDesignSkills() {
  try {
    if (!fs.existsSync(SKILL_PATH)) return ''
    const stat = fs.statSync(SKILL_PATH)
    if (cachedSkills && stat.mtimeMs === cachedMtime) return cachedSkills
    cachedMtime = stat.mtimeMs
    cachedSkills = fs.readFileSync(SKILL_PATH, 'utf8')
    return cachedSkills
  } catch {
    return ''
  }
}

export function designSkillsPromptBlock() {
  const skills = loadDesignSkills()
  if (!skills) return ''
  return (
    '\n\n---\nMARKETING AD DESIGN PLAYBOOK (DesignSkills — follow strictly):\n' +
    skills +
    '\n---\n'
  )
}

export const DESIGN_SKILLS_PATH = SKILL_PATH
