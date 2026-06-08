## Context

**Current state**

- `/image-to-tree` accepts an ad image and runs a multi-stage pipeline: vision LLM segmentation → design tree JSON → Playwright browser render → pixel similarity score → retry/enhance loop.
- `scoreReconstruction` resizes to 256×256 and uses mean absolute error; `RECONSTRUCTION_SCORE_GOOD = 0.82` is treated as "passing" — far from pixel-perfect.
- Remotion components (`DesignTreeFrame`, `DesignTreeNode`) exist for preview grids in Ad Template Studio but are **not** the primary reconstruction validator for Image → Tree jobs.
- Golden tests (`golden/manifest.json`) validate tree heuristics (e.g. sunburst vs flat bg) — not full-image pixel diff at native resolution.
- Confirmed trees (`design_tree_confirmed.json`) can be edited in the visual layer editor but there is no formal **template variable contract** for external mass production.

**Constraints**

- Design tree schema must stay compatible with existing editor, Ad Template Studio, and Remotion preview.
- Reconstruction may still use image crops for irreducible visual complexity (gradients, photo backgrounds, decorative effects) — the tree should record *what* is crop vs *what* is parametric.
- LLM vision is probabilistic; deterministic post-processing and renderer parity matter more than prompt tuning alone.

## Goals / Non-Goals

**Goals:**

- Input ad image → design tree + assets that Remotion renders to an output **visually identical** to the input at native width/height.
- Design tree is a **reusable template**: named slots for product image, headline, price, CTA, logo, etc., with layout positions locked from the source ad.
- Remotion is the **reference renderer** for template validation; any Playwright/HTML path must converge to Remotion output or be retired for production templates.
- Measurable fidelity: full-resolution perceptual + pixel metrics, golden image set, CI gate before a tree is marked `template-ready`.
- Export bundle: `tree.json`, `assets/`, `template.manifest.json` (slots, frame size, renderer version) consumable by other repos.

**Non-Goals:**

- Perfect vector reconstruction of every photographic pixel (acceptable to keep photo regions as cropped assets when parametric recreation is impractical).
- Real-time sub-second reconstruction for arbitrary images (quality over speed for this milestone).
- Building the external mass-production orchestrator inside this repo (only the template contract and validation hooks).
- Ad Template Studio brief-to-concepts flow (separate mode; may *consume* templates produced here).

## Decisions

### 1. Remotion as canonical render target

**Decision:** A design tree is not "done" until Remotion render passes fidelity checks. Playwright remains for dev/compare until Remotion parity is proven, then Playwright diff becomes secondary.

**Rationale:** Mass production in other projects will use Remotion (or a shared render service wrapping the same components). Validating on Playwright alone risks shipping templates that fail downstream.

**Alternatives considered:** Playwright-only (rejected — diverges from production path); dual mandatory pass (accepted for transition period).

### 2. Template = tree + assets + slot manifest

**Decision:** Introduce `template.manifest.json` alongside `design_tree_confirmed.json` declaring:

- `frame`: width, height, background
- `slots`: `{ id, nodeId, type: text|image|group, label, defaultValue }`
- `renderer`: `{ engine: "remotion", version, compositionId }`
- `fidelity`: `{ sourceHash, remotionPngHash, similarityScore, validatedAt }`

**Rationale:** Other projects need to know which nodes to swap without re-parsing the full tree or guessing layer semantics.

### 3. Fidelity measured at native resolution

**Decision:** Replace 256×256 MAE-only scoring with native-resolution comparison (SSIM / perceptual hash + optional per-region diff masks for text vs image layers).

**Rationale:** Downscaling hides font weight, subpixel antialiasing, and gradient banding errors that break "looks exactly like" acceptance.

### 4. Hybrid render strategy preserved but audited

**Decision:** Keep `renderStrategy: crop | primitive | auto` but require an audit pass that documents every crop with bounding box provenance and flags templates that exceed a crop-ratio threshold for human review.

**Rationale:** Some ads cannot be fully parametric; the template must still reproduce exactly even if parts are raster slots.

### 5. Golden set expansion

**Decision:** Extend `golden/` with full source PNGs + expected Remotion output PNGs per case; CI runs Remotion still render and fails below threshold.

**Rationale:** Heuristic tree checks alone do not catch visual regressions.

## Risks / Trade-offs

- **[Risk] Remotion node coverage lags Playwright/HTML** → Mitigation: inventory gap list (shadows, blend modes, custom fonts, CSS backgrounds); implement or force crop per node type.
- **[Risk] "Exactly like input" is expensive for complex ads** → Mitigation: define tiered acceptance (Tier A: parametric text/logo/product swap; Tier B: full static fidelity); ship Tier A first with explicit crop fallbacks.
- **[Risk] Font substitution breaks fidelity** → Mitigation: embed font files in assets or rasterize text layers when match confidence is low (existing `textRasterPromote` path).
- **[Risk] Template schema churn breaks external consumers** → Mitigation: version field in manifest; semver on template contract.

## Migration Plan

1. **Phase 0 — Baseline:** Run Remotion render on all golden trees; record current similarity vs source; publish gap report.
2. **Phase 1 — Renderer parity:** Close Remotion gaps for top failure modes; add native-res scoring to pipeline.
3. **Phase 2 — Template contract:** Emit `template.manifest.json` on confirm; document slot conventions.
4. **Phase 3 — CI gate:** `test:reconstruction-golden` requires Remotion fidelity pass; block `template-ready` flag otherwise.
5. **Phase 4 — External handoff:** Sample integration doc + npm/export path for consuming repos.

Rollback: fidelity gates are additive; lowering thresholds or skipping Remotion check reverts to current behavior via env flag.

## Open Questions

- What similarity threshold constitutes "exactly like" (0.98 SSIM? perceptual hash match? manual sign-off only)?
- Should mass-production slots be LLM-inferred or user-annotated in the visual editor at confirm time?
- Single Remotion composition for all aspect ratios or per-format compositions?
- Publish templates as npm package, S3 bundle, or git submodule?
