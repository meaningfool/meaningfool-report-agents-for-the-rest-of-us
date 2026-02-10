# Spec 02: Home Page Prototype

## Goal
Build the home page with real report content — header, section cards for each of the 5 parts with actual titles and summaries from the report. Establish the design system (tokens, reset, shared components) as part of this first page.

## Context
- Design reference: `_references/home-page-layout.html`
- Report content source: `meaningfool-writing/_draft/agent-sdk-writeup.md` (5 parts)
- Title: "Agent SDKs for the Rest of Us"

## Slices

### Slice 1: Design tokens & base CSS
**Goal**: Extract the shared design system from the references into `site/css/style.css` — custom properties, reset, body defaults, font stacks, shared utility classes (`.mono-label`, `.stack-icon`).

**Test Scenarios**:
1. Opening `site/index.html` in a browser shows the acid-green background with black text, correct fonts applied.

### Slice 2: Header
**Goal**: Report metadata bar at the top — report title, author/attribution, date, section count.

**Test Scenarios**:
1. Header displays "Agent SDKs for the Rest of Us" as the report title
2. Metadata items (date, section count) are visible and use mono-label styling
3. Header has bottom border separating it from the card grid

### Slice 3: Section cards grid
**Goal**: 5 cards using actual part titles and summaries from the report. Responsive grid layout.

**Test Scenarios**:
1. 5 cards are visible, each showing: part number (01–05), title, summary text
2. Grid is 4 columns on wide screens, adapts down to 1 column on mobile
3. Cards have right/bottom borders per the reference
4. Card content matches real report parts:
   - 01: What's an agent, anyway?
   - 02: Where orchestration lives
   - 03: Bash and the filesystem
   - 04: Agent SDK to Agent Server
   - 05: Architecture by example

### Slice 4: Card interactivity
**Goal**: Hover states and links to part pages.

**Test Scenarios**:
1. Hovering a card shows a background tint and reveals the arrow icon
2. Each card links to its corresponding part page (`part-1.html` through `part-5.html`)
3. Hover transitions are smooth (0.2–0.3s ease)

## Shared Components Impacted
- None (greenfield project)

## Pre-existing Tests Impacted
- None
