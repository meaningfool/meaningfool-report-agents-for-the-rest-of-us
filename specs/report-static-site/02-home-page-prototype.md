# Spec 02: Home Page Prototype

## Goal
Build the home page with real report content — header, section cards for each of the 7 sections with actual titles and summaries. Establish the design system (tokens, reset, shared components) as part of this first page. Use the `frontend-design` skill for design execution.

## Context
- Design reference: `_references/home-page-layout.html`
- Report content source: `meaningfool-writing/_draft/agent-sdk-writeup.md`
- Title: "Agent SDKs for the Rest of Us"
- 7 sections (intro + 5 parts + further reading), not 8 as in the reference
- Attribution: author name + links to meaningfool.net and Twitter (subtle, not prominent)
- Use `dev-browser` skill to verify visual output matches the design intent

## Slices

### Slice 1: Design tokens & base CSS
**Goal**: Extract the shared design system from the references into `site/css/style.css` — custom properties, reset, body defaults, font stacks, shared utility classes (`.mono-label`, `.stack-icon`).

**Test Scenarios**:
1. Opening `site/index.html` in a browser shows the acid-green background with black text, correct fonts applied.

### Slice 2: Header
**Goal**: Report metadata bar at the top — report title, subject area, date, section count. Subtle author attribution with links.

**Test Scenarios**:
1. Header displays "Agent SDKs for the Rest of Us" as the report title
2. Metadata items (date, section count "07") are visible and use mono-label styling
3. Author name is present with links to meaningfool.net and Twitter — visible but not prominent
4. Header has bottom border separating it from the card grid

### Slice 3: Section cards grid
**Goal**: 7 cards using actual section titles and summaries. Responsive grid layout.

**Test Scenarios**:
1. 7 cards are visible, each showing: section number (01–07), title, summary text
2. Grid adapts responsively (multi-col down to 1-col on mobile)
3. Cards have right/bottom borders per the reference
4. Card content matches real report sections:
   - 01: Introduction (the framing, 2x2 mental map — needs a better name)
   - 02: What's an agent, anyway?
   - 03: Where orchestration lives
   - 04: Two tools to rule them all: Bash and the filesystem
   - 05: Agent SDK to Agent Server
   - 06: Architecture by example
   - 07: Further Reading

### Slice 4: Card interactivity
**Goal**: Hover states and links to section pages.

**Test Scenarios**:
1. Hovering a card shows a background tint and reveals the arrow icon
2. Each card links to its corresponding section page
3. Hover transitions are smooth (0.2–0.3s ease)

## Shared Components Impacted
- None (greenfield project)

## Pre-existing Tests Impacted
- None
