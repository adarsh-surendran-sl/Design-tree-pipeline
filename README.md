# Ad Template Studio & Design Tree Pipeline

**Ad Template Studio (home page):** [docs/AD_TEMPLATE_STUDIO.md](./docs/AD_TEMPLATE_STUDIO.md) · [brief overview](./HOW_IT_WORKS.md)

Standalone JS app with two modes:

- **Ad Template Studio** (main UI at `/`) — product brief → AI agents → multiple ad previews.
- **Image → Design Tree** (`/image-to-tree`) — upload an existing ad → structured layout JSON → render & refine loop.

## Setup

```bash
cd workspace/design_tree_pipeline_js
npm install
npm run setup-browser
```

Create `.env.local`:

```env
ANTHROPIC_API_KEY=your_key
ANTHROPIC_MODEL=claude-sonnet-4-6
```

## Web UI (recommended)

```bash
npm run ui
```

Open **http://localhost:8787** — upload your ad image and click **Run pipeline**.

Progress and renders stream live; outputs are saved under `runs/<jobId>/`.

### Image → Tree reconstruction features

- **CSS backgrounds** (`cssBackground`, sunburst presets) vs **image crop** (user choice when ambiguous)
- **Auto-enhance**: centered headlines (Barlow Condensed), CTA as button, product `object-fit: contain`, narrow-panel removal
- **Segmentation**: heuristic foreground bbox + optional MCP `remove_background` when `PUBLIC_BASE_URL` is set
- **Quality loop**: pixel similarity score, targeted compare retry, layout fine pass
- **UI**: overlay mode, per-layer x/y/w/h nudges, layer reference export (`layers_reference.md` in job folder)
- **Tests**: `npm run test:reconstruction-golden`

## CLI

```bash
node bin/run.js --image "./input/my-ad.png" --out "./runs" --maxLoops 10 --highAccuracy
```

## Outputs per run

| Path | Description |
|------|-------------|
| `runs/<jobId>/original.png` | Uploaded source |
| `runs/<jobId>/assets/*.png` | Cropped regions |
| `runs/<jobId>/render_01.png` | Reconstruction per loop |
| `runs/<jobId>/design_tree_final.json` | Final design tree |
