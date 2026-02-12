# Project: Agent SDKs for the Rest of Us

Static website for a technical report. Vite build, content fetched from GitHub at build time.

## Commands

- `npm run dev` — Generate pages + start Vite dev server (HMR for CSS)
- `npm run build` — Generate pages + production build to `dist/`
- `npm run preview` — Preview the production build locally
- `npm run generate` — Just regenerate HTML pages from markdown (no Vite)

## Skills to use

- **`dev-browser`** (sawyerhood/dev-browser): Use this skill anytime we need to test how pages render in the browser — visual verification, layout checks, responsiveness. Always prefer this over guessing whether something looks right.
- **`frontend-design`** (.claude/skills/frontend-design.md): Use this skill when building or iterating on HTML/CSS/JS for the site. Guides toward distinctive, non-generic design choices.

## Project structure

- `src/css/style.css` — Design system (hand-maintained)
- `src/*.html` — Generated pages (gitignored, rebuilt from markdown + templates)
- `scripts/generate.js` — Fetches markdown from GitHub, converts to HTML, writes pages
- `scripts/sections.js` — Single source of truth for section metadata (titles, summaries, SVGs, markers)
- `scripts/templates/` — HTML templates for index and section pages
- `.cache/` — Cached markdown source (gitignored)
- `dist/` — Build output (gitignored)
- `site/` — Legacy static files (to be removed)
- `_references/` — Design inspiration HTML files (not part of the site)
- `specs/` — Spec-driven development workflow files

## Content source

Markdown is fetched from `meaningfool-writing` repo on GitHub. The URL is configurable via `CONTENT_URL` env var. Default: `_draft/agent-sdk-writeup.md` (may move to `articles/`).

## Report sections

The report has 7 sections total (defined in `scripts/sections.js`):
1. Mapping the Terrain (preamble + 2x2 mental map framing)
2. What's an Agent, Anyway?
3. Where Orchestration Lives
4. Two Tools to Rule Them All
5. Agent SDK to Agent Server
6. Architecture by Example
7. Further Reading

## Writing patterns

### DO
<!-- Add examples of good writing patterns here -->

### DON'T
- Unspecific blanket statements: "Library vs service is the fundamental question."
- Em dashes ("—") for introducing details or examples. Use ":", parentheses, or just "." and a new sentence instead. Apply with discernment — only add the detail if it really adds value, otherwise it makes things heavier.
- "Same X...but different Y" pattern: "Same principle — ephemeral compute, persistent state — but different mechanisms." This hedges instead of saying something concrete.
