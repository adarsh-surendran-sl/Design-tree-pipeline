import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/** Load .env.local (preferred), env.local, or .env from project root. */
export function loadEnv() {
  for (const name of ['.env.local', 'env.local', '.env']) {
    const full = path.join(projectRoot, name)
    if (fs.existsSync(full)) {
      dotenv.config({ path: full })
      return full
    }
  }
  return null
}

export const PROJECT_ROOT = projectRoot
