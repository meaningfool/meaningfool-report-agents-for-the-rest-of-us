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
- `src/index.html`, `src/{slug}/index.html` — Generated pages (gitignored, rebuilt from markdown + templates)
- `scripts/generate.js` — Fetches markdown + images from GitHub, converts to HTML, writes pages
- `scripts/sections.js` — Single source of truth for section metadata (titles, summaries, SVGs, markers)
- `scripts/templates/` — HTML templates for index and section pages
- `.cache/` — Cached markdown and images (gitignored)
- `dist/` — Build output (gitignored)
- `_references/` — Design inspiration HTML files (not part of the site)
- `_original-images/` — Unoptimized source images (gitignored, kept for skill development)
- `specs/` — Spec-driven development workflow files

## Content source

Markdown and images are fetched from `meaningfool-writing` repo on GitHub at build time. Article images are auto-fetched when referenced in markdown (`![alt](../images/X.webp)`) and cached in `.cache/images/`. Configurable via `CONTENT_REPO` and `CONTENT_PATH` env vars. Default: `articles/2026-02-13-agent-frameworks-for-the-rest-of-us.md`.

