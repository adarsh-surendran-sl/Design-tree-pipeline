import React from 'react'
import { Player } from '@remotion/player'
import { DesignTreeFrame } from './DesignTreeFrame.jsx'

export function TemplateLivePreview({ tree, assetsBaseUrl }) {
  if (!tree?.width || !tree?.height) return null
  const w = tree.width
  const h = tree.height

  return (
    <div className="template-live-preview-inner">
      <Player
        component={DesignTreeFrame}
        inputProps={{ tree, assetsBaseUrl }}
        durationInFrames={1}
        fps={30}
        compositionWidth={w}
        compositionHeight={h}
        style={{
          width: '100%',
          maxWidth: '100%',
          height: 'auto',
          aspectRatio: `${w} / ${h}`,
          display: 'block',
        }}
        controls={false}
        loop={false}
        autoPlay={false}
        clickToPlay={false}
      />
    </div>
  )
}
