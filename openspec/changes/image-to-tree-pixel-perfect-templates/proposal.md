## Why

The **Image → Design Tree** pipeline exists but is **not complete**. Today it produces approximate reconstructions via Playwright and scores them around 0.72–0.82 similarity — good enough for iteration, not good enough for the product vision.

The **ultimate goal** is to turn any input ad image into a **portable design template** (design tree JSON + assets) that:

1. **Remotion** can render faithfully
2. Produces output that looks **exactly like the input image** (pixel-level fidelity)
3. Can be **reused as a template** in other projects to **mass-produce** variant ads (swap product, copy, prices) without re-running the full reconstruction pipeline

This change captures that north-star so every future implementation decision is measured against template quality, Remotion parity, and mass-production readiness — not just "close enough" previews.

## What Changes

- Define the **end-state requirements** for Image → Design Tree reconstruction fidelity
- Establish **Remotion as the canonical renderer** for validated templates (Playwright remains acceptable for dev/compare loop until parity is proven)
- Specify a **template contract** (schema, assets, slots/variables) so design trees export cleanly into downstream mass-production projects
- Raise the **quality bar** from "passes golden heuristics" to "visually indistinguishable from source at full resolution"
- Document gaps in the current pipeline (vision segmentation, font matching, gradient/pattern backgrounds, crop vs primitive choices, Remotion node coverage)
- Add a phased path: measure → close renderer gaps → lock template format → validate on golden set → enable external consumption

## Capabilities

### New Capabilities

- `image-to-tree-reconstruction`: Ingest a raster ad image and produce a design tree whose structure, layers, typography, and assets faithfully represent the source layout.
- `remotion-fidelity-render`: Render any validated design tree through Remotion (`DesignTreeFrame` / `DesignTreeNode`) with output that matches the source image at full resolution.
- `reusable-design-templates`: Package confirmed design trees as portable templates with defined variable slots so other projects can mass-produce variant images without re-analyzing the source.

### Modified Capabilities

<!-- No existing specs in openspec/specs/ yet -->

## Impact

- **Pipeline**: `src/pipeline.js`, `src/llmAgents.js` (`imageToTree`), `src/reconstructionOrchestrator.js`, `src/reconstructionScore.js`
- **Rendering**: `src/renderDispatch.js`, `remotion/src/DesignTreeFrame.jsx`, `remotion/src/DesignTreeNode.jsx`, Playwright HTML renderer
- **Quality loop**: `src/reconstructionEnhance.js`, golden tests in `golden/`, `npm run test:reconstruction-golden`
- **Template export**: `design_tree_confirmed.json`, `runs/<jobId>/assets/`, layer editor confirm flow
- **Downstream consumers**: Any external project importing design tree JSON + assets for batch rendering via Remotion or shared render API
