# Spec 03: Content Page Prototype

## Goal
Build one content page (Part 1) with the actual report text, fully styled. This becomes the template for all other parts. Then replicate for Parts 2–5.

## Context
- Design references: `_references/regular-page-layout.html`, `_references/style-typography-example-page.html`
- Report content: `meaningfool-writing/_draft/agent-sdk-writeup.md`
- Shared CSS established in Spec 02

## Slices

### Slice 1: Page shell
**Goal**: Sidebar + main content area layout, top metadata bar.

**Test Scenarios**:
1. Page has a fixed-width sidebar (320px) on the left, scrollable content area on the right
2. Top bar shows metadata (subject, date)
3. Sidebar and main area fill the viewport height

### Slice 2: Sidebar navigation
**Goal**: Numbered list of all 5 parts with active state highlighting.

**Test Scenarios**:
1. All 5 parts listed with numbers (01–05) and titles
2. Current part has inverted colors (black background, green text)
3. Clicking a sidebar item navigates to that part's page

### Slice 3: Content — prose typography
**Goal**: Render Part 1's actual text with proper heading hierarchy, paragraphs, bold/italic, blockquotes.

**Test Scenarios**:
1. Part 1 content displays with correct heading levels
2. Blockquotes (e.g., Simon Willison's agent definition) styled with thick left border
3. Body text is 18px, 1.6 line-height, readable

### Slice 4: Content — code blocks
**Goal**: Dark-background code blocks with syntax highlighting.

**Test Scenarios**:
1. Code blocks have dark background (`#1A1A1A`) with green-tinted text
2. Inline code has subtle background tint
3. Code blocks are horizontally scrollable if content overflows

### Slice 5: Content — tables
**Goal**: Style the comparison tables from the report.

**Test Scenarios**:
1. Tables are readable and fit within the content width
2. Table styling is consistent with the acid-green aesthetic
3. Tables from the report (framework comparisons, capability matrices) render correctly

### Slice 6: Content — lists & misc
**Goal**: Ordered/unordered lists, horizontal rules, inline code, links.

**Test Scenarios**:
1. Numbered and bulleted lists have proper indentation and spacing
2. Horizontal rules match reference styling
3. Links are distinguishable from body text

### Slice 7: Remaining parts (2–5)
**Goal**: Apply the template to Parts 2–5.

**Test Scenarios**:
1. Each part page (`part-2.html` through `part-5.html`) renders its content correctly
2. Sidebar active state updates per page
3. All content elements (tables, code, blockquotes) render correctly across all parts

## Shared Components Impacted
- `site/css/style.css` — typography styles added here extend the design system from Spec 02

## Pre-existing Tests Impacted
- None
