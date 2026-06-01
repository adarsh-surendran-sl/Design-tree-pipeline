/**
 * Lenient JSON extraction and repair for LLM outputs.
 */

function stripFences(text) {
  let t = String(text ?? '').trim()
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '')
    t = t.replace(/\s*```$/i, '')
  }
  return t.trim()
}

function extractJsonSubstring(text) {
  const t = stripFences(text)
  const startObj = t.indexOf('{')
  const startArr = t.indexOf('[')
  let start = -1
  if (startObj === -1) start = startArr
  else if (startArr === -1) start = startObj
  else start = Math.min(startObj, startArr)

  if (start === -1) return null

  const open = t[start]
  const close = open === '{' ? '}' : ']'
  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < t.length; i += 1) {
    const ch = t[i]
    if (inString) {
      if (escape) escape = false
      else if (ch === '\\') escape = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === open) depth += 1
    else if (ch === close) {
      depth -= 1
      if (depth === 0) return t.slice(start, i + 1)
    }
  }

  return t.slice(start)
}

function repairCommonIssues(raw) {
  let s = raw
  s = s.replace(/,\s*([}\]])/g, '$1')
  s = s.replace(/\u201c|\u201d/g, '"')
  s = s.replace(/\u2018|\u2019/g, "'")
  return s
}

function closeTruncatedJson(raw) {
  let s = raw.trim()
  const opens = { '{': 0, '[': 0 }
  const pairs = { '{': '}', '[': ']' }
  const stack = []
  let inString = false
  let escape = false

  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i]
    if (inString) {
      if (escape) escape = false
      else if (ch === '\\') escape = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      continue
    }
    if (ch === '{' || ch === '[') stack.push(ch)
    else if (ch === '}' || ch === ']') stack.pop()
  }

  if (inString) s += '"'
  while (stack.length) {
    const open = stack.pop()
    s += pairs[open]
  }
  return repairCommonIssues(s)
}

export function parseJsonLenient(text) {
  const raw = extractJsonSubstring(text)
  if (!raw) throw new Error('No JSON found in model output')

  const attempts = [
    () => JSON.parse(raw),
    () => JSON.parse(repairCommonIssues(raw)),
    () => JSON.parse(closeTruncatedJson(raw)),
  ]

  let lastErr = null
  for (const tryParse of attempts) {
    try {
      return tryParse()
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr || new Error('Could not parse JSON')
}

export function extractJson(text) {
  return parseJsonLenient(text)
}
