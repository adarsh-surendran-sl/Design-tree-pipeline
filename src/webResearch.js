/**
 * Lightweight web research helper — fetches public search snippets for product/category context.
 */

export async function searchWebSnippets(query, { maxResults = 5 } = {}) {
  const q = String(query || '').trim()
  if (!q) return []

  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AdTemplateBot/1.0)',
        Accept: 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    })
    if (!resp.ok) return []
    const html = await resp.text()

    const snippets = []
    const resultRe = /<a[^>]+class="result__a"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi
    let m
    while ((m = resultRe.exec(html)) && snippets.length < maxResults) {
      const title = stripTags(m[1]).trim()
      const snippet = stripTags(m[2]).trim()
      if (title || snippet) snippets.push({ title, snippet })
    }
    return snippets
  } catch {
    return []
  }
}

function stripTags(s) {
  return String(s)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
}

export async function gatherMarketResearch(brief) {
  const queries = []
  if (brief.title) queries.push(`${brief.title} product marketing`)
  if (brief.category) queries.push(`${brief.category} ad creative trends`)
  if (brief.title && brief.category) {
    queries.push(`${brief.title} ${brief.category} competitor ads`)
  }
  if (brief.merchantInfo) {
    queries.push(`${brief.title || 'product'} ${brief.merchantInfo} brand positioning`)
  }

  const all = []
  for (const q of queries.slice(0, 3)) {
    const hits = await searchWebSnippets(q, { maxResults: 4 })
    all.push({ query: q, results: hits })
  }
  return all
}

/**
 * Pull concise context from a public marketplace/product page URL.
 */
export async function fetchProductPageContext(productPageUrl) {
  const url = String(productPageUrl || '').trim()
  if (!/^https?:\/\//i.test(url)) return null
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AdTemplateBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(12000),
    })
    if (!resp.ok) return null
    const html = await resp.text()

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
    const title = titleMatch ? stripTags(titleMatch[1]).trim() : ''

    const descMatch =
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["'][^>]*>/i)
    const description = descMatch ? stripTags(descMatch[1]).trim() : ''

    const bodyText = stripTags(html).replace(/\s+/g, ' ').trim().slice(0, 1600)
    return {
      url,
      title: title.slice(0, 300),
      description: description.slice(0, 500),
      excerpt: bodyText,
    }
  } catch {
    return null
  }
}
