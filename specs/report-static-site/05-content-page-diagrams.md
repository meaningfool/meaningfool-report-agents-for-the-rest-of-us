# Spec 05: Content Page Diagrams

## Goal
Create 5 diagrams to replace the `<!-- TODO -->` placeholders in the report markdown. Each diagram illustrates a key concept within a content page.

## Context
- Content pages built in Spec 03, home page illustrations done in Spec 04
- Source markdown lives in `meaningfool-writing` repo; `<!-- TODO -->` comments mark where diagrams go
- Diagrams are generated with `nano-banana-pro` skill, same approach as Spec 04
- Design language: dark background (`#1A1A1A`), acid green (`#DFFF4F`), white/grey labels, mono font, minimal/schematic style
- Content pages have a wider layout than home page cards, so diagrams can be more detailed than the card illustrations
- Generated images go in `src/images/diagrams/`
- The `generate.js` pipeline will need to replace `<!-- TODO -->` comments with `<img>` tags pointing to the diagram files

## Diagram inventory

### D1 — 2x2 Framework Map (Section 1, source line 24)
**Replaces**: `<!-- TODO: insert 2×2 diagram here -->`
**Content**: A 2x2 grid with:
- X-axis: orchestration outside the agent loop (app-driven) ↔ orchestration inside the agent loop (agent-driven)
- Y-axis: agent IN the app (agent-as-a-feature) ↔ agent IS the app (agent-as-a-service)
- Quadrants populated with framework names: LangGraph, PydanticAI, Mastra, Vercel AI SDK (top-left); Claude Agent SDK, Pi SDK (top-right or bottom-right); OpenCode (bottom-right)
**Style**: Clean grid lines, labels on axes, framework names placed in quadrants.

### D2 — Progression Timeline (Section 3, source line 185)
**Replaces**: `<!-- TODO: illustration — progression from single prompt → prompt chain → workflow with tools → agent loop -->`
**Content**: 4 steps as a horizontal timeline or staircase:
1. The Massive Prompt (one big call)
2. The Prompt Chain (sequential steps)
3. The Workflow (steps + tool calling)
4. The General Agent (tools + goal, model decides steps)
**Style**: Horizontal progression, each step as a node or block, arrows between them. Reference: Anthropic's "Building Effective Agents" historical ladder.

### D3 — App-Driven Workflow Graph (Section 3, source line 228)
**Replaces**: `<!-- TODO: illustration — app-driven restaurant workflow graph -->`
**Content**: A directed graph showing a fixed workflow:
START → Parse Request → Search Restaurants → Get Reviews → Check Availability → Format Response → END
**Style**: Boxes as nodes, arrows showing the fixed sequence. Emphasize that the developer defines this flow, the LLM is called within each step.

### D4 — Embedded vs Hosted (Section 5, source line 446)
**Replaces**: `<!-- TODO: illustration — two diagrams side by side -->`
**Content**: Two diagrams side by side:
- Left ("Embedded"): a box representing "Your machine" containing the app (which contains the library). Single boundary.
- Right ("Hosted"): "Your machine" box with the app, connected over a network line (the service boundary) to a "Server" box containing the service.
**Style**: Simple boxes, clear labels, the network connection / service boundary is the key visual element.

### D5 — Onion / Layer Diagram (Section 5, source line 514)
**Replaces**: `<!-- TODO: illustration — concentric circles (onion diagram) -->`
**Content**: Concentric rings from inside out:
1. Agent loop (Claude Agent SDK, py-sdk)
2. Session management
3. Transport (HTTP/WS)
4. Routing
5. Persistence, lifecycle
Label: "What you build with SDK-first". Optionally show OpenCode as a pre-assembled version with all layers included.
**Style**: Concentric circles or rounded rectangles, each ring labeled.

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

### Slice 5: D4 — Embedded vs Hosted
Same workflow for the embedded/hosted diagram in Section 5.
Save to `src/images/diagrams/d4-embedded-vs-hosted.png`.

### Slice 6: D5 — Onion Layer Diagram
Same workflow for the onion diagram in Section 5.
Save to `src/images/diagrams/d5-onion-layers.png`.

## Shared Components Impacted
- `scripts/generate.js` — Add TODO-to-`<img>` replacement step
- `src/css/style.css` — Add `.content-diagram` styling for inline diagrams
- `src/images/diagrams/` — New directory for 5 diagram images

## Pre-existing Tests Impacted
- None
