import fs from 'fs'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

import { RASTER_TYPES } from './capabilities.js'

const TEXT_PROMOTE_SYSTEM = `You identify advertisement layers wrongly modeled as image crops that should be editable TEXT (or a button for CTA bars).

Output ONLY JSON:
{"conversions":[
  {"element":"node_id","type":"text","role":"headline|tagline|body_text|cta","text":"exact visible string",
   "color":"#hex","fontSize":48,"fontWeight":"bold","textAlign":"center",
   "panel":null}
]}

Rules:
1. Headlines/taglines on sunburst or gradient backgrounds → type "text" with exact copy (NOT an image crop).
2. Discount/offer bars with short copy → type "text" or suggest button; include backgroundColor if on a solid bar.
3. Optional "panel": if text sits on a distinct flat/shaped banner, add panel:{fill:"#hex",shape:"rect"} — do NOT bake panel+text into one image.
4. NEVER convert: product bottle, logo mark, star icons, photographic badges.
5. Max 8 conversions. Only use node ids from the user list.`

function isProductOrLogo(node) {
  const role = (node.role || '').toLowerCase()
  const id = String(node.id || '').toLowerCase()
  return (
    role === 'product' ||
    role === 'logo' ||
    id.includes('product') ||
    id.includes('bottle') ||
    id.includes('logo') ||
    id.includes('packshot')
  )
}

/** Heuristic: raster layer in header band that is likely typography. */
export function isLikelyTextRaster(node, tree) {
  if (!RASTER_TYPES.has(node.type)) return false
  if (isProductOrLogo(node)) return false
  if (node.renderChoiceResolved === 'crop' && node.role === 'background_fill') return false

  const frameW = tree.width ?? 1080
  const frameH = tree.height ?? 1080
  const role = (node.role || '').toLowerCase()
  const id = String(node.id || '').toLowerCase()
  const y = node.y ?? 0
  const h = node.height ?? 0
  const w = node.width ?? 0
  const area = w * h
  const frameArea = frameW * frameH

  if (role === 'headline' || role === 'tagline' || role === 'body_text' || role === 'cta') return true
  if (/headline|tagline|title|header|subhead|copy|slogan|text|banner.*text/i.test(id)) return true

  const inHeaderBand = y < frameH * 0.42
  const wideShort = w >= frameW * 0.35 && h <= frameH * 0.28 && h >= 24
  const smallTextStrip = area < frameArea * 0.12 && w > h * 1.5 && inHeaderBand

  return inHeaderBand && (wideShort || smallTextStrip)
}

async function visionJson(prompt, system, imagePath, llm) {
  const apiKey = llm?.apiKey || process.env.ANTHROPIC_API_KEY
  const model = llm?.model || process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'
  if (!apiKey) return { conversions: [] }

  const client = new Anthropic({ apiKey, baseURL: llm?.baseURL })
  const ext = path.extname(imagePath).toLowerCase()
  const media = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
  const data = fs.readFileSync(imagePath).toString('base64')

  const resp = await client.messages.create({
    model,
    max_tokens: 4096,
    system,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: media, data } },
          { type: 'text', text: prompt },
        ],
      },
    ],
  })
  const text = resp.content?.find((b) => b.type === 'text')?.text || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return { conversions: [] }
  return JSON.parse(match[0])
}

function applyConversion(node, conv, frameW) {
  node.type = conv.type === 'button' ? 'button' : 'text'
  node.renderStrategy = 'primitive'
  node.role = conv.role || node.role || 'headline'
  node.text = conv.text || node.text || ''
  node.color = conv.color || node.color || '#ffffff'
  node.fontSize = conv.fontSize || node.fontSize || 48
  node.fontWeight = conv.fontWeight || 'bold'
  node.textAlign = conv.textAlign || 'center'
  node.fontFamily = node.fontFamily || 'Barlow Condensed, sans-serif'
  delete node.src
  delete node.srcX
  delete node.srcY
  delete node.srcWidth
  delete node.srcHeight
  node.x = Math.max(20, Math.round((frameW - (node.width ?? frameW)) / 2))
}

/**
 * Promote misclassified text image crops → type text (vision + heuristics).
 */
export async function promoteTextRasters(tree, imagePath, llm = null, { useVision = true } = {}) {
  const updated = JSON.parse(JSON.stringify(tree))
  const candidates = (updated.children || []).filter((n) => isLikelyTextRaster(n, updated))
  if (!candidates.length) return updated

  const byId = new Map(candidates.map((n) => [n.id, n]))

  if (useVision && imagePath && fs.existsSync(imagePath)) {
    const list = candidates
      .map(
        (n) =>
          `- ${n.id}: role=${n.role || ''} box=(${n.x},${n.y},${n.width},${n.height}) type=${n.type}`,
      )
      .join('\n')

    const prompt =
      `Frame ${updated.width}x${updated.height}px.\n` +
      `Mislabeled image crops (likely plain text on patterned background):\n${list}\n\n` +
      'Return conversions for nodes that should be text, not image crops.'

    try {
      const data = await visionJson(prompt, TEXT_PROMOTE_SYSTEM, imagePath, llm)
      for (const conv of data.conversions || []) {
        const node = byId.get(String(conv.element))
        if (!node || !conv.text?.trim()) continue
        applyConversion(node, conv, updated.width)
        if (conv.panel?.fill) {
          const panelId = `${node.id}_panel`
          if (!(updated.children || []).some((c) => c.id === panelId)) {
            updated.children.push({
              id: panelId,
              type: 'shape',
              role: 'decorative',
              renderStrategy: 'primitive',
              shape: 'rect',
              x: node.x - 8,
              y: node.y - 6,
              width: node.width + 16,
              height: node.height + 12,
              fill: conv.panel.fill,
              zIndex: (node.zIndex ?? 10) - 1,
            })
          }
        }
        byId.delete(node.id)
      }
    } catch (e) {
      console.warn('Text raster vision promote failed:', e?.message || e)
    }
  }

  for (const node of byId.values()) {
    node.type = 'text'
    node.renderStrategy = 'primitive'
    node.role = node.role || (/tagline|sub/i.test(node.id) ? 'tagline' : 'headline')
    node.text = node.text || placeholderText(node)
    node.color = node.color || '#f5f0e8'
    node.fontSize = node.fontSize || (node.role === 'tagline' ? 52 : 88)
    node.fontWeight = 'bold'
    node.textAlign = 'center'
    node.fontFamily = 'Barlow Condensed, sans-serif'
    delete node.src
    delete node.srcX
    delete node.srcY
    delete node.srcWidth
    delete node.srcHeight
  }

  updated.children = (updated.children || []).sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  return updated
}

function placeholderText(node) {
  const id = String(node.id || '').toLowerCase()
  if (id.includes('tagline') || id.includes('sub')) return 'Tagline'
  if (id.includes('cta') || id.includes('discount')) return 'Enjoy 30% Discount'
  return 'Headline'
}
