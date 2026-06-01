const healthEl = document.getElementById('health')
const form = document.getElementById('adForm')
const submitBtn = document.getElementById('submitBtn')
const pipelineResumeBar = document.getElementById('pipelineResumeBar')
const pipelineErrorMsg = document.getElementById('pipelineErrorMsg')
const resumePipelineBtn = document.getElementById('resumePipelineBtn')
const agentStatus = document.getElementById('agentStatus')
const logEl = document.getElementById('log')
const resultsPlaceholder = document.getElementById('resultsPlaceholder')
const designsPanel = document.getElementById('designsPanel')
const remotionRoot = document.getElementById('remotionRoot')

const reportAnalyst = document.getElementById('reportAnalyst')
const reportAnalystBody = document.getElementById('reportAnalystBody')
const reportAnalystStatus = document.getElementById('reportAnalystStatus')
const reportStrategist = document.getElementById('reportStrategist')
const reportStrategistBody = document.getElementById('reportStrategistBody')
const reportStrategistStatus = document.getElementById('reportStrategistStatus')

const chatMessages = document.getElementById('chatMessages')
const chatForm = document.getElementById('chatForm')
const chatInput = document.getElementById('chatInput')
const chatSendBtn = document.getElementById('chatSendBtn')
const chatJobBadge = document.getElementById('chatJobBadge')
const removeBgCheckbox = document.getElementById('removeBackground')
const removeBgHint = document.getElementById('removeBgHint')
const productImageFile = document.getElementById('productImageFile')
const productImageUrl = document.getElementById('productImageUrl')
const logoFile = document.getElementById('logoFile')
const logoImageUrl = document.getElementById('logoImageUrl')
const treeModal = document.getElementById('treeModal')
const treeModalTitle = document.getElementById('treeModalTitle')
const treeModalContent = document.getElementById('treeModalContent')
const treeCopyBtn = document.getElementById('treeCopyBtn')
const templateModal = document.getElementById('templateModal')
const templateForm = document.getElementById('templateForm')
const templateModalTitle = document.getElementById('templateModalTitle')
const templateModalSubtitle = document.getElementById('templateModalSubtitle')
const templateModalBody = document.getElementById('templateModalBody')
const templateModalClose = document.getElementById('templateModalClose')
const templateApplyBtn = document.getElementById('templateApplyBtn')
const templateResetBtn = document.getElementById('templateResetBtn')
const templatePreviewRoot = document.getElementById('templatePreviewRoot')

const ORCHESTRATOR_WELCOME =
  "Hi! I'm your **Orchestrator**. I coordinate the Product Analyst, Design Strategist, and renderer.\n\n" +
  'Upload your product brief and click **Generate** — I will share live summaries as each agent works. ' +
  'If a step fails, use **Resume pipeline** or ask me to **continue** / **retry**. ' +
  'After designs are ready, ask me to tweak copy, colors, or layout (e.g. *"Make design_2 headline red and bolder"*).'

let remotionLoaded = false
let currentJobId = null
let lastFailedStep = null
let currentDesigns = []
let assetsBaseUrl = null
let chatBusy = false
let lastHealth = null
let templateDesignId = null
let templatePropsSnapshot = null
let templateOriginalTree = null
let templateBaseTree = null
let templateLivePreview = null
let templateBlobUrls = {}
let livePreviewTimer = null

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function simpleMarkdownHtml(md) {
  const escaped = esc(md)
  return escaped
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>')
    .concat('</p>')
}

function agentLabel(agent) {
  if (agent === 'product_analyst') return 'Product Analyst'
  if (agent === 'design_strategist') return 'Design Strategist'
  if (agent === 'orchestrator') return 'Orchestrator'
  return agent || 'System'
}

function appendChatMessage({ role, content, agent, html }) {
  const div = document.createElement('div')
  div.className = `chat-msg ${role}${agent ? ` agent-${agent}` : ''}`
  const who =
    role === 'user'
      ? 'You'
      : role === 'system'
        ? agentLabel(agent)
        : 'Orchestrator'
  div.innerHTML = `
    <div class="chat-msg-head"><strong>${esc(who)}</strong></div>
    <div class="chat-msg-body">${html || simpleMarkdownHtml(content)}</div>
  `
  chatMessages.appendChild(div)
  chatMessages.scrollTop = chatMessages.scrollHeight
}

function setJobBadge(jobId) {
  currentJobId = jobId
  if (jobId) {
    chatJobBadge.textContent = jobId.replace(/^ad_/, '').slice(0, 24)
    chatJobBadge.classList.remove('hidden')
  } else {
    chatJobBadge.classList.add('hidden')
  }
}

function showAgentReport(agent, summaryHtml, statusText) {
  if (agent === 'product_analyst') {
    reportAnalyst.classList.remove('hidden')
    reportAnalystBody.innerHTML = summaryHtml
    reportAnalystStatus.textContent = statusText || 'Complete'
    reportAnalyst.classList.add('done')
  }
  if (agent === 'design_strategist') {
    reportStrategist.classList.remove('hidden')
    reportStrategistBody.innerHTML = summaryHtml
    reportStrategistStatus.textContent = statusText || 'Complete'
    reportStrategist.classList.add('done')
  }
}

async function checkHealth() {
  try {
    const r = await fetch('/api/health')
    const d = await r.json()
    lastHealth = d
    const mcpNote = d.mcpUiTools ? ' · MCP bg removal OK' : ' · MCP unavailable'
    healthEl.textContent = d.ok
      ? `Ready · ${d.model}${mcpNote}`
      : `Not ready — ${!d.anthropicKey ? 'missing API key' : 'Playwright not installed'}`
    healthEl.className = `health ${d.ok ? 'ok' : 'bad'}`
    submitBtn.disabled = !d.ok
    chatSendBtn.disabled = !d.ok || chatBusy
    if (removeBgCheckbox) {
      removeBgCheckbox.disabled = false
      removeBgCheckbox.title = d.mcpUiTools
        ? 'Uses Shopalyst ui-tools MCP remove_background'
        : 'MCP server unreachable — removal may fail'
    }
    updateRemoveBgHint(d)
  } catch {
    healthEl.textContent = 'Cannot reach API'
    healthEl.className = 'health bad'
    submitBtn.disabled = true
  }
}

function hasImageUrlInput() {
  return Boolean(productImageUrl?.value.trim() || logoImageUrl?.value.trim())
}

function updateRemoveBgHint(health) {
  if (!removeBgHint) return
  if (!health?.mcpUiTools) {
    removeBgHint.textContent = 'Shopalyst MCP is offline; background removal will be skipped if enabled.'
    removeBgHint.classList.remove('hidden')
    return
  }
  if (hasImageUrlInput()) {
    removeBgHint.textContent =
      'Uploaded files need a public tunnel (PUBLIC_BASE_URL). Image URLs are sent directly to MCP for background removal.'
  } else {
    removeBgHint.textContent = `File uploads: set PUBLIC_BASE_URL so MCP can fetch from ${health.publicBaseUrl || 'your server'}/runs/…`
  }
  removeBgHint.classList.remove('hidden')
}

function validateImageSources() {
  const pFile = productImageFile?.files?.[0]
  const pUrl = productImageUrl?.value.trim() || ''
  if (!pFile && !pUrl) {
    throw new Error('Provide a product image file or a product image URL.')
  }
  if (pFile && pUrl) {
    throw new Error('Use either product image upload or URL, not both.')
  }
  const lFile = logoFile?.files?.[0]
  const lUrl = logoImageUrl?.value.trim() || ''
  if (lFile && lUrl) {
    throw new Error('Use either logo upload or URL, not both.')
  }
}

function wireImageSourceInputs() {
  const pairs = [
    [productImageFile, productImageUrl],
    [logoFile, logoImageUrl],
  ]
  for (const [fileEl, urlEl] of pairs) {
    if (!fileEl || !urlEl) continue
    fileEl.addEventListener('change', () => {
      if (fileEl.files?.length) urlEl.value = ''
      updateRemoveBgHint(lastHealth)
    })
    urlEl.addEventListener('input', () => {
      if (urlEl.value.trim()) fileEl.value = ''
      updateRemoveBgHint(lastHealth)
    })
  }
}

function log(msg) {
  const li = document.createElement('li')
  li.textContent = msg
  logEl.appendChild(li)
  logEl.scrollTop = logEl.scrollHeight
}

function setAgentPhase(phase, message, state = 'active') {
  const order = ['analysis', 'design', 'render']
  document.querySelectorAll('.agent-step').forEach((el) => {
    const p = el.dataset.phase
    el.classList.remove('active', 'done', 'pending')
    const pi = order.indexOf(p)
    const ci = order.indexOf(phase)
    if (p === phase) el.classList.add(state)
    else if (pi < ci) el.classList.add('done')
    else el.classList.add('pending')
    if (p === phase && message) el.querySelector('.step-msg').textContent = message
  })
}

async function loadRemotionPreview() {
  if (remotionLoaded) return
  await import('/remotion-preview/design-preview.js')
  remotionLoaded = true
}

function bindDesignCardActions() {
  remotionRoot.onclick = async (e) => {
    const customizeBtn = e.target.closest('[data-action="customize-template"]')
    if (customizeBtn) {
      await openTemplateModal(customizeBtn.dataset.designId, customizeBtn.dataset.designName)
      return
    }
    const btn = e.target.closest('[data-action="view-tree"]')
    if (!btn) return
    const id = btn.dataset.designId
    const design = currentDesigns.find((d) => d.id === id)
    await openDesignTreeModal(design?.name || btn.dataset.designName, design?.tree, btn.dataset.treeUrl)
  }
}

function renderTemplateField(nodeId, field) {
  const id = `tpl_${nodeId}_${field.key}`
  if (field.kind === 'textarea') {
    return `<label class="field"><span>${esc(field.label)}</span><textarea id="${id}" data-node-id="${esc(nodeId)}" data-field="${esc(field.key)}" rows="2">${esc(field.value)}</textarea></label>`
  }
  if (field.kind === 'color') {
    return `<label class="field field-color"><span>${esc(field.label)}</span><input type="color" id="${id}" data-node-id="${esc(nodeId)}" data-field="${esc(field.key)}" value="${esc(field.value || '#000000')}" /></label>`
  }
  if (field.kind === 'number') {
    const min = field.min != null ? ` min="${field.min}"` : ''
    const max = field.max != null ? ` max="${field.max}"` : ''
    const step = field.step != null ? ` step="${field.step}"` : ''
    return `<label class="field"><span>${esc(field.label)}</span><input type="number" id="${id}" data-node-id="${esc(nodeId)}" data-field="${esc(field.key)}" value="${esc(field.value)}"${min}${max}${step} /></label>`
  }
  if (field.kind === 'select') {
    const opts = (field.options || [])
      .map((o) => `<option value="${esc(o.value)}"${o.value === field.value ? ' selected' : ''}>${esc(o.label)}</option>`)
      .join('')
    return `<label class="field"><span>${esc(field.label)}</span><select id="${id}" data-node-id="${esc(nodeId)}" data-field="${esc(field.key)}">${opts}</select></label>`
  }
  if (field.kind === 'image') {
    const thumb =
      field.previewSrc ||
      (field.currentSrc && assetsBaseUrl ? `${assetsBaseUrl}/${field.currentSrc.replace(/^\//, '')}` : '')
    return `<label class="field">
      <span>${esc(field.label)}</span>
      <input type="file" accept="image/png,image/jpeg,image/webp" data-node-id="${esc(nodeId)}" data-field="imageFile" />
      ${field.hint ? `<p class="field-hint-inline">${esc(field.hint)}</p>` : ''}
      ${thumb ? `<img class="template-layer-thumb" src="${esc(thumb)}" alt="" />` : ''}
    </label>`
  }
  return ''
}

function renderTemplateForm(props, brief) {
  const parts = []

  if (brief?.rating) {
    parts.push('<section class="template-section"><h4>From your brief</h4>')
    parts.push(
      renderTemplateField('_brief', {
        key: 'rating',
        kind: 'number',
        label: 'Star rating',
        value: brief.rating,
        min: 0,
        max: 5,
        step: 0.5,
      }),
    )
    parts.push('</section>')
  }

  for (const node of props.nodes || []) {
    parts.push(`<section class="template-section element-card" data-template-node="${esc(node.id)}">`)
    parts.push(`<div class="element-head"><strong>${esc(node.label)}</strong> <span class="tag">${esc(node.type)}</span> <span class="tag">${esc(node.id)}</span></div>`)
    parts.push(`<p class="element-meta">Layer ${Math.round(node.box?.width || 0)}×${Math.round(node.box?.height || 0)}px</p>`)
    const compact = node.fields.filter((f) => f.kind === 'color' || f.kind === 'number')
    const rest = node.fields.filter((f) => f.kind !== 'color' && f.kind !== 'number')
    if (compact.length >= 2) {
      parts.push('<div class="field-row-compact">')
      for (const f of compact.slice(0, 2)) parts.push(renderTemplateField(node.id, f))
      parts.push('</div>')
      for (const f of compact.slice(2)) parts.push(renderTemplateField(node.id, f))
    } else {
      for (const f of compact) parts.push(renderTemplateField(node.id, f))
    }
    for (const f of rest) parts.push(renderTemplateField(node.id, f))
    parts.push('</section>')
  }

  if (!(props.nodes || []).length) {
    parts.push('<p class="hint">No editable layers found in this design tree.</p>')
  }

  parts.push('<section class="template-section"><h4>Canvas</h4>')
  for (const f of props.frame?.fields || []) {
    parts.push(renderTemplateField('_frame', f))
  }
  parts.push('</section>')
  return parts.join('\n')
}

function revokeTemplateBlobUrls() {
  for (const url of Object.values(templateBlobUrls)) {
    try {
      URL.revokeObjectURL(url)
    } catch {
      /* ignore */
    }
  }
  templateBlobUrls = {}
}

function applyOverridesClient(tree, { frame, nodes, brief }) {
  const t = JSON.parse(JSON.stringify(tree))
  if (frame?.backgroundColor) t.backgroundColor = frame.backgroundColor
  for (const [id, o] of Object.entries(nodes || {})) {
    const node = (t.children || []).find((n) => n.id === id)
    if (!node) continue
    for (const [k, v] of Object.entries(o)) {
      if (v !== undefined && v !== null && v !== '') node[k] = v
    }
  }
  if (brief?.rating != null && String(brief.rating).trim() !== '') {
    const stars = Math.max(0, Math.min(5, Number(brief.rating)))
    if (Number.isFinite(stars)) {
      let ratingNode = (t.children || []).find(
        (n) => n.id === 'rating' || n.type === 'rating' || n.role === 'rating',
      )
      if (ratingNode) {
        ratingNode.ratingValue = Math.round(stars * 2) / 2
      }
    }
  }
  for (const [nodeId, blobUrl] of Object.entries(templateBlobUrls)) {
    const node = (t.children || []).find((n) => n.id === nodeId)
    if (node && blobUrl) node.src = blobUrl
  }
  return t
}

async function mountTemplateLivePreview(tree) {
  if (!templatePreviewRoot) return
  await loadRemotionPreview()
  const design = currentDesigns.find((d) => d.id === templateDesignId)
  const fallbackImg = design?.previewUrl

  if (templateLivePreview?.unmount) {
    templateLivePreview.unmount()
    templateLivePreview = null
  }

  if (window.mountTemplateLivePreview) {
    templateLivePreview = window.mountTemplateLivePreview(templatePreviewRoot, tree, assetsBaseUrl)
    return
  }

  templatePreviewRoot.innerHTML = fallbackImg
    ? `<img class="template-fallback-img" src="${esc(fallbackImg)}" alt="Preview" />`
    : '<p class="hint">Preview unavailable</p>'
}

function refreshTemplateLivePreview() {
  if (!templateBaseTree) return
  const previewTree = applyOverridesClient(templateBaseTree, collectTemplateOverrides())
  if (templateLivePreview?.update) {
    templateLivePreview.update(previewTree, assetsBaseUrl)
  } else {
    mountTemplateLivePreview(previewTree)
  }
}

function scheduleTemplateLivePreview() {
  clearTimeout(livePreviewTimer)
  livePreviewTimer = setTimeout(refreshTemplateLivePreview, 180)
}

function onTemplateFormChange(e) {
  const input = e.target
  if (input?.matches?.('input[data-field="imageFile"]') && input.files?.[0]) {
    const nodeId = input.dataset.nodeId
    if (templateBlobUrls[nodeId]) URL.revokeObjectURL(templateBlobUrls[nodeId])
    templateBlobUrls[nodeId] = URL.createObjectURL(input.files[0])
  }
  scheduleTemplateLivePreview()
}

let templateBrief = null

function setupTemplateEditor(tree, props, brief = null) {
  templatePropsSnapshot = props
  templateBrief = brief
  templateOriginalTree = JSON.parse(JSON.stringify(tree))
  templateBaseTree = JSON.parse(JSON.stringify(tree))
  templateModalBody.innerHTML = renderTemplateForm(props, brief)
  wireTemplateFormLivePreview()
  mountTemplateLivePreview(templateBaseTree)
  refreshTemplateLivePreview()
}

function wireTemplateFormLivePreview() {
  if (templateModalBody.dataset.liveWired === '1') return
  templateModalBody.dataset.liveWired = '1'
  templateModalBody.addEventListener('input', scheduleTemplateLivePreview)
  templateModalBody.addEventListener('change', onTemplateFormChange)
}

async function openTemplateModal(designId, designName) {
  if (!currentJobId) {
    log('Generate designs first, then customize a template.')
    return
  }
  templateDesignId = designId
  revokeTemplateBlobUrls()
  templateModalTitle.textContent = `Customize: ${designName || designId}`
  templateModalSubtitle.textContent = 'Edit on the left — preview updates live on the right'
  templateModalBody.innerHTML = '<p class="hint">Loading editable layers…</p>'
  if (templatePreviewRoot) {
    templatePreviewRoot.innerHTML = '<p class="hint">Loading preview…</p>'
  }
  templateModal.showModal()

  try {
    const r = await fetch(`/api/ad-template/jobs/${currentJobId}/designs/${designId}/template-props`)
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
    if (data.assetsBaseUrl) assetsBaseUrl = data.assetsBaseUrl
    const tree = data.tree || currentDesigns.find((d) => d.id === designId)?.tree
    if (!tree) throw new Error('Design tree not available')
    setupTemplateEditor(tree, data.templateProps, data.brief)
  } catch (e) {
    templateModalBody.innerHTML = `<p class="hint">Could not load template: ${esc(e.message)}</p>`
    if (templatePreviewRoot) {
      templatePreviewRoot.innerHTML = `<p class="hint">${esc(e.message)}</p>`
    }
  }
}

function collectTemplateOverrides() {
  const nodes = {}
  const frame = {}
  const brief = {}

  for (const el of templateModalBody.querySelectorAll('[data-node-id][data-field]')) {
    const nodeId = el.dataset.nodeId
    const key = el.dataset.field
    if (key === 'imageFile') continue
    const val = el.type === 'checkbox' ? (el.checked ? el.value : undefined) : el.value
    if (val === '' || val == null) continue

    if (nodeId === '_frame') {
      frame[key] = val
      continue
    }
    if (nodeId === '_brief') {
      if (key === 'rating') brief.rating = val
      continue
    }
    nodes[nodeId] = nodes[nodeId] || {}
    if (key === 'fontSize' || key === 'ratingValue' || key === 'opacity') {
      nodes[nodeId][key] = Number(val)
    } else {
      nodes[nodeId][key] = val
    }
  }
  return { frame, nodes, brief }
}

function collectTemplateImageFiles() {
  const files = []
  for (const input of templateModalBody.querySelectorAll('input[data-field="imageFile"]')) {
    if (input.files?.[0]) {
      files.push({ nodeId: input.dataset.nodeId, file: input.files[0] })
    }
  }
  return files
}

async function applyTemplateCustomization(e) {
  e.preventDefault()
  if (!currentJobId || !templateDesignId) return

  templateApplyBtn.disabled = true
  templateApplyBtn.textContent = 'Rendering…'

  const fd = new FormData()
  fd.append('overrides', JSON.stringify(collectTemplateOverrides()))
  for (const { nodeId, file } of collectTemplateImageFiles()) {
    if (nodeId === 'product') fd.append('productImage', file)
    else if (nodeId === 'logo') fd.append('logoImage', file)
    else fd.append(`asset_${nodeId}`, file)
  }

  try {
    const r = await fetch(
      `/api/ad-template/jobs/${currentJobId}/designs/${templateDesignId}/apply-template`,
      { method: 'POST', body: fd },
    )
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)

    revokeTemplateBlobUrls()
    updateDesignPreview(templateDesignId, data.previewUrl, data.tree)
    setupTemplateEditor(data.tree, data.templateProps, templateBrief)
    log(`Template updated: ${templateDesignId}`)
    appendChatMessage({
      role: 'system',
      agent: 'orchestrator',
      content: `**${templateDesignId}** re-rendered with your template test data.`,
    })
  } catch (err) {
    log(`Template apply failed: ${err.message}`)
  } finally {
    templateApplyBtn.disabled = false
    templateApplyBtn.textContent = 'Apply & re-render'
  }
}

templateForm?.addEventListener('submit', applyTemplateCustomization)
templateModalClose?.addEventListener('click', () => templateModal.close())
templateResetBtn?.addEventListener('click', () => {
  if (!templatePropsSnapshot || !templateOriginalTree) return
  revokeTemplateBlobUrls()
  templateBaseTree = JSON.parse(JSON.stringify(templateOriginalTree))
  templateModalBody.innerHTML = renderTemplateForm(templatePropsSnapshot, templateBrief)
  refreshTemplateLivePreview()
})

templateModal?.addEventListener('close', () => {
  if (templateLivePreview?.unmount) templateLivePreview.unmount()
  templateLivePreview = null
  revokeTemplateBlobUrls()
})

async function openDesignTreeModal(title, tree, treeUrl) {
  treeModalTitle.textContent = title || 'Design tree'
  let json = tree
  if (!json && treeUrl) {
    treeModalContent.textContent = 'Loading…'
    treeModal.showModal()
    const r = await fetch(treeUrl)
    if (!r.ok) throw new Error('Could not load design tree')
    json = await r.json()
  }
  treeModalContent.textContent = JSON.stringify(json, null, 2)
  treeModal.showModal()
  treeCopyBtn.onclick = () => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2))
    treeCopyBtn.textContent = 'Copied!'
    setTimeout(() => {
      treeCopyBtn.textContent = 'Copy JSON'
    }, 1500)
  }
}

function renderFallbackCard(d) {
  const card = document.createElement('article')
  card.className = 'design-card design-card-lg fallback'
  card.dataset.designId = d.id
  const downloadName = `${(d.name || d.id).replace(/[^a-z0-9_-]+/gi, '_')}.png`
  card.innerHTML = `
    <h4 class="design-card-title">${esc(d.name)}</h4>
    <img class="design-preview-img" src="${esc(d.previewUrl)}" alt="${esc(d.name)}" />
    <div class="design-card-actions">
      <a class="btn-link" href="${esc(d.previewUrl)}" download="${esc(downloadName)}">Download PNG</a>
      <button type="button" class="btn-link" data-action="customize-template" data-design-id="${esc(d.id)}" data-design-name="${esc(d.name)}">Customize template</button>
      <button type="button" class="btn-link" data-action="view-tree" data-design-id="${esc(d.id)}" data-tree-url="${esc(d.treeUrl || '')}" data-design-name="${esc(d.name)}">View design tree</button>
    </div>
  `
  return card
}

async function showDesigns(designs, baseUrl) {
  currentDesigns = designs
  assetsBaseUrl = baseUrl
  designsPanel.classList.remove('hidden')
  resultsPlaceholder.classList.add('hidden')
  remotionRoot.innerHTML = ''

  const withTrees = designs.map((d) => ({
    ...d,
    tree: d.tree,
    previewUrl: d.previewUrl,
    treeUrl: d.treeUrl,
  }))

  try {
    await loadRemotionPreview()
    if (window.mountDesignPreviews) {
      window.mountDesignPreviews(remotionRoot, withTrees, baseUrl)
      bindDesignCardActions()
      return
    }
  } catch (e) {
    console.warn('Remotion fallback', e)
  }

  for (const d of withTrees) {
    remotionRoot.appendChild(renderFallbackCard(d))
  }
  bindDesignCardActions()
}

function updateDesignPreview(designId, previewUrl, tree) {
  const card = remotionRoot.querySelector(`[data-design-id="${designId}"]`)
  if (card) {
    const img = card.querySelector('img')
    if (img) img.src = previewUrl + '?t=' + Date.now()
  }
  const idx = currentDesigns.findIndex((d) => d.id === designId)
  if (idx >= 0) {
    currentDesigns[idx].previewUrl = previewUrl
    if (tree) currentDesigns[idx].tree = tree
  }
  if (remotionLoaded && window.mountDesignPreviews && currentDesigns.length) {
    window.mountDesignPreviews(remotionRoot, currentDesigns, assetsBaseUrl)
    bindDesignCardActions()
  }
}

function showResumeBar(message, failedStep) {
  lastFailedStep = failedStep || null
  if (pipelineErrorMsg) pipelineErrorMsg.textContent = message
  pipelineResumeBar?.classList.remove('hidden')
}

function hideResumeBar() {
  pipelineResumeBar?.classList.add('hidden')
}

async function handlePipelineNdjsonEvent(evt) {
  if (evt.type === 'start') {
    setJobBadge(evt.jobId)
    hideResumeBar()
    chatMessages.innerHTML = ''
    appendChatMessage({
      role: 'assistant',
      agent: 'orchestrator',
      content: evt.orchestratorMessage || ORCHESTRATOR_WELCOME,
    })
    log(`Job ${evt.jobId} started`)
  } else if (evt.type === 'resume') {
    setJobBadge(evt.jobId)
    hideResumeBar()
    log(`Resuming from ${evt.fromStep || 'auto'}…`)
  } else if (evt.type === 'progress') {
    log(evt.message)
    if (evt.phase) setAgentPhase(evt.phase, evt.message, 'active')
    if (evt.event === 'agent_report') {
      showAgentReport(evt.agent, evt.summaryHtml, 'Complete')
      appendChatMessage({
        role: 'system',
        agent: evt.agent,
        html: evt.summaryHtml,
        content: evt.summary || '',
      })
      if (evt.agent === 'product_analyst') reportStrategistStatus.textContent = 'Planning…'
    }
    if (evt.event === 'step_failed') {
      showResumeBar(`Step "${evt.step}" failed: ${evt.error}`, evt.step)
    }
  } else if (evt.type === 'done') {
    setAgentPhase('render', 'Complete', 'done')
    document.querySelectorAll('.agent-step').forEach((el) => el.classList.add('done'))
    hideResumeBar()
    if (evt.analysisSummary) {
      showAgentReport('product_analyst', simpleMarkdownHtml(evt.analysisSummary), 'Complete')
    }
    if (evt.designStrategySummary) {
      showAgentReport('design_strategist', simpleMarkdownHtml(evt.designStrategySummary), 'Complete')
    }
    await showDesigns(evt.designs, evt.assetsBaseUrl)
    await syncChatFromServer(evt.jobId)
    log(evt.resumed ? 'Pipeline resumed and complete' : 'Pipeline complete')
    return 'done'
  } else if (evt.type === 'error') {
    const err = new Error(evt.message)
    err.failedStep = evt.failedStep
    err.canResume = evt.canResume
    throw err
  }
  return null
}

async function consumeNdjsonResponse(resp) {
  const reader = resp.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.trim()) continue
      const evt = JSON.parse(line)
      const doneEvt = await handlePipelineNdjsonEvent(evt)
      if (doneEvt === 'done') return
    }
  }
}

async function resumePipeline(jobId, fromStep = null, force = false) {
  if (!jobId) return
  submitBtn.disabled = true
  if (resumePipelineBtn) resumePipelineBtn.disabled = true
  agentStatus.classList.remove('hidden')
  hideResumeBar()
  log(`Resuming job ${jobId}…`)

  try {
    const resp = await fetch(`/api/ad-template/jobs/${encodeURIComponent(jobId)}/resume`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
      body: JSON.stringify({
        fromStep,
        force,
        forceSteps: force && fromStep ? [fromStep] : [],
      }),
    })
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      throw new Error(err.error || `HTTP ${resp.status}`)
    }
    await consumeNdjsonResponse(resp)
  } catch (err) {
    log(`Error: ${err.message}`)
    appendChatMessage({
      role: 'system',
      agent: 'orchestrator',
      content: `Pipeline error: ${err.message}${err.failedStep ? ` (failed at **${err.failedStep}**)` : ''}`,
    })
    if (err.canResume !== false) showResumeBar(err.message, err.failedStep)
  } finally {
    submitBtn.disabled = false
    if (resumePipelineBtn) resumePipelineBtn.disabled = false
    await checkHealth()
  }
}

resumePipelineBtn?.addEventListener('click', () => {
  if (currentJobId) resumePipeline(currentJobId, lastFailedStep)
})

async function syncChatFromServer(jobId) {
  const r = await fetch(`/api/ad-template/jobs/${jobId}/state`)
  if (!r.ok) return
  const state = await r.json()
  chatMessages.innerHTML = ''
  for (const m of state.chat || []) {
    appendChatMessage({
      role: m.role === 'assistant' ? 'assistant' : m.role,
      content: m.content,
      agent: m.agent,
    })
  }
}

async function sendChat(message) {
  if (!message.trim() || chatBusy) return
  chatBusy = true
  chatSendBtn.disabled = true
  appendChatMessage({ role: 'user', content: message })

  try {
    const r = await fetch('/api/ad-template/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: currentJobId, message }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)

    appendChatMessage({ role: 'assistant', agent: 'orchestrator', content: data.reply })

    if (data.designs?.length) {
      await showDesigns(data.designs, data.assetsBaseUrl)
    }

    for (const mod of data.modifications || []) {
      if (mod.error) {
        appendChatMessage({
          role: 'system',
          agent: 'orchestrator',
          content: `Could not update ${mod.designId}: ${mod.error}`,
        })
      } else if (mod.previewUrl) {
        updateDesignPreview(mod.designId, mod.previewUrl, mod.tree)
        appendChatMessage({
          role: 'system',
          agent: 'orchestrator',
          content: `**${mod.designId}** updated: ${mod.summary}`,
        })
      }
    }

    const pa = data.pipelineAction
    if (pa?.type === 'resume_pipeline' && currentJobId) {
      await resumePipeline(currentJobId, pa.fromStep, pa.force)
    }
  } catch (e) {
    appendChatMessage({
      role: 'system',
      agent: 'orchestrator',
      content: `Error: ${e.message}`,
    })
  } finally {
    chatBusy = false
    chatInput.value = ''
    await checkHealth()
  }
}

chatForm.addEventListener('submit', (e) => {
  e.preventDefault()
  sendChat(chatInput.value)
})

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    chatForm.requestSubmit()
  }
})

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  try {
    validateImageSources()
  } catch (err) {
    log(`Error: ${err.message}`)
    return
  }
  submitBtn.disabled = true
  agentStatus.classList.remove('hidden')
  logEl.innerHTML = ''
  resultsPlaceholder.classList.remove('hidden')
  designsPanel.classList.add('hidden')
  remotionRoot.innerHTML = ''

  reportAnalyst.classList.add('hidden')
  reportStrategist.classList.add('hidden')
  reportAnalyst.classList.remove('done')
  reportStrategist.classList.remove('done')
  reportAnalystStatus.textContent = 'In progress…'
  reportStrategistStatus.textContent = 'Waiting…'
  reportAnalystBody.innerHTML = ''
  reportStrategistBody.innerHTML = ''

  setAgentPhase('analysis', 'Starting…', 'active')

  const hasUploads =
    (productImageFile?.files?.length ?? 0) > 0 ||
    (logoFile?.files?.length ?? 0) > 0 ||
    (form.querySelector('input[name="referenceImage"]')?.files?.length ?? 0) > 0

  let fetchOpts = { method: 'POST' }

  if (hasUploads) {
    const fd = new FormData()
    for (const el of form.querySelectorAll('input, textarea, select')) {
      if (!el.name || el.type === 'file') continue
      if (el.type === 'checkbox') {
        if (el.checked) fd.append(el.name, el.value || 'true')
      } else if (el.value != null && String(el.value).trim() !== '') {
        fd.append(el.name, el.value)
      }
    }
    fd.set('removeBackground', removeBgCheckbox?.checked ? 'true' : 'false')
    fd.set('layoutPolish', document.getElementById('layoutPolish')?.checked ? 'true' : 'false')
    fd.set('highQuality', document.getElementById('highQuality')?.checked ? 'true' : 'false')
    if (productImageFile?.files?.[0]) fd.append('productImage', productImageFile.files[0])
    if (logoFile?.files?.[0]) fd.append('logo', logoFile.files[0])
    const refInput = form.querySelector('input[name="referenceImage"]')
    if (refInput?.files?.[0]) fd.append('referenceImage', refInput.files[0])
    fetchOpts.body = fd
  } else {
    const payload = {}
    for (const el of form.querySelectorAll('input, textarea, select')) {
      if (!el.name || el.type === 'file') continue
      if (el.type === 'checkbox') {
        if (el.checked) payload[el.name] = el.value || 'true'
      } else if (el.value != null && String(el.value).trim() !== '') {
        payload[el.name] = el.value
      }
    }
    payload.removeBackground = removeBgCheckbox?.checked ? 'true' : 'false'
    payload.layoutPolish = document.getElementById('layoutPolish')?.checked ? 'true' : 'false'
    payload.highQuality = document.getElementById('highQuality')?.checked ? 'true' : 'false'
    fetchOpts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
      body: JSON.stringify(payload),
    }
  }

  try {
    const resp = await fetch('/api/ad-template/generate', fetchOpts)
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}))
      throw new Error(err.error || `HTTP ${resp.status}`)
    }
    await consumeNdjsonResponse(resp)
  } catch (err) {
    log(`Error: ${err.message}`)
    appendChatMessage({
      role: 'system',
      agent: 'orchestrator',
      content: `Pipeline error: ${err.message}${err.failedStep ? ` (failed at **${err.failedStep}**)` : ''}`,
    })
    if (err.canResume !== false && currentJobId) {
      showResumeBar(err.message, err.failedStep)
    }
  } finally {
    submitBtn.disabled = false
    await checkHealth()
  }
})

appendChatMessage({ role: 'assistant', agent: 'orchestrator', content: ORCHESTRATOR_WELCOME })
wireImageSourceInputs()
checkHealth()
