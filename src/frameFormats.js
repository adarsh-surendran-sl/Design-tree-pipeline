/** Ad canvas presets (width × height). */

export const FRAME_FORMATS = {
  '1:1': { id: '1:1', label: 'Square 1:1 (1080×1080)', width: 1080, height: 1080 },
  '4:5': { id: '4:5', label: 'Portrait 4:5 (1080×1350)', width: 1080, height: 1350 },
  '9:16': { id: '9:16', label: 'Story 9:16 (1080×1920)', width: 1080, height: 1920 },
  '16:9': { id: '16:9', label: 'Landscape 16:9 (1920×1080)', width: 1920, height: 1080 },
}

export function resolveFrameFormat(formatId) {
  const key = formatId && FRAME_FORMATS[formatId] ? formatId : '1:1'
  return FRAME_FORMATS[key]
}

export function safeMarginForFrame(width, height) {
  return Math.round(Math.min(width, height) * 0.059)
}
