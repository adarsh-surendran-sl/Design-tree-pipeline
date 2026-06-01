const DEFAULT_MCP_URL = 'https://mcp.shopalyst.com/ui-tools/mcp'

/**
 * Call a tool on Shopalyst ui-tools MCP server (JSON-RPC over HTTP).
 */
export async function callMcpTool(toolName, args, opts = {}) {
  const url = opts.url || process.env.MCP_UI_TOOLS_URL || DEFAULT_MCP_URL
  const body = {
    jsonrpc: '2.0',
    id: opts.id ?? Date.now(),
    method: 'tools/call',
    params: {
      name: toolName,
      arguments: args,
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 120000),
  })

  if (!res.ok) {
    throw new Error(`MCP HTTP ${res.status}: ${res.statusText}`)
  }

  const data = await res.json()
  if (data.error) {
    throw new Error(data.error.message || JSON.stringify(data.error))
  }

  const result = data.result
  if (result?.isError) {
    const msg = result.content?.map((c) => c.text).join(' ') || 'MCP tool error'
    throw new Error(msg)
  }

  return result
}

export async function listMcpTools(opts = {}) {
  const url = opts.url || process.env.MCP_UI_TOOLS_URL || DEFAULT_MCP_URL
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) throw new Error(`MCP list tools failed: ${res.status}`)
  const data = await res.json()
  return data.result?.tools || []
}

export async function checkMcpHealth() {
  try {
    const healthUrl =
      process.env.MCP_UI_TOOLS_HEALTH_URL || 'https://mcp.shopalyst.com/ui-tools/mcp/healthCheck'
    const res = await fetch(healthUrl, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return false
    const data = await res.json()
    return Boolean(data?.success)
  } catch {
    try {
      const tools = await listMcpTools()
      return tools.some((t) => t.name === 'remove_background')
    } catch {
      return false
    }
  }
}
