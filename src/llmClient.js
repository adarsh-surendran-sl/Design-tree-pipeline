import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'
import { parseJsonLenient } from './jsonParse.js'
import { useStructuredOutputs } from './llmSchemas.js'

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

function buildContentBlocks(imagePaths, prompt) {
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
  return blocks
}

async function askClaude(prompt, system, llm, imagePaths = [], jsonSchema = null) {
  const { client, cfg } = createClaudeClient(llm)
  const blocks = buildContentBlocks(imagePaths, prompt)

  const params = {
    model: cfg.model,
    max_tokens: cfg.maxTokens,
    system,
    messages: [{ role: 'user', content: blocks }],
  }

  if (jsonSchema && useStructuredOutputs()) {
    params.output_config = {
      format: {
        type: 'json_schema',
        schema: jsonSchema,
      },
    }
  }

  let resp
  try {
    resp = await client.messages.create(params)
  } catch (e) {
    const msg = String(e?.message || e)
    if (
      jsonSchema &&
      useStructuredOutputs() &&
      /output_config\.format\.schema|additionalProperties|schema is too complex/i.test(msg)
    ) {
      delete params.output_config
      resp = await client.messages.create(params)
    } else {
      throw e
    }
  }
  const text = claudeTextFromResponse(resp)
  if (jsonSchema && useStructuredOutputs()) {
    try {
      return parseJsonLenient(text)
    } catch (e) {
      throw new Error(`Structured output parse failed: ${e.message}`)
    }
  }
  return text
}

async function jsonWithRetry(prompt, system, llm, imagePaths, { maxAttempts = 3, jsonSchema = null } = {}) {
  let extra = ''
  let lastErr = null
  let lastRaw = ''

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const result = await askClaude(prompt + extra, system, llm, imagePaths, jsonSchema)
      if (jsonSchema && typeof result === 'object' && result !== null && !Array.isArray(result)) {
        return result
      }
      const rsp = typeof result === 'string' ? result : JSON.stringify(result)
      lastRaw = rsp
      return parseJsonLenient(rsp)
    } catch (e) {
      lastErr = e
      extra =
        `\n\nYour previous reply was invalid JSON (${e.message}). ` +
        `Reply with ONLY one compact JSON object. No markdown, no trailing commas, no comments. ` +
        (attempt >= 1 ? `Start fresh — do not repeat the broken output.` : '')
      if (process.env.DEBUG_LLM_JSON === '1') {
        console.error(`[llmClient] JSON attempt ${attempt + 1} failed:`, e.message)
      }
    }
  }

  if (process.env.DEBUG_LLM_JSON === '1' && lastRaw) {
    const debugPath = path.join(process.cwd(), 'runs', '_last_bad_llm.json.txt')
    fs.mkdirSync(path.dirname(debugPath), { recursive: true })
    fs.writeFileSync(debugPath, lastRaw, 'utf8')
  }

  throw new Error(`Model did not return valid JSON: ${lastErr?.message || lastErr}`)
}

export async function textJson(prompt, system, llm, opts) {
  return jsonWithRetry(prompt, system, llm, [], opts)
}

export async function visionJson(prompt, system, imagePaths, llm, opts) {
  return jsonWithRetry(prompt, system, llm, imagePaths, opts)
}

/** Vision + JSON schema when enabled and schema is non-null; else plain visionJson. */
export async function visionJsonStructured(prompt, system, imagePaths, jsonSchema, llm, opts) {
  if (!jsonSchema || !useStructuredOutputs()) {
    return visionJson(prompt, system, imagePaths, llm, opts)
  }
  return jsonWithRetry(prompt, system, llm, imagePaths, { ...opts, jsonSchema })
}

/** Full design trees exceed Anthropic structured-output complexity — always free-form JSON. */
export async function visionDesignTreeJson(prompt, system, imagePaths, llm, opts) {
  return visionJson(prompt, system, imagePaths, llm, opts)
}
