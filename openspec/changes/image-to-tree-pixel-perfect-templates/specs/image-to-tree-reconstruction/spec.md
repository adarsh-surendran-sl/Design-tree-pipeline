## ADDED Requirements

### Requirement: Image ingestion produces a structured design tree

The system SHALL accept a raster ad image and produce a design tree JSON document whose root frame matches the source image width and height, with child nodes representing every visually distinct layer required to reconstruct the ad.

#### Scenario: Standard ad upload

- **WHEN** a user uploads a PNG or JPEG ad image via Image → Tree
- **THEN** the system SHALL output `design_tree_final.json` with `type: frame`, correct `width` and `height`, and a `children[]` array covering background, text, product, and decorative layers

#### Scenario: Layer geometry matches source regions

- **WHEN** reconstruction completes
- **THEN** each node's `x`, `y`, `width`, and `height` SHALL correspond to the source region it represents within ±2 px at native resolution

### Requirement: Reconstruction targets pixel-level fidelity

The system SHALL iteratively refine the design tree until the rendered output is visually indistinguishable from the source image at native resolution, not merely structurally similar.

#### Scenario: Quality loop continues below threshold

- **WHEN** the reconstruction similarity score is below the configured fidelity threshold
- **THEN** the system SHALL run enhancement, compare, and targeted retry passes before marking the job complete

#### Scenario: Job blocked from template-ready without passing fidelity

- **WHEN** a job has not met the fidelity threshold
- **THEN** the system SHALL NOT mark the design tree as `template-ready`

### Requirement: Render strategy is explicit per node

The system SHALL record whether each node is rendered as a parametric primitive or as an embedded image crop, so downstream renderers reproduce the same visual result.

#### Scenario: Complex background uses documented strategy

- **WHEN** a background contains gradients, patterns, or effects that cannot be expressed parametrically
- **THEN** the tree SHALL use `renderStrategy: crop` with an asset in `runs/<jobId>/assets/` OR a supported parametric equivalent that passes fidelity check

#### Scenario: Text uses primitive when font match is confident

- **WHEN** OCR/vision identifies text with matched font family, size, weight, and color
- **THEN** the node SHALL use `renderStrategy: primitive` with text properties that pass regional fidelity diff

### Requirement: Confirmed tree is immutable template baseline

The system SHALL support confirming a reconstructed tree as the canonical template baseline, freezing layer geometry and slot definitions for reuse.

#### Scenario: User confirms template

- **WHEN** a user confirms a reconstruction in the visual editor
- **THEN** the system SHALL write `design_tree_confirmed.json` preserving all layer positions and render strategies from the confirmed state
