import {
  renderTreeToDOM,
  readNodeBoundsFromElement,
  applyNodeBoundsToElement,
  resolveAssetUrl,
} from './renderTree.js'

const params = new URLSearchParams(window.location.search)
const jobId = params.get('jobId')
const designId = params.get('designId') || null
const returnUrl = params.get('return') || null

const els = {
  backLink: document.getElementById('backLink'),
  editorSubtitle: document.getElementById('editorSubtitle'),
  editorError: document.getElementById('editorError'),
  layersList: document.getElementById('layersList'),
  layerUpBtn: document.getElementById('layerUpBtn'),
  layerDownBtn: document.getElementById('layerDownBtn'),
  frameBg: document.getElementById('frameBg'),
  designFrame: document.getElementById('designFrame'),
  stageViewport: document.getElementById('stageViewport'),
  stageScale: document.getElementById('stageScale'),
  zoomOutBtn: document.getElementById('zoomOutBtn'),
  zoomInBtn: document.getElementById('zoomInBtn'),
  zoomFitBtn: document.getElementById('zoomFitBtn'),
  zoomLabel: document.getElementById('zoomLabel'),
  propsEmpty: document.getElementById('propsEmpty'),
  propsForm: document.getElementById('propsForm'),
  saveBtn: document.getElementById('saveBtn'),
  confirmBtn: document.getElementById('confirmBtn'),
  undoBtn: document.getElementById('undoBtn'),
  redoBtn: document.getElementById('redoBtn'),
  serverPreview: document.getElementById('serverPreview'),
  statusBar: document.getElementById('statusBar'),
}

let tree = null
let assetsBaseUrl = ''
let layerMap = new Map()
let selectedId = null
let moveable = null
let MoveableClass = null
let zoom = 1
let saveTimer = null
let rerenderTimer = null
let moveableReady = null
const undoStack = []
const redoStack = []
const MAX_UNDO = 40

function apiPaths() {
  if (designId) {
    return {
      meta: `/api/ad-template/jobs/${jobId}/designs/${designId}/editor-meta`,
      patch: `/api/ad-template/jobs/${jobId}/designs/${designId}/tree`,
      rerender: `/api/ad-template/jobs/${jobId}/designs/${designId}/editor-rerender`,
      confirm: `/api/ad-template/jobs/${jobId}/designs/${designId}/confirm`,
    }
  }
  return {
    meta: `/api/jobs/${jobId}/editor-meta`,
    patch: `/api/jobs/${jobId}/tree`,
    rerender: `/api/jobs/${jobId}/editor-rerender`,
    confirm: `/api/jobs/${jobId}/confirm`,
  }
}

function setStatus(msg) {
  els.statusBar.textContent = msg
}

function showError(msg) {
  els.editorError.textContent = msg
  els.editorError.classList.remove('hidden')
}

function preloadMoveable() {
  if (!moveableReady) {
    moveableReady = import('https://cdn.jsdelivr.net/npm/moveable@0.53.0/+esm').then((mod) => {
      MoveableClass = mod.default || mod.Moveable
      return MoveableClass
    })
  }
  return moveableReady
}

function pushUndo() {
  undoStack.push(JSON.stringify(tree))
  if (undoStack.length > MAX_UNDO) undoStack.shift()
  redoStack.length = 0
  els.undoBtn.disabled = undoStack.length === 0
  els.redoBtn.disabled = true
}

function restoreFromSnapshot(json) {
  tree = JSON.parse(json)
  refreshDom()
  renderLayersList()
  if (selectedId) buildPropsForm(selectedId)
  scheduleSave()
}

function undo() {
  if (!undoStack.length) return
  redoStack.push(JSON.stringify(tree))
  restoreFromSnapshot(undoStack.pop())
  els.undoBtn.disabled = undoStack.length === 0
  els.redoBtn.disabled = false
}

function redo() {
  if (!redoStack.length) return
  undoStack.push(JSON.stringify(tree))
  restoreFromSnapshot(redoStack.pop())
  els.undoBtn.disabled = false
  els.redoBtn.disabled = redoStack.length === 0
}

function findNode(id) {
  return (tree.children || []).find((n) => n.id === id)
}

function setZoom(z) {
  zoom = Math.max(0.15, Math.min(3, z))
  els.stageScale.style.transform = `scale(${zoom})`
  els.zoomLabel.textContent = `${Math.round(zoom * 100)}%`
  if (moveable) {
    moveable.zoom = zoom
    moveable.updateRect()
  }
}

function fitZoom() {
  if (!tree?.width || !tree?.height) return
  const pad = 48
  const vw = els.stageViewport.clientWidth - pad
  const vh = els.stageViewport.clientHeight - pad
  const scale = Math.min(vw / tree.width, vh / tree.height, 1)
  setZoom(scale)
}

function updateMoveableTarget() {
  if (!moveable || !selectedId) return
  const el = layerMap.get(selectedId)
  if (!el) {
    destroyMoveable()
    return
  }
  moveable.target = el
  moveable.zoom = zoom
  moveable.updateRect()
}

function destroyMoveable() {
  if (moveable) {
    moveable.destroy()
    moveable = null
  }
}

function ensureMoveable() {
  if (moveable) return moveable
  if (!MoveableClass) return null
  moveable = new MoveableClass(els.stageViewport, {
    draggable: true,
    resizable: true,
    origin: false,
    keepRatio: false,
    rootContainer: els.stageScale,
    zoom,
  })

  moveable.on('dragStart', () => {
    pushUndo()
  })

  moveable.on('drag', ({ target, left, top }) => {
    target.style.left = `${left}px`
    target.style.top = `${top}px`
  })

  moveable.on('resizeStart', () => {
    pushUndo()
  })

  moveable.on('resize', ({ target, width, height, drag }) => {
    target.style.width = `${width}px`
    target.style.height = `${height}px`
    if (drag) {
      target.style.left = `${drag.left}px`
      target.style.top = `${drag.top}px`
    }
  })

  const commitBounds = ({ target }) => {
    const bounds = readNodeBoundsFromElement(target, tree)
    const node = findNode(target.dataset.nodeId)
    if (!node || !bounds) return
    Object.assign(node, bounds)
    scheduleSave()
  }

  moveable.on('dragEnd', commitBounds)
  moveable.on('resizeEnd', commitBounds)
  return moveable
}

function attachMoveable(target) {
  if (!target) {
    destroyMoveable()
    return
  }
  ensureMoveable()
  if (!moveable) return
  moveable.target = target
  moveable.zoom = zoom
  moveable.updateRect()
}

function syncLayerDom(nodeId) {
  const node = findNode(nodeId)
  const el = layerMap.get(nodeId)
  if (!node || !el) return
  applyNodeBoundsToElement(el, node)
  if (selectedId === nodeId) updateMoveableTarget()
}

function refreshDom() {
  layerMap = renderTreeToDOM(els.designFrame, tree, assetsBaseUrl)
  for (const [id, el] of layerMap) {
    el.addEventListener('pointerdown', (e) => {
      e.stopPropagation()
      if (selectedId !== id) selectLayer(id)
    })
  }
  if (selectedId && layerMap.has(selectedId)) {
    layerMap.get(selectedId).classList.add('dt-selected')
    attachMoveable(layerMap.get(selectedId))
  } else {
    destroyMoveable()
  }
  els.frameBg.value = toHexColor(tree.backgroundColor || '#ffffff')
}

function toHexColor(c) {
  if (!c || typeof c !== 'string') return '#ffffff'
  if (/^#[0-9a-f]{6}$/i.test(c)) return c
  return '#ffffff'
}

function selectLayer(id) {
  selectedId = id
  for (const [nid, el] of layerMap) {
    el.classList.toggle('dt-selected', nid === id)
  }
  els.layerUpBtn.disabled = !id
  els.layerDownBtn.disabled = !id
  if (id) {
    els.propsEmpty.classList.add('hidden')
    els.propsForm.classList.remove('hidden')
    buildPropsForm(id)
    attachMoveable(layerMap.get(id))
  } else {
    els.propsEmpty.classList.remove('hidden')
    els.propsForm.classList.add('hidden')
    destroyMoveable()
  }
  renderLayersList()
}

function sortedLayers() {
  return [...(tree.children || [])].sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0))
}

function renderLayersList() {
  els.layersList.innerHTML = ''
  for (const node of sortedLayers()) {
    const li = document.createElement('li')
    li.textContent = node.id
    li.dataset.nodeId = node.id
    if (node.id === selectedId) li.classList.add('selected')
    li.addEventListener('click', () => selectLayer(node.id))
    els.layersList.appendChild(li)
  }
}

function buildPropsForm(nodeId) {
  const node = findNode(nodeId)
  if (!node) return
  const fields = fieldsForNodeClient(node)
  els.propsForm.innerHTML = ''
  for (const f of fields) {
    const label = document.createElement('label')
    label.className = 'field'
    const span = document.createElement('span')
    span.textContent = f.label
    label.appendChild(span)

    let input
    if (f.kind === 'textarea') {
      input = document.createElement('textarea')
      input.value = f.value ?? ''
    } else if (f.kind === 'select') {
      input = document.createElement('select')
      for (const opt of f.options || []) {
        const o = document.createElement('option')
        o.value = opt.value
        o.textContent = opt.label
        if (String(f.value) === String(opt.value)) o.selected = true
        input.appendChild(o)
      }
    } else if (f.kind === 'color') {
      input = document.createElement('input')
      input.type = 'color'
      input.value = toHexColor(f.value)
    } else if (f.kind === 'image') {
      input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/png,image/jpeg,image/webp'
    } else {
      input = document.createElement('input')
      input.type = f.kind === 'number' ? 'number' : 'text'
      input.value = f.value ?? ''
      if (f.min != null) input.min = f.min
      if (f.max != null) input.max = f.max
      if (f.step != null) input.step = f.step
    }
    input.dataset.field = f.key
    input.addEventListener('change', () => onPropChange(nodeId, f.key, input))
    if (f.kind !== 'image') {
      input.addEventListener('input', () => onPropChange(nodeId, f.key, input))
    }
    label.appendChild(input)

    if (f.previewSrc) {
      const img = document.createElement('img')
      img.src = f.previewSrc
      img.alt = 'preview'
      img.style.maxWidth = '100%'
      img.style.marginTop = '0.35rem'
      label.appendChild(img)
    }

    els.propsForm.appendChild(label)
  }
}

function fieldsForNodeClient(node) {
  const fields = []
  const raster = new Set(['image', 'logo', 'background'])
  const isText = node.type === 'text' || node.type === 'button'

  if (isText) {
    fields.push({ key: 'text', kind: 'textarea', label: 'Text', value: node.text || '' })
    fields.push({ key: 'color', kind: 'color', label: 'Text color', value: node.color || '#111' })
    fields.push({ key: 'fontSize', kind: 'number', label: 'Font size', value: node.fontSize ?? 24, min: 8, max: 160 })
    fields.push({
      key: 'textAlign',
      kind: 'select',
      label: 'Alignment',
      value: node.textAlign || 'left',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
      ],
    })
    if (node.type === 'button') {
      fields.push({ key: 'backgroundColor', kind: 'color', label: 'Button fill', value: node.backgroundColor || '#e11' })
      fields.push({ key: 'borderRadius', kind: 'number', label: 'Radius', value: node.borderRadius ?? 8, min: 0, max: 80 })
    }
  }

  if (raster.has(node.type) && node.src) {
    const previewSrc = resolveAssetUrl(node.src, assetsBaseUrl)
    fields.push({ key: 'imageFile', kind: 'image', label: 'Replace image', previewSrc })
  }

  if (node.type === 'shape' && node.cssBackground) {
    fields.push({ key: 'cssBackground', kind: 'text', label: 'CSS background', value: node.cssBackground })
  } else if (node.type === 'shape' && !node.cssBackground) {
    fields.push({ key: 'fill', kind: 'color', label: 'Fill', value: node.fill || '#ccc' })
  }

  if (node.type === 'rating') {
    fields.push({ key: 'ratingValue', kind: 'number', label: 'Stars', value: node.ratingValue ?? 5, min: 0, max: 5, step: 0.5 })
  }

  return fields
}

function onPropChange(nodeId, key, input) {
  const node = findNode(nodeId)
  if (!node) return

  if (key === 'imageFile' && input.files?.[0]) {
    uploadLayerImage(nodeId, input.files[0])
    return
  }

  pushUndo()
  let val = input.value
  if (key === 'fontSize' || key === 'borderRadius' || key === 'ratingValue') val = Number(val)
  node[key] = val

  if (key === 'text' || key === 'fontSize' || key === 'color' || key === 'textAlign' || key === 'backgroundColor') {
    refreshDom()
    selectLayer(nodeId)
  } else {
    syncLayerDom(nodeId)
  }
  scheduleSave()
}

async function uploadLayerImage(nodeId, file) {
  pushUndo()
  const paths = apiPaths()
  const fd = new FormData()
  fd.append('tree', JSON.stringify(tree))
  fd.append(`asset_${nodeId}`, file)
  setStatus('Uploading image…')
  try {
    const r = await fetch(paths.rerender, { method: 'POST', body: fd })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
    if (data.tree) tree = data.tree
    assetsBaseUrl = data.assetsBaseUrl || assetsBaseUrl
    refreshDom()
    selectLayer(nodeId)
    if (data.previewPngUrl) {
      els.serverPreview.src = `${data.previewPngUrl}?t=${Date.now()}`
    }
    setStatus('Image updated')
  } catch (e) {
    showError(e.message)
    setStatus('Upload failed')
  }
}

function reorderLayer(direction) {
  if (!selectedId) return
  const children = [...(tree.children || [])].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  const idx = children.findIndex((n) => n.id === selectedId)
  if (idx < 0) return
  const swap = direction === 'up' ? idx + 1 : idx - 1
  if (swap < 0 || swap >= children.length) return
  pushUndo()
  const a = children[idx]
  const b = children[swap]
  const tmp = a.zIndex ?? idx
  a.zIndex = b.zIndex ?? swap
  b.zIndex = tmp
  refreshDom()
  selectLayer(selectedId)
  scheduleSave()
}

function scheduleSave() {
  clearTimeout(saveTimer)
  clearTimeout(rerenderTimer)
  saveTimer = setTimeout(saveTree, 400)
  rerenderTimer = setTimeout(rerenderPreview, 500)
}

async function saveTree() {
  const paths = apiPaths()
  setStatus('Saving…')
  try {
    const r = await fetch(paths.patch, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tree }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
    setStatus('Saved')
  } catch (e) {
    setStatus(`Save failed: ${e.message}`)
  }
}

async function rerenderPreview() {
  const paths = apiPaths()
  try {
    const r = await fetch(paths.rerender, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tree }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
    if (data.previewPngUrl) {
      els.serverPreview.src = `${data.previewPngUrl}?t=${Date.now()}`
    }
    setStatus('Preview updated')
  } catch {
    /* preview optional */
  }
}

async function confirmExport() {
  const paths = apiPaths()
  els.confirmBtn.disabled = true
  setStatus('Confirming and rendering final PNG…')
  try {
    await saveTree()
    const r = await fetch(paths.confirm, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tree }),
    })
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
    if (data.tree) tree = data.tree
    refreshDom()
    if (data.previewPngUrl) {
      els.serverPreview.src = `${data.previewPngUrl}?t=${Date.now()}`
      window.open(`${data.previewPngUrl}?t=${Date.now()}`, '_blank')
    }
    setStatus('Confirmed — final PNG exported')
    if (returnUrl) {
      setTimeout(() => {
        window.location.href = returnUrl
      }, 800)
    }
  } catch (e) {
    showError(e.message)
    setStatus('Confirm failed')
  } finally {
    els.confirmBtn.disabled = false
  }
}

async function init() {
  if (!jobId) {
    showError('Missing jobId query parameter')
    return
  }

  await preloadMoveable()

  if (returnUrl) els.backLink.href = returnUrl
  else if (designId) els.backLink.href = '/'
  else els.backLink.href = '/image-to-tree'

  const paths = apiPaths()
  els.editorSubtitle.textContent = designId
    ? `Job ${jobId} · design ${designId}`
    : `Job ${jobId}`

  try {
    const r = await fetch(paths.meta)
    const data = await r.json()
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`)
    tree = data.tree
    assetsBaseUrl = data.assetsBaseUrl

    refreshDom()
    renderLayersList()
    fitZoom()
    setStatus('Ready')

    if (designId) {
      els.serverPreview.src = `/runs/${jobId}/designs/${designId}/preview.png?t=${Date.now()}`
    } else {
      els.serverPreview.src = `/runs/${jobId}/preview.png?t=${Date.now()}`
    }
  } catch (e) {
    showError(e.message)
    setStatus('Failed to load')
  }
}

els.designFrame.addEventListener('pointerdown', (e) => {
  if (e.target === els.designFrame) selectLayer(null)
})

els.frameBg.addEventListener('input', () => {
  pushUndo()
  tree.backgroundColor = els.frameBg.value
  els.designFrame.style.background = tree.backgroundColor
  scheduleSave()
})

els.layerUpBtn.addEventListener('click', () => reorderLayer('up'))
els.layerDownBtn.addEventListener('click', () => reorderLayer('down'))
els.zoomInBtn.addEventListener('click', () => setZoom(zoom * 1.15))
els.zoomOutBtn.addEventListener('click', () => setZoom(zoom / 1.15))
els.zoomFitBtn.addEventListener('click', fitZoom)
els.saveBtn.addEventListener('click', () => saveTree())
els.confirmBtn.addEventListener('click', confirmExport)
els.undoBtn.addEventListener('click', undo)
els.redoBtn.addEventListener('click', redo)

window.addEventListener('keydown', (e) => {
  if (!selectedId || e.target.matches('input, textarea, select')) return
  const node = findNode(selectedId)
  if (!node) return
  const step = e.shiftKey ? 10 : 1
  let dx = 0
  let dy = 0
  if (e.key === 'ArrowLeft') dx = -step
  else if (e.key === 'ArrowRight') dx = step
  else if (e.key === 'ArrowUp') dy = -step
  else if (e.key === 'ArrowDown') dy = step
  else return

  e.preventDefault()
  pushUndo()
  node.x = Math.round((node.x ?? 0) + dx)
  node.y = Math.round((node.y ?? 0) + dy)
  syncLayerDom(selectedId)
  scheduleSave()
})

init()
