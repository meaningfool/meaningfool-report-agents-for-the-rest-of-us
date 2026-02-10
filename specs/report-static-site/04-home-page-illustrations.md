# Spec 04: Home Page Illustrations

## Goal
Create visual elements for each section card on the home page. Each card gets a dark-panel illustration in the `.tech-visual` area. Aim for visuals that are both informative (preview the part's content) and aesthetically reinforcing.

## Context
- Home page built in Spec 02
- Reference: dark SVG panels in `_references/home-page-layout.html` (currently generic path lines)
- Each of the 5 parts has distinct subject matter to draw from

## Slices

### Slice 1: Visual concept per part
**Goal**: Define what each card's illustration represents.

Candidates (to be refined):
- Part 1 (What's an agent): The agentic loop — perceive → think → act
- Part 2 (Where orchestration lives): Spectrum from app-driven to agent-driven
- Part 3 (Bash and the filesystem): Terminal/filesystem primitives
- Part 4 (SDK to Server): Layered architecture (embedded → networked)
- Part 5 (Architecture by example): Four case study snapshots

**Test Scenarios**:
1. Each concept is documented and approved before illustration work begins

### Slice 2: SVG/illustration creation
**Goal**: Build the dark-panel visuals as inline SVGs or lightweight graphics.

**Test Scenarios**:
1. Each illustration renders correctly in the dark panel (dark bg, green-on-dark accent color)
2. Visuals are vector/SVG (sharp at any resolution)
3. Each is visually distinct from the others

### Slice 3: Integration
**Goal**: Drop illustrations into the home page cards.

**Test Scenarios**:
1. Each home page card displays its illustration in the `.tech-visual` area
2. Illustrations don't break card layout or responsiveness
3. Grid overlay effect (from reference CSS `::before`) still applies

## Shared Components Impacted
- `site/index.html` — card markup updated with new SVG content

## Pre-existing Tests Impacted
- None
