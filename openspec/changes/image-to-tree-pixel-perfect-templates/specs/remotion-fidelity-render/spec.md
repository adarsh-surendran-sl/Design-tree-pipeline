## ADDED Requirements

### Requirement: Remotion renders any validated design tree

The system SHALL render design tree JSON through Remotion (`DesignTreeFrame` and `DesignTreeNode`) to produce a PNG at the tree's native width and height.

#### Scenario: Golden tree renders without error

- **WHEN** a design tree from the golden set is passed to the Remotion still render path
- **THEN** Remotion SHALL produce a PNG with no missing layers and no uncaught render errors

#### Scenario: Asset URLs resolve in Remotion

- **WHEN** tree nodes reference assets under `runs/<jobId>/assets/`
- **THEN** Remotion render SHALL resolve those assets via `assetsBaseUrl` and display them at the correct position and size

### Requirement: Remotion output matches source image

The system SHALL treat Remotion render output as the authoritative fidelity check for Image → Tree templates. The Remotion PNG SHALL match the original input image within the configured similarity threshold at full resolution.

#### Scenario: Native resolution comparison

- **WHEN** fidelity validation runs on a completed reconstruction job
- **THEN** the system SHALL compare the Remotion render to the source image at native width/height (not downscaled-only)

#### Scenario: Remotion and Playwright divergence is flagged

- **WHEN** Playwright render passes but Remotion render fails fidelity check
- **THEN** the system SHALL flag the job as `remotion-parity-gap` and block template-ready status

### Requirement: Remotion supports all node types needed for ad reconstruction

The system SHALL implement or explicitly crop-fallback every design tree node type required by reconstructed ads so Remotion output is not a degraded subset of Playwright output.

#### Scenario: Text node fidelity

- **WHEN** a tree contains `type: text` nodes
- **THEN** Remotion SHALL render font family, size, weight, color, alignment, and line breaks matching the source within the fidelity threshold

#### Scenario: Image and product nodes

- **WHEN** a tree contains `type: image` nodes with `object-fit` behavior
- **THEN** Remotion SHALL render the image at the specified bounds with the same fit mode as the source ad

#### Scenario: CSS background nodes

- **WHEN** a tree uses `cssBackground` or sunburst presets
- **THEN** Remotion SHALL reproduce the background visually equivalent to the Playwright/HTML renderer or use a crop fallback that passes fidelity check

### Requirement: Remotion render is reproducible for CI

The system SHALL provide a scriptable Remotion still-render entry point usable in golden tests and CI without a browser UI.

#### Scenario: CI golden test

- **WHEN** `npm run test:reconstruction-golden` runs with Remotion fidelity enabled
- **THEN** each golden case SHALL render via Remotion and assert similarity score above the configured threshold
