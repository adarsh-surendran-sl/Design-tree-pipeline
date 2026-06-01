import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { parseJsonLenient } from './jsonParse.js'

function mediaTypeForPath(p) {
  const ext = path.extname(String(p)).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  return 'image/jpeg'
}

function readBase64(p) {
  return fs.readFileSync(p).toString('base64')
}

/** @deprecated use parseJsonLenient */
export function extractJson(text) {
  return parseJsonLenient(text)
}

function claudeTextFromResponse(resp) {
  const parts = (resp?.content ?? []).filter((b) => b?.type === 'text').map((b) => b.text)
  if (parts.length) return parts.join('\n')
  if (resp?.content?.[0]?.text) return resp.content[0].text
  return ''
}

export function getDefaultClaudeConfig() {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
    maxTokens: process.env.ANTHROPIC_MAX_TOKENS ? Number(process.env.ANTHROPIC_MAX_TOKENS) : 8192,
  }
}

export function createClaudeClient(llm) {
  const cfg = { ...getDefaultClaudeConfig(), ...llm }
  if (!cfg.apiKey) throw new Error('Missing ANTHROPIC_API_KEY (env) or provide llm.apiKey')
  return {
    client: new Anthropic({ apiKey: cfg.apiKey, baseURL: cfg.baseURL }),
    cfg,
  }
}

async function askClaude(prompt, system, llm, imagePaths = []) {
  const { client, cfg } = createClaudeClient(llm)
  const blocks = []

  for (const p of imagePaths.map((x) => path.resolve(String(x)))) {
    const ext = path.extname(p).toLowerCase()
    if (ext === '.svg') {
      throw new Error('SVG vision not supported. Render SVG to PNG first.')
    }
    blocks.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: mediaTypeForPath(p),
        data: readBase64(p),
      },
    })
  }
  blocks.push({ type: 'text', text: prompt })

  const resp = await client.messages.create({
    model: cfg.model,
    max_tokens: cfg.maxTokens,
    system,
    messages: [{ role: 'user', content: blocks }],
  })
  return claudeTextFromResponse(resp)
}

async function jsonWithRetry(prompt, system, llm, imagePaths, { maxAttempts = 3 } = {}) {
  let extra = ''
  let lastErr = null
  let lastRaw = ''

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const rsp = await askClaude(prompt + extra, system, llm, imagePaths)
    lastRaw = rsp
    try {
      return parseJsonLenient(rsp)
    } catch (e) {
      lastErr = e
      const snippet = String(rsp).slice(0, 200).replace(/\n/g, ' ')
      extra =
        `\n\nYour previous reply was invalid JSON (${e.message}). ` +
        `Reply with ONLY one compact JSON object. No markdown, no trailing commas, no comments. ` +
        `Keep strings short; escape internal quotes. ` +
        (attempt >= 1 ? `Start fresh — do not repeat the broken output.` : '')
      if (process.env.DEBUG_LLM_JSON === '1') {
        console.error(`[llmClient] JSON attempt ${attempt + 1} failed:`, e.message, snippet)
      }
    }
  }

  if (process.env.DEBUG_LLM_JSON === '1' && lastRaw) {
    const debugPath = path.join(process.cwd(), 'runs', '_last_bad_llm.json.txt')
    fs.mkdirSync(path.dirname(debugPath), { recursive: true })
    fs.writeFileSync(debugPath, lastRaw, 'utf8')
    console.error(`[llmClient] Wrote raw response to ${debugPath}`)
  }

  throw new Error(`Model did not return valid JSON: ${lastErr?.message || lastErr}`)
}

export async function textJson(prompt, system, llm, opts) {
  return jsonWithRetry(prompt, system, llm, [], opts)
}

export async function visionJson(prompt, system, imagePaths, llm, opts) {
  return jsonWithRetry(prompt, system, llm, imagePaths, opts)
}
