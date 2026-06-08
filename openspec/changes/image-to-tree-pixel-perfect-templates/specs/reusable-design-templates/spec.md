## ADDED Requirements

### Requirement: Template export bundle

The system SHALL export a portable template bundle containing the confirmed design tree, all referenced assets, and a template manifest describing frame metadata and variable slots.

#### Scenario: Confirm produces export bundle

- **WHEN** a user confirms a reconstruction as a template
- **THEN** the system SHALL write a bundle containing at minimum `design_tree_confirmed.json`, `assets/`, and `template.manifest.json`

#### Scenario: Manifest declares frame and renderer

- **WHEN** `template.manifest.json` is written
- **THEN** it SHALL include frame width/height, renderer engine (`remotion`), renderer version, and fidelity validation metadata (score, timestamp, source hash)

### Requirement: Templates define swappable slots

The system SHALL declare named slots in the template manifest mapping to design tree node IDs, enabling downstream projects to swap content without modifying layout geometry.

#### Scenario: Product image slot

- **WHEN** a template is exported from an ad with a product image layer
- **THEN** the manifest SHALL include a slot of `type: image` bound to that node's `id` with a human-readable label (e.g. `productImage`)

#### Scenario: Text slots for headline and CTA

- **WHEN** a template is exported from an ad with headline and CTA text
- **THEN** the manifest SHALL include `type: text` slots for each, preserving font styling on the bound nodes while allowing value substitution

#### Scenario: Slot swap preserves layout

- **WHEN** a downstream consumer replaces slot values (new product image, new headline text)
- **THEN** the rendered output SHALL keep the same positions, sizes, and z-order as the confirmed template; only slot content changes

### Requirement: Templates are consumable by external projects

The system SHALL document and support a stable import path so other repositories can mass-produce variant images from a template bundle without re-running Image → Tree analysis.

#### Scenario: External Remotion render

- **WHEN** an external project imports `design_tree_confirmed.json`, `assets/`, and `template.manifest.json`
- **THEN** it SHALL be able to render variant ads by supplying slot value overrides and invoking the same Remotion `DesignTreeFrame` component

#### Scenario: Batch generation

- **WHEN** an external project provides an array of slot value sets (e.g. 100 product SKUs)
- **THEN** it SHALL produce one rendered PNG per set using the frozen template geometry without per-variant reconstruction

### Requirement: Template schema is versioned

The system SHALL version the template manifest format so external consumers can detect incompatible bundles.

#### Scenario: Version field present

- **WHEN** any `template.manifest.json` is written
- **THEN** it SHALL include a `schemaVersion` field following semantic versioning

#### Scenario: Breaking schema change

- **WHEN** a breaking change is made to the manifest or tree slot conventions
- **THEN** `schemaVersion` SHALL be incremented major version and documented in the export README
