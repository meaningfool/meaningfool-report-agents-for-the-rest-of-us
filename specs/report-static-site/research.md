# Research: Report Static Site

## Project Context
- Author publishes a blog at [meaningfool.net](https://meaningfool.net/) using Astro (repo: `meaningfool.github.io`)
- Content lives in a separate repo: `meaningfool-writing` (used as a submodule in the Astro site)
- A technical report "Agent SDK for the Rest of Us" is in progress at `meaningfool-writing/_draft/agent-sdk-writeup.md`
- This repo (`meaningfool-report-agents-for-the-rest-of-us`) is a standalone static site for that report

## Report Structure (from the markdown)
The report is ~12-14k words, organized in 5 parts:
1. **Part 1 — What's an agent, anyway?** — Definitions, LLMs, tools, tool-calling, agentic loop
2. **Part 2 — Where orchestration lives** — App-driven vs agent-driven control, orchestration frameworks vs agent SDKs
3. **Part 3 — Bash and the filesystem** — Why these two tools are critical primitives
4. **Part 4 — Agent SDK to Agent Server** — Embedded libraries vs networked services, server layers
5. **Part 5 — Architecture by example** — Four real-world case studies

Content elements: code blocks (pseudocode, JSON, config), comparison tables (4-5), blockquotes, a bibliography, and TODO placeholders for diagrams (2x2 map, progression timeline, onion diagram, flow diagrams).

## Technology Decision
- **Build approach**: Simple Node build script (~50 lines) with `marked` or `markdown-it`
- **Content source**: Fetch markdown from GitHub raw URL at build time (no submodule)
- **Output**: Static HTML/CSS/JS in `site/` directory
- **Hosting**: Cloudflare Pages pointing at `site/`
- **Rebuild trigger**: Manual initially; optionally add `repository_dispatch` webhook from `meaningfool-writing` later

## Design References (in `_references/`)
Three HTML files define the visual language:

### `home-page-layout.html`
- Acid green background (`#DFFF4F`) with black text
- Header with report metadata (type, subject, date, section count)
- 4-column grid of section cards, each with: section number, title, summary, tech stack pills, dark SVG visual
- Responsive: 4 → 2 → 1 columns
- Hover effects on cards (background tint, arrow reveal)

### `regular-page-layout.html`
- Sidebar (320px) with navigation items (numbered, active state inverts colors)
- Top bar with metadata
- Content area with large section number, title, description, tech stack pills, hero visual
- This is the "landing" view for a section before content

### `style-typography-example-page.html`
- Same sidebar/top-bar layout as regular page
- Shows how rendered markdown should look: h1, h2, h3, p, code, pre, blockquote, ul, ol, hr, strong, em
- Code blocks: dark background (`#1A1A1A`), green-on-dark text, syntax highlighting classes
- Blockquotes: thick left border, slight background tint
- Typography: 18px body, 1.6 line-height, Helvetica Neue / Courier New mono

### Design Tokens
```
--bg-acid: #DFFF4F
--fg-primary: #000000
--bg-dark: #1A1A1A
--fg-on-dark: #DFFF4F
--font-sans: 'Helvetica Neue', Helvetica, Arial, sans-serif
--font-mono: 'Courier New', Courier, monospace
--code-bg: rgba(0,0,0,0.05)
```
