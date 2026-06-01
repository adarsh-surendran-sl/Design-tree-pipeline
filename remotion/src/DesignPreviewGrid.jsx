import { Player } from '@remotion/player'
import { DesignTreeFrame } from './DesignTreeFrame.jsx'

function DesignCard({ design, assetsBaseUrl }) {
  const tree = design.tree
  const w = tree?.width ?? 1080
  const h = tree?.height ?? 1080
  const previewUrl = design.previewUrl || ''
  const downloadName = `${(design.name || design.id || 'design').replace(/[^a-z0-9_-]+/gi, '_')}.png`

  return (
    <article className="design-card design-card-lg" data-design-id={design.id}>
      <h4 className="design-card-title">{design.name || design.id}</h4>
      <div className="design-player-wrap design-player-wrap-lg">
        <Player
          component={DesignTreeFrame}
          inputProps={{ tree, assetsBaseUrl }}
          durationInFrames={1}
          fps={30}
          compositionWidth={w}
          compositionHeight={h}
          style={{ width: '100%', aspectRatio: `${w}/${h}` }}
          controls={false}
          loop={false}
          autoPlay={false}
          clickToPlay={false}
        />
      </div>
      <div className="design-card-actions">
        {previewUrl ? (
          <a
            className="btn-link"
            href={previewUrl}
            download={downloadName}
            target="_blank"
            rel="noopener"
          >
            Download PNG
          </a>
        ) : null}
        <button
          type="button"
          className="btn-link"
          data-action="customize-template"
          data-design-id={design.id}
          data-design-name={design.name || design.id}
        >
          Customize template
        </button>
        <button
          type="button"
          className="btn-link"
          data-action="view-tree"
          data-design-id={design.id}
          data-tree-url={design.treeUrl || ''}
          data-design-name={design.name || design.id}
        >
          View design tree
        </button>
      </div>
    </article>
  )
}

export function DesignPreviewGrid({ designs, assetsBaseUrl }) {
  return (
    <div className="design-grid-inner design-grid-inner-lg">
      {designs.map((d) => (
        <DesignCard key={d.id} design={d} assetsBaseUrl={assetsBaseUrl} />
      ))}
    </div>
  )
}
