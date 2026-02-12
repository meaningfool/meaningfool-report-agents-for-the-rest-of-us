# Spec 05: Content Page Diagrams

## Goal
Create 4 diagrams to replace the `<!-- TODO -->` placeholders in the report markdown. Each diagram illustrates a key concept within a content page.

## Context
- Content pages built in Spec 03, home page illustrations done in Spec 04
- Source markdown lives in `meaningfool-writing` repo; `<!-- TODO -->` comments mark where diagrams go
- Diagrams are generated with `nano-banana-pro` skill, same approach as Spec 04
- Design language: dark background (`#1A1A1A`), acid green (`#DFFF4F`), white/grey labels, mono font, minimal/schematic style
- Content pages have a wider layout than home page cards, so diagrams can be more detailed than the card illustrations
- Generated images go in `src/images/diagrams/`
- The `generate.js` pipeline will need to replace `<!-- TODO -->` comments with `<img>` tags pointing to the diagram files

## Design language
- Dark background (`#1A1A1A`), acid green (`#DFFF4F`), white/grey labels
- Hand-drawn aesthetic: use Excalidraw-style Virgil font (open source, OFL-1.1) for text
- Jittery/hand-drawn lines (consistent with the existing home page illustrations)
- Sketch input images provided for D1, D2, D4; D3 from written instructions

## Diagram inventory

### D1 — 2x2 Framework Map (Section 1, source line 24)
**Replaces**: `<!-- TODO: insert 2×2 diagram here -->`
**Sketch**: `src/images/diagrams/d1-framework-map/sketch.png`
**Content**: 4 quadrants formed by two axes. Three quadrants labeled: "AGENT SERVER" (top-left), "AGENT SDK" (bottom-left), "ORCHESTRATION FRAMEWORKS" (bottom-right). Top-right quadrant left empty or subtle.
**Variations to try**:
- With and without rounded-rectangle cards in each quadrant
- Jittery hand-drawn axes (matching existing site style) vs clean arrow axes
- Virgil / Excalidraw-style hand-drawn lettering for labels
**Files**: `src/images/diagrams/d1-framework-map/attempt-{1,2,3}.png`

### D2 — Progression Timeline (Section 3, source line 185)
**Replaces**: `<!-- TODO: illustration — progression from single prompt → prompt chain → workflow with tools → agent loop -->`
**Sketch**: `src/images/diagrams/d2-progression-timeline/sketch.png`
**Content**: 4 cards numbered 1–4, arranged clockwise:
1. A long prompt (tall text block)
2. A prompt chain / workflow (sequential boxes connected by arrows)
3. A workflow of loops (reuse the jittery circle motif from the site for the loops)
4. A single agent loop (one jittery circle)
**Files**: `src/images/diagrams/d2-progression-timeline/attempt-{1,2,3}.png`

### D3 — App-Driven Workflow Graph (Section 3, source line 228)
**Replaces**: `<!-- TODO: illustration — app-driven restaurant workflow graph -->`
**No sketch** — built from instructions.
**Content**: Left-to-right mermaid-style flow graph:
START → Parse Request → Search Restaurants → [branch: Get Reviews ‖ Check Availability] → Format Response → END
The branch after "Search Restaurants" splits into two parallel paths (reviews + availability) that rejoin at "Format Response".
**Style**: Boxes as nodes, arrows for flow, parallel paths shown as a fork/join.
**Files**: `src/images/diagrams/d3-workflow-graph/attempt-{1,2,3}.png`

### D4 — Onion / Layer Diagram (Section 5, source line 512)
**Replaces**: `<!-- TODO: illustration — concentric circles (onion diagram) -->`
**Sketch**: `src/images/diagrams/d4-onion-layers/sketch.png`
**Content**: Orbital / concentric diagram. The SDK sits at the left/bottom of the image. Concentric arcs/circles radiate outward, each labeled with a layer: TRANSPORT, ROUTING, PERSISTENCE, LIFECYCLE. At the opposite end (top-right), a visual cue indicates the full stack is now an "AGENT SERVER".
**Files**: `src/images/diagrams/d4-onion-layers/attempt-{1,2,3}.png`

## Slices

### Slice 1: Pipeline support for inline diagrams
**Goal**: Make `generate.js` replace `<!-- TODO ... -->` comments with `<img>` tags so diagrams render in content pages.

**Steps**:
1. Define a mapping from TODO comment patterns to image file paths.
2. Add a post-processing step in `generate.js` (after `extractSection`, before `marked.parse`) that replaces each TODO comment with an `<img>` tag.
3. Add CSS for content-page diagrams (max-width, centering, optional caption styling).
4. Verify with a placeholder image that the pipeline works end-to-end.

### Slice 2: D1 — 2x2 Framework Map
**Goal**: Generate and integrate the 2x2 diagram for Section 1.

**Steps**:
1. Draft prompt for `nano-banana-pro`.
2. Generate, review, iterate.
3. Save final image to `src/images/diagrams/d1-framework-map.png`.
4. Wire up the TODO replacement in `generate.js`.
5. Verify rendering with `dev-browser`.

### Slice 3: D2 — Progression Timeline
Same workflow as Slice 2 for the timeline diagram in Section 3.
Save to `src/images/diagrams/d2-progression-timeline.png`.

### Slice 4: D3 — App-Driven Workflow Graph
Same workflow for the workflow graph in Section 3.
Save to `src/images/diagrams/d3-workflow-graph.png`.

### Slice 5: D4 — Onion Layer Diagram
Same workflow for the onion diagram in Section 5.
Save to `src/images/diagrams/d4-onion-layers.png`.

## Shared Components Impacted
- `scripts/generate.js` — Add TODO-to-`<img>` replacement step
- `src/css/style.css` — Add `.content-diagram` styling for inline diagrams
- `src/images/diagrams/` — New directory for 4 diagram images

## Pre-existing Tests Impacted
- None
