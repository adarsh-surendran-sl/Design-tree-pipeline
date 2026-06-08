## 1. Baseline and gap analysis

- [ ] 1.1 Add Remotion still-render script for golden trees (`golden/*/tree.json` → PNG at native resolution)
- [ ] 1.2 Run baseline fidelity report: Remotion vs source for all golden cases + 3 real upload jobs; document per-layer failures
- [ ] 1.3 Inventory Remotion vs Playwright node-type coverage gaps (text, image, cssBackground, shadows, blend modes)

## 2. Native-resolution fidelity scoring

- [ ] 2.1 Add full-resolution similarity scoring alongside existing 256×256 MAE in `src/reconstructionScore.js`
- [ ] 2.2 Define and configure fidelity threshold constant(s) for template-ready gate (env-configurable)
- [ ] 2.3 Wire Remotion render into reconstruction quality loop in `src/reconstructionOrchestrator.js`
- [ ] 2.4 Flag jobs with `remotion-parity-gap` when Playwright passes but Remotion fails

## 3. Remotion renderer parity

- [ ] 3.1 Close top Remotion gaps from gap report (fonts, cssBackground/sunburst, object-fit, z-index)
- [ ] 3.2 Ensure `DesignTreeNode` handles all node types emitted by `imageToTree` without silent omission
- [ ] 3.3 Add regional diff masks (text regions vs image regions) for targeted retry prompts
- [ ] 3.4 Validate font match vs `textRasterPromote` fallback policy against fidelity results

## 4. Image → Tree reconstruction improvements

- [ ] 4.1 Tighten `imageToTree` segmentation prompts and post-audit for geometry accuracy (±2 px target)
- [ ] 4.2 Improve renderStrategy audit: document crop nodes with provenance; threshold for human review
- [ ] 4.3 Extend reconstruction retry loop to use Remotion output as primary compare target
- [ ] 4.4 Block `template-ready` job status until fidelity threshold met

## 5. Template export contract

- [ ] 5.1 Define `template.manifest.json` schema (frame, slots, renderer, fidelity, schemaVersion)
- [ ] 5.2 Emit manifest on visual editor confirm (`POST …/confirm`) alongside `design_tree_confirmed.json`
- [ ] 5.3 Infer default slots (product, headline, CTA, logo, price) from tree node types and labels
- [ ] 5.4 Add slot override API or documented JSON patch format for downstream consumers

## 6. Golden tests and CI

- [ ] 6.1 Add source PNGs to golden cases where missing; store expected Remotion output references
- [ ] 6.2 Extend `npm run test:reconstruction-golden` to run Remotion render + native-res fidelity assert
- [ ] 6.3 Add CI/env flag to skip Remotion gate during transition (`RECONSTRUCTION_REMOTION_GATE=false`)

## 7. External mass-production handoff

- [ ] 7.1 Document template bundle import in README or `docs/TEMPLATE_EXPORT.md`
- [ ] 7.2 Provide minimal external-consumer example: import bundle → override slots → Remotion render batch
- [ ] 7.3 Version `schemaVersion` and document breaking-change policy
