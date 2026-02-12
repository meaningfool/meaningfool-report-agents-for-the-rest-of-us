# Spec 04: Home Page Illustrations

## Goal
Create AI-generated raster illustrations for each section card on the home page. Each card gets a dark-panel illustration in the `.tech-visual` area. 

**Key Design Principles:**
- **Super-Minimalist/Schematic**: we are creating illustrations for a home page. We need to limit as much as we can the attention required to scan and understand the images. Limit the number of shapes on the canvas. Except if you repeat the same shape. But avoid complex arrangements of various shapes. For example, multiple lines representing an isometric landscape is ok. But representing a schematic landscape with schematic trees, people, buildings, etc. is not.
- **Big Bold Shapes**: Prefer large solid blocks of color over thin lines. No fine details.
- **Low Complexity**: If it looks like a detailed technical diagram, it's too much. It should look like a primitive abstract composition.
- **Strict Palette**: Dark background (`#1A1A1A`), Acid Green (`#DFFF4F`), and potentially white/grey accents.
- **Aspect Ratio**: Configure the generation for a wide aspect ratio (use `16:9` or `21:9` via API parameters) to match the card layout.

## Approach
1. **Read & Analyze**: Extract abstract themes.
2. **Concept Proposal**: Generate 3 directions focusing on **primitive geometry**.
3. **User Review**: **STOP** and present concepts.
4. **Generation**: Use `nano-banana-pro` with `aspectRatio` set to `16:9` (or `21:9`) and keywords like: "abstract bauhaus", "solid geometric primitives", "minimalist flat art", "big bold shapes".
5. **Integration**: Update `sections.js` and verify.

## Context
- Home page built in Spec 02
- Design tokens: dark bg `#1A1A1A`, acid green `#DFFF4F`, 20px grid overlay
- `.tech-visual` panel: 160px height, full card width (approx 300px+), `object-fit: cover`.
- **Effect**: The top ~25% and bottom ~25% of a square image will be cropped out.

## Slices

### Slice 1: Part 1 illustration — "Mapping the Terrain"
**Goal**: Establish the "Concept → Review → Generate" workflow.

**Steps**:
1. Read `section-1.html`.
2. Propose 3 concepts (focus on "Terrain Levels" per user feedback).
3. **STOP** for user selection.
4. Generate the selected illustration using `nano-banana-pro`.
   - **Critical**: Prompt for "wide composition", "panoramic", "horizontally spread elements".
5. Save to `src/images/`.
6. Update `sections.js`.
7. Verify: Check that the image composition survives the crop.

### Slice 2–7: Remaining illustrations
**Goal**: Apply the same workflow to the remaining sections.

**Steps**:
1. Read section content.
2. Propose 3 concepts.
3. **STOP** for user selection.
4. Generate and Integrate.

**Test Scenarios**:
1. Generated image is visually readable at `.tech-visual` panel size (160px height)
2. Image style is coherent with site design language (dark, technical, minimal)
3. Card layout and responsiveness are preserved
4. Grid overlay `::before` effect still works on top of image

### Slice 2–7: Remaining illustrations (one per section)
**Goal**: Apply the validated workflow to sections 2–7.

Each slice follows the same pattern: prompt → generate → iterate → integrate → verify.

Illustration subjects (to be refined per slice):
- Part 2 (What's an Agent): The agentic loop — perceive → think → act
- Part 3 (Where Orchestration Lives): Spectrum from app-driven to agent-driven control flow
- Part 4 (Two Tools to Rule Them All): Terminal/filesystem as universal primitives
- Part 5 (Agent SDK to Agent Server): Layered architecture crossing the service boundary
- Part 6 (Architecture by Example): Four real-world case study snapshots
- Part 7 (Further Reading): Curated knowledge / references

## Shared Components Impacted
- `scripts/sections.js` — Replace `svg` field with `image` field (or update card HTML generation)
- `scripts/generate.js` — Update `buildCard()` to emit `<img>` instead of inline SVG
- `scripts/templates/index.html` — May need minor adjustments
- `src/css/style.css` — `.tech-visual` styling adjusted for `<img>` content
- `src/images/` — New directory for generated illustration assets

## Pre-existing Tests Impacted
- None
