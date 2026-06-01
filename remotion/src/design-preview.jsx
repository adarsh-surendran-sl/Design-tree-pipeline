import React from 'react'
import { createRoot } from 'react-dom/client'
import { DesignPreviewGrid } from './DesignPreviewGrid.jsx'
import { TemplateLivePreview } from './TemplateLivePreview.jsx'

window.mountDesignPreviews = function mountDesignPreviews(container, designs, assetsBaseUrl) {
  const root = createRoot(container)
  root.render(<DesignPreviewGrid designs={designs} assetsBaseUrl={assetsBaseUrl} />)
}

/** Live template preview in customize modal — call update(tree) on form changes. */
window.mountTemplateLivePreview = function mountTemplateLivePreview(container, tree, assetsBaseUrl) {
  const root = createRoot(container)
  const render = (t, base) => {
    root.render(<TemplateLivePreview tree={t} assetsBaseUrl={base || assetsBaseUrl} />)
  }
  render(tree, assetsBaseUrl)
  return {
    update(nextTree, base) {
      render(nextTree, base)
    },
    unmount() {
      root.unmount()
    },
  }
}

export { DesignTreeFrame } from './DesignTreeFrame.jsx'
export { DesignTreeNode } from './DesignTreeNode.jsx'
export { DesignPreviewGrid } from './DesignPreviewGrid.jsx'
export { TemplateLivePreview } from './TemplateLivePreview.jsx'
