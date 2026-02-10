# Initial Plan: Report Static Site

## Goal
Prototype a static website for the "Agent SDKs for the Rest of Us" technical report. Start from the actual report content and the design references, iterate on the HTML/CSS directly. Build pipeline and deployment decisions come later, once we know what we're building.

## Context
See [research.md](./research.md) for full background.

The report is a 5-part technical analysis (~12-14k words) with code blocks, comparison tables, and planned diagrams. Three HTML reference files define the visual language: acid-green brutalist aesthetic, grid home page, sidebar content pages.

---

## Spec Breakdown

### Spec 02: Home Page Prototype
**Goal**: Build the home page with real report content — header, section cards for each of the 7 sections with actual titles and summaries. Use `frontend-design` skill for design, `dev-browser` for visual testing.

**Slices**:
1. **Design tokens & base CSS** — Extract shared CSS from references (custom properties, reset, fonts, `.mono-label`, `.stack-icon`)
2. **Header** — Report metadata bar (title, subject, date, section count) + subtle author attribution (name + links to meaningfool.net and Twitter)
3. **Section cards grid** — 7 cards (intro + 5 parts + further reading) using actual titles/summaries, responsive grid
4. **Card interactivity** — Hover states, arrow reveals, links to section pages

**Testable outcome**: `site/index.html` opens in a browser showing a styled home page with 7 section cards. Responsive layout works.

**Note**: Card visuals (the dark SVG panels) are placeholder for now — addressed in Spec 04.

---

### Spec 03: Content Page Prototype
**Goal**: Build one content page with actual report text, fully styled. This becomes the template for all sections. Use `frontend-design` skill for design, `dev-browser` for visual testing.

**Slices**:
1. **Page shell** — Sidebar + main content area layout, top metadata bar
2. **Sidebar navigation** — Numbered list of all 7 sections, active state for current section
3. **Content — prose typography** — Render actual text with proper heading hierarchy, paragraphs, bold/italic, blockquotes
4. **Content — code blocks** — Dark-background code blocks with syntax highlighting
5. **Content — tables** — Style the comparison tables from the report
6. **Content — lists & misc** — Ordered/unordered lists, horizontal rules, inline code
7. **Remaining sections** — Apply the same template to all sections

**Testable outcome**: Each section page shows full content with sidebar nav, all typography elements properly styled. Clicking sidebar links navigates between sections.

---

### Spec 04: Home Page Illustrations
**Goal**: Create visual elements for each section card on the home page — either informative diagrams that preview the part's content, or decorative illustrations that reinforce the aesthetic. Ideally both.

**Slices**:
1. **Visual concept per part** — Decide what each card's illustration represents (e.g., Part 1: agentic loop, Part 2: orchestration spectrum, etc.)
2. **SVG/illustration creation** — Build the dark-panel visuals for each card
3. **Integration** — Drop illustrations into the home page cards

**Testable outcome**: Each home page card has a distinct visual in the dark panel area that relates to its part's subject matter.

---

### Spec 05: Content Page Diagrams
**Goal**: Create diagrams that illustrate concepts within the report content pages. The markdown has TODO placeholders for: a 2x2 framework map, a progression timeline, an onion diagram, and flow diagrams.

**Slices**: TBD — depends on how the content settles. We'll define these once we've prototyped the content pages and can see where diagrams are needed.

**Testable outcome**: Key concepts in the report are illustrated with clear diagrams embedded in the content pages.

---

### Spec 06: Build Pipeline & Deployment
**Goal**: Automate the build (however content ends up being sourced) and deploy to Cloudflare Pages.

**Slices**: TBD — depends on decisions made during prototyping about content sourcing, templating, and domain.

---

## Implementation Order
```
02-home-page  →  03-content-pages  →  04-home-illustrations  →  05-content-diagrams  →  06-build-deploy
```

Prototyping first (02, 03), visuals second (04, 05), infrastructure last (06). Each spec informs the next — what we learn building the home page shapes the content pages, and both shape what illustrations and diagrams are needed.

## Open Questions
- **Domain**: Subdomain (`report.meaningfool.net`) vs. standalone domain — parked for now
- **Content sourcing**: During prototyping, we'll work with the content directly in HTML. The question of whether/how to pull from the markdown file in `meaningfool-writing` is deferred to Spec 06
- **Intro section name**: "Introduction" is too generic — needs a name that reflects the 2x2 mental map framing
- **Further Reading**: Shape TBD as the report finalizes — not a traditional bibliography

## Resolved Decisions
- **Report title**: "Agent SDKs for the Rest of Us" (lowercase 's', plural)
- **Sections**: 7 total — intro, 5 content parts, further reading
- **Attribution**: Author name (subtle) + links to meaningfool.net and Twitter. No separate "back to site" link.
- **Intro/preamble**: Gets its own section (not on the home page) — the 2x2 mental map is too complex for just the home page
- **Author bio**: Not displayed, just name + links
- **Tools**: Use `frontend-design` skill for design work, `dev-browser` skill for browser testing
