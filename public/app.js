const imageInput = document.getElementById('imageInput')
const maxLoopsInput = document.getElementById('maxLoops')
const highAccuracyInput = document.getElementById('highAccuracy')
const analyzeOnlyInput = document.getElementById('analyzeOnly')
const runBtn = document.getElementById('runBtn')
const rerenderBtn = document.getElementById('rerenderBtn')
const statusEl = document.getElementById('status')
const progressBar = document.getElementById('progressBar')
const logEl = document.getElementById('log')
const healthEl = document.getElementById('health')
const originalPreview = document.getElementById('originalPreview')
const renderPreview = document.getElementById('renderPreview')
const renderOverlay = document.getElementById('renderOverlay')
const renderPlaceholder = document.getElementById('renderPlaceholder')
const stepsEl = document.getElementById('steps')
const elementsEl = document.getElementById('elements')
const treeJson = document.getElementById('treeJson')
const downloadJson = document.getElementById('downloadJson')
const renderChoicesEl = document.getElementById('renderChoices')
const renderChoicesHeading = document.getElementById('renderChoicesHeading')
const renderChoicesHint = document.getElementById('renderChoicesHint')
const applyRenderChoicesBtn = document.getElementById('applyRenderChoicesBtn')
const overlayModeInput = document.getElementById('overlayMode')
const overlayOpacityInput = document.getElementById('overlayOpacity')
const overlayOpacityWrap = document.getElementById('overlayOpacityWrap')
const compareRoot = document.getElementById('compareRoot')
const reconstructionScoreEl = document.getElementById('reconstructionScore')
const exportLayersBtn = document.getElementById('exportLayersBtn')
const visualEditorBtn = document.getElementById('visualEditorBtn')

let selectedFile = null
let objectUrl = null
let currentJobId = null
let currentTree = null
let currentElements = []
let currentRenderAmbiguities = []
let appliedRenderChoices = {}

function setStatus(text) {
  statusEl.textContent = text
}

function addLog(text) {
  const li = document.createElement('li')
  li.textContent = text
  logEl.prepend(li)
}

function setProgress(loop, total) {
  const pct = total ? Math.min(100, Math.round((loop / total) * 100)) : 5
  progressBar.style.width = `${Math.max(5, pct)}%`
}

async function checkHealth() {
  try {
    const res = await fetch('/api/health')
    const data = await res.json()
    if (data.ok) {
      healthEl.textContent = `Ready — ${data.model} · Playwright OK`
      healthEl.className = 'health ok'
    } else {
      const parts = []
      if (!data.anthropicKey) parts.push('ANTHROPIC_API_KEY missing in .env.local')
      if (!data.playwright) parts.push('run npm run setup-browser')
      healthEl.textContent = parts.join(' · ')
      healthEl.className = 'health bad'
    }
  } catch (e) {
    healthEl.textContent = `Cannot reach server: ${e.message}`
    healthEl.className = 'health bad'
  }
}

imageInput.addEventListener('change', () => {
  selectedFile = imageInput.files?.[0] || null
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  currentJobId = null
  currentTree = null
  rerenderBtn.hidden = true
  hideRenderChoices()
  elementsEl.innerHTML = ''

  if (selectedFile) {
    objectUrl = URL.createObjectURL(selectedFile)
    originalPreview.src = objectUrl
    renderPreview.removeAttribute('src')
    renderPlaceholder.hidden = false
    runBtn.disabled = false
    setStatus(`Selected: ${selectedFile.name}`)
  } else {
    originalPreview.removeAttribute('src')
    runBtn.disabled = true
    setStatus('Upload an image to start.')
  }
})

analyzeOnlyInput.addEventListener('change', () => {
  maxLoopsInput.disabled = analyzeOnlyInput.checked
})

maxLoopsInput.disabled = analyzeOnlyInput.checked

runBtn.addEventListener('click', () => runPipeline())
rerenderBtn.addEventListener('click', () => rerenderWithOverrides())
applyRenderChoicesBtn?.addEventListener('click', () => applyRenderChoices())
exportLayersBtn?.addEventListener('click', () => exportLayers())
overlayModeInput?.addEventListener('change', updateOverlayMode)
overlayOpacityInput?.addEventListener('input', updateOverlayMode)

function syncOverlayImage(src) {
  if (!renderOverlay || !src) return
  renderOverlay.src = src
}

function updateOverlayMode() {
  const on = overlayModeInput?.checked
  compareRoot?.classList.toggle('overlay-mode', Boolean(on))
  overlayOpacityWrap?.classList.toggle('hidden', !on)
  renderOverlay?.classList.toggle('hidden', !on || !renderPreview?.src)
  const opacity = String((Number(overlayOpacityInput?.value || 50) || 50) / 100)
  if (renderOverlay && on) renderOverlay.style.opacity = opacity
  else if (renderOverlay) renderOverlay.style.opacity = ''
}

function onRenderImageUpdated(src) {
  if (!src) return
  renderPreview.src = src
  syncOverlayImage(src)
  renderPlaceholder.hidden = true
  updateOverlayMode()
}

function showReconstructionScore(scores) {
  if (!reconstructionScoreEl) return
  const last = Array.isArray(scores) ? scores[scores.length - 1] : scores
  if (!last?.similarity && last?.similarity !== 0) {
    reconstructionScoreEl.classList.add('hidden')
    return
  }
  reconstructionScoreEl.classList.remove('hidden')
  const pct = Math.round(last.similarity * 100)
  reconstructionScoreEl.textContent = `Reconstruction similarity: ${pct}% (MAE ${last.mae ?? '—'})`
}

async function exportLayers() {
  if (!currentJobId) return
  window.open(`/api/jobs/${currentJobId}/layers-export?format=md`, '_blank')
}

async function runPipeline() {
  if (!selectedFile) return

  runBtn.disabled = true
  rerenderBtn.hidden = true
  logEl.innerHTML = ''
  stepsEl.innerHTML = ''
  elementsEl.innerHTML = ''
  treeJson.textContent = 'Running…'
  downloadJson.hidden = true
  renderPreview.removeAttribute('src')
  renderPlaceholder.hidden = false
  setProgress(0, Number(maxLoopsInput.value) || 10)

  const form = new FormData()
  form.append('image', selectedFile)
  form.append('maxLoops', String(maxLoopsInput.value || 10))
  form.append('highAccuracy', highAccuracyInput.checked ? 'true' : 'false')
  form.append('analyzeOnly', analyzeOnlyInput.checked ? 'true' : 'false')

  setStatus(analyzeOnlyInput.checked ? 'Identifying elements…' : 'Running full pipeline…')
  addLog('Uploading image…')

  try {
    const res = await fetch('/api/run', { method: 'POST', body: form })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `HTTP ${res.status}`)
    }

    const reader = res.body.getReader()
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
        if (evt.type === 'progress') {
          setStatus(evt.message)
          addLog(evt.message)
          setProgress(evt.loop || 0, evt.total || 10)
        } else if (evt.type === 'render' && evt.pngUrl) {
          onRenderImageUpdated(`${evt.pngUrl}?t=${Date.now()}`)
        } else if (evt.type === 'done') {
          handleDone(evt)
        } else if (evt.type === 'error') {
          throw new Error(evt.message)
        }
      }
    }
  } catch (e) {
    setStatus(`Failed: ${e.message}`)
    addLog(`Error: ${e.message}`)
    treeJson.textContent = String(e.message)
  } finally {
    runBtn.disabled = !selectedFile
  }
}

function setCompareAspectRatio(tree) {
  const w = tree?.width
  const h = tree?.height
  if (!w || !h) return
  for (const stage of document.querySelectorAll('.compare-stage')) {
    stage.style.aspectRatio = `${w} / ${h}`
  }
}

async function handleDone(evt) {
  progressBar.style.width = '100%'
  setStatus('Done. Edit elements below and re-render to test different copy/images.')
  currentJobId = evt.jobId

  if (evt.originalUrl) originalPreview.src = evt.originalUrl
  if (evt.finalPngUrl) {
    onRenderImageUpdated(`${evt.finalPngUrl}?t=${Date.now()}`)
  }

  renderSteps(evt.steps || [])

  if (evt.finalTreeUrl) {
    const treeRes = await fetch(evt.finalTreeUrl)
    currentTree = await treeRes.json()
    treeJson.textContent = JSON.stringify(currentTree, null, 2)
    setCompareAspectRatio(currentTree)
    downloadJson.href = evt.finalTreeUrl
    downloadJson.hidden = false
  }

  currentElements = evt.elements || []
  currentRenderAmbiguities = evt.renderAmbiguities || []
  appliedRenderChoices = evt.appliedRenderChoices || appliedRenderChoices
  renderRenderChoiceEditor(currentRenderAmbiguities, appliedRenderChoices)
  showReconstructionScore(evt.reconstructionScores)
  if (exportLayersBtn) exportLayersBtn.hidden = !currentJobId
  if (evt.layersExportUrl && exportLayersBtn) exportLayersBtn.dataset.exportUrl = evt.layersExportUrl

  if (!currentElements.length && evt.jobId) {
    try {
      const tr = await fetch(`/api/jobs/${evt.jobId}/tree`)
      if (tr.ok) {
        const data = await tr.json()
        currentTree = data.tree
        currentElements = data.elements || []
        treeJson.textContent = JSON.stringify(currentTree, null, 2)
      }
    } catch {
      /* ignore */
    }
  }

  if (currentTree) setCompareAspectRatio(currentTree)
  renderElementEditor(currentElements)
  rerenderBtn.hidden = !currentJobId
  if (visualEditorBtn && currentJobId) {
    visualEditorBtn.href = `/editor?jobId=${encodeURIComponent(currentJobId)}&return=${encodeURIComponent('/image-to-tree')}`
    visualEditorBtn.classList.remove('hidden')
  }

  if (!currentElements.length) {
    setStatus('Done, but no layers were identified. Check Design tree JSON below or re-run.')
    addLog('Warning: 0 elements — LLM may have returned an empty tree.')
  } else {
    addLog(`Identified ${currentElements.length} element(s).`)
  }
}

function renderSteps(steps) {
  stepsEl.innerHTML = ''
  if (!steps.length) {
    stepsEl.innerHTML = '<p class="hint">No refinement loops (identify-only mode).</p>'
    return
  }
  for (const step of steps) {
    const card = document.createElement('div')
    card.className = 'step-card'
    if (step.pngUrl) {
      const img = document.createElement('img')
      img.src = step.pngUrl
      img.alt = step.label
      card.appendChild(img)
    }
    const meta = document.createElement('div')
    meta.className = 'meta'
    meta.textContent = `${step.label} · ${step.patchCount} patch(es)`
    card.appendChild(meta)
    stepsEl.appendChild(card)
  }
}

function hideRenderChoices() {
  if (!renderChoicesEl) return
  renderChoicesEl.innerHTML = ''
  renderChoicesEl.classList.add('hidden')
  renderChoicesHeading?.classList.add('hidden')
  renderChoicesHint?.classList.add('hidden')
  applyRenderChoicesBtn?.classList.add('hidden')
  currentRenderAmbiguities = []
}

function renderRenderChoiceEditor(ambiguities, choiceOverrides = {}) {
  if (!renderChoicesEl || !ambiguities?.length) {
    hideRenderChoices()
    return
  }

  renderChoicesEl.innerHTML = ''
  renderChoicesEl.classList.remove('hidden')
  renderChoicesHeading?.classList.remove('hidden')
  renderChoicesHint?.classList.remove('hidden')
  applyRenderChoicesBtn?.classList.remove('hidden')

  for (const item of ambiguities) {
    const selected = choiceOverrides[item.id] || item.defaultChoice || 'crop'
    const card = document.createElement('div')
    card.className = 'render-choice-card'
    card.dataset.nodeId = item.id

    const title = document.createElement('p')
    title.className = 'render-choice-title'
    title.innerHTML = `<strong>${item.id}</strong> <span class="tag">${item.role || 'layer'}</span>`
    card.appendChild(title)

    if (item.label) {
      const reason = document.createElement('p')
      reason.className = 'hint'
      reason.textContent = item.label
      card.appendChild(reason)
    }

    const fieldset = document.createElement('fieldset')
    fieldset.className = 'render-choice-options'
    fieldset.innerHTML = `
      <label class="render-choice-option">
        <input type="radio" name="render_${item.id}" value="css" ${selected === 'css' ? 'checked' : ''} />
        <span><strong>CSS style</strong> — ${escHtml(item.css?.summary || 'shape + cssBackground')}</span>
      </label>
      <label class="render-choice-option">
        <input type="radio" name="render_${item.id}" value="crop" ${selected === 'crop' ? 'checked' : ''} />
        <span><strong>Image crop</strong> — ${escHtml(item.crop?.summary || 'crop from original')}</span>
      </label>
    `
    card.appendChild(fieldset)

    if (item.css?.cssBackground) {
      const pre = document.createElement('pre')
      pre.className = 'css-preview'
      pre.textContent = item.css.cssBackground
      card.appendChild(pre)
    }

    renderChoicesEl.appendChild(card)
  }
}

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function collectRenderChoices() {
  const choices = {}
  for (const card of renderChoicesEl?.querySelectorAll('.render-choice-card') || []) {
    const id = card.dataset.nodeId
    const picked = card.querySelector(`input[name="render_${id}"]:checked`)
    if (picked) choices[id] = picked.value
  }
  return choices
}

async function applyRenderChoices() {
  if (!currentJobId || !currentRenderAmbiguities.length) return

  applyRenderChoicesBtn.disabled = true
  setStatus('Applying render choices…')

  try {
    const res = await fetch(`/api/jobs/${currentJobId}/resolve-renders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ renderChoices: collectRenderChoices() }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

    if (data.previewPngUrl) {
      onRenderImageUpdated(`${data.previewPngUrl}?t=${Date.now()}`)
    }
    currentTree = data.tree
    treeJson.textContent = JSON.stringify(currentTree, null, 2)
    currentElements = data.elements || []
    currentRenderAmbiguities = data.renderAmbiguities || []
    appliedRenderChoices = { ...appliedRenderChoices, ...(data.appliedRenderChoices || collectRenderChoices()) }
    renderElementEditor(currentElements)
    renderRenderChoiceEditor(currentRenderAmbiguities, appliedRenderChoices)
    rerenderBtn.hidden = false
    setStatus('Render choices applied.')
    addLog('Re-rendered with CSS vs crop choices.')
  } catch (e) {
    setStatus(`Render choice failed: ${e.message}`)
    addLog(`Error: ${e.message}`)
  } finally {
    applyRenderChoicesBtn.disabled = false
  }
}

function renderElementEditor(elements) {
  elementsEl.innerHTML = ''
  if (!elements.length) {
    elementsEl.innerHTML = '<p class="hint">No elements identified yet.</p>'
    return
  }

  for (const el of elements) {
    const card = document.createElement('div')
    card.className = 'element-card'
    card.dataset.nodeId = el.id

    const head = document.createElement('div')
    head.className = 'element-head'
    head.innerHTML = `<strong>${el.id}</strong> <span class="tag">${el.type}</span> <span class="tag">${el.role || 'no role'}</span>`
    card.appendChild(head)

    const meta = document.createElement('p')
    meta.className = 'element-meta'
    meta.textContent = `Box ${Math.round(el.x)},${Math.round(el.y)} ${Math.round(el.width)}×${Math.round(el.height)} · z${el.zIndex}`
    card.appendChild(meta)

    const sourceRow = document.createElement('label')
    sourceRow.className = 'field inline'
    sourceRow.innerHTML = `<span>Content</span>`
    const select = document.createElement('select')
    select.dataset.field = 'contentSource'
    select.innerHTML = `
      <option value="crop" ${el.contentSource !== 'user' ? 'selected' : ''}>Crop from uploaded ad</option>
      <option value="user" ${el.contentSource === 'user' ? 'selected' : ''}>Your text / image</option>
    `
    sourceRow.appendChild(select)
    card.appendChild(sourceRow)

    if (el.editableLayout) {
      const nudge = document.createElement('div')
      nudge.className = 'layout-nudge'
      nudge.innerHTML = `
        <label>x<input type="number" data-field="x" value="${Math.round(el.x ?? 0)}" /></label>
        <label>y<input type="number" data-field="y" value="${Math.round(el.y ?? 0)}" /></label>
        <label>w<input type="number" data-field="width" value="${Math.round(el.width ?? 0)}" /></label>
        <label>h<input type="number" data-field="height" value="${Math.round(el.height ?? 0)}" /></label>
      `
      card.appendChild(nudge)
    }

    if (el.editableText) {
      const textLabel = document.createElement('label')
      textLabel.className = 'field'
      textLabel.innerHTML = '<span>Text</span>'
      const textarea = document.createElement('textarea')
      textarea.rows = 2
      textarea.dataset.field = 'text'
      textarea.placeholder = el.needsUserText ? 'Enter text for this layer…' : 'Headline, tagline, CTA…'
      textarea.value = el.text || ''
      textLabel.appendChild(textarea)
      card.appendChild(textLabel)
    }

    if (el.needsRenderChoice) {
      const note = document.createElement('p')
      note.className = 'hint'
      note.textContent = 'This layer has CSS vs crop options — use the section above.'
      card.appendChild(note)
    }

    if (el.editableImage) {
      const imgLabel = document.createElement('label')
      imgLabel.className = 'field'
      imgLabel.innerHTML = '<span>Replacement image</span>'
      const file = document.createElement('input')
      file.type = 'file'
      file.accept = 'image/png,image/jpeg,image/webp'
      file.dataset.field = 'imageFile'
      imgLabel.appendChild(file)
      card.appendChild(imgLabel)

      if (el.src) {
        const thumb = document.createElement('img')
        thumb.className = 'element-thumb'
        thumb.src = `/runs/${currentJobId}/${el.src}`
        thumb.alt = el.id
        card.appendChild(thumb)
      }
    }

    elementsEl.appendChild(card)
  }
}

function collectOverrides() {
  const overrides = {}
  for (const card of elementsEl.querySelectorAll('.element-card')) {
    const id = card.dataset.nodeId
    const o = {}
    const select = card.querySelector('[data-field="contentSource"]')
    if (select) o.contentSource = select.value

    const textarea = card.querySelector('[data-field="text"]')
    if (textarea && textarea.value.trim()) o.text = textarea.value.trim()

    for (const key of ['x', 'y', 'width', 'height']) {
      const input = card.querySelector(`[data-field="${key}"]`)
      if (input && input.value !== '') o[key] = Number(input.value)
    }

    overrides[id] = o
  }
  return overrides
}

function collectImageFiles() {
  const files = []
  for (const card of elementsEl.querySelectorAll('.element-card')) {
    const id = card.dataset.nodeId
    const input = card.querySelector('[data-field="imageFile"]')
    if (input?.files?.[0]) {
      files.push({ nodeId: id, file: input.files[0] })
    }
  }
  return files
}

async function rerenderWithOverrides() {
  if (!currentJobId) return

  rerenderBtn.disabled = true
  setStatus('Re-rendering with your edits…')

  const form = new FormData()
  form.append('overrides', JSON.stringify(collectOverrides()))
  for (const { nodeId, file } of collectImageFiles()) {
    form.append(`asset_${nodeId}`, file)
  }

  try {
    const res = await fetch(`/api/jobs/${currentJobId}/rerender`, { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)

    if (data.previewPngUrl) {
      onRenderImageUpdated(`${data.previewPngUrl}?t=${Date.now()}`)
    }
    currentTree = data.tree
    treeJson.textContent = JSON.stringify(currentTree, null, 2)
    currentElements = data.elements || []
    renderElementEditor(currentElements)
    setStatus('Re-render complete.')
    addLog('Re-rendered with user overrides.')
  } catch (e) {
    setStatus(`Re-render failed: ${e.message}`)
    addLog(`Error: ${e.message}`)
  } finally {
    rerenderBtn.disabled = false
  }
}

checkHealth()
