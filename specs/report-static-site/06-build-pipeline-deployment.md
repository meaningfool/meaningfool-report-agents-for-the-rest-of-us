# Spec 06: Build Pipeline

## Goal
Replace the ad-hoc `build-sections.js` script with a proper Vite-based build that fetches markdown from GitHub, generates all pages (home + sections), and outputs a deployable static site.

## Context

### What exists today
- `build-sections.js` — a Node script that reads `_source.md` (local copy), splits it by markers, converts each part with `marked`, and injects into an HTML template string. Outputs 7 `section-*.html` files.
- `site/index.html` — hand-crafted home page with hardcoded titles, summaries, and SVG illustrations.
- `site/css/style.css` — shared design system (CSS custom properties, responsive breakpoints).
- No dev server, no hot reload, no asset pipeline.

### Decisions
- **Content source**: Fetch from `meaningfool-writing` repo on GitHub at build time (raw URL). The file currently lives at `_draft/agent-sdk-writeup.md` but may move to `articles/`. The URL should be configurable via env var or config.
- **Build generates everything**: Both `index.html` and all `section-*.html` pages are generated. Section metadata (titles, summaries) is defined once and flows into both.
- **Tool stack**: Vite for dev server (HMR), build, and asset pipeline. `marked` for markdown-to-HTML conversion.
- **Deployment**: Undecided for now. The build outputs a static `dist/` directory that can be deployed anywhere (Cloudflare Pages, GitHub Pages, Netlify, etc.).

## Slices

### Slice 1: Vite project setup
**What**: Initialize Vite, move source files into `src/`, configure build to output `dist/`.

- `npm create vite` or manual setup with `vite` as dev dependency
- Move CSS into `src/css/style.css`
- Move static assets (JS, images) into `src/public/` or `src/assets/`
- `vite.config.js` with multi-page HTML setup
- `npm run dev` starts dev server with HMR on CSS
- `npm run build` outputs to `dist/`

**Testable outcome**: `npm run dev` serves the site locally with hot reload on CSS changes. `npm run build` produces a `dist/` folder with all files.

### Slice 2: Content fetch plugin
**What**: Vite plugin (or build script) that fetches the markdown from GitHub and makes it available to the build.

- Fetch from configurable URL (env var `CONTENT_URL` with fallback to current GitHub raw URL)
- Cache the fetched file locally (`.cache/` or `_source.md`) to avoid re-fetching on every rebuild during dev
- Split markdown into sections using the existing marker-based extraction logic
- Convert each section to HTML with `marked` (with `breaks: true`)

**Testable outcome**: The build fetches markdown from GitHub (or uses cache), sections are extracted and converted. Build fails with a clear error if fetch fails and no cache exists.

### Slice 3: Section page generation
**What**: Generate all 7 `section-*.html` pages from an HTML template + the converted markdown content.

- Section metadata (number, title, slug) defined once in a `sections.js` config
- HTML template for section pages (sidebar, top bar, content body) — extracted from the current template string in `build-sections.js`
- Each section page is generated at build time with correct active nav state, section number, and content
- Summaries for each section (used by home page) defined in the same config or extracted from the markdown

**Testable outcome**: `npm run build` generates 7 section HTML files in `dist/`. Each has correct sidebar nav, metadata, and content. Links between pages work.

### Slice 4: Home page generation
**What**: Generate `index.html` from section metadata instead of maintaining it by hand.

- Home page template with header (title, attribution, metadata) and section cards grid
- Cards populated from section config (number, title, summary, link)
- SVG illustrations in cards preserved (either inline in template or in the config)
- Keep the existing CSS grid and card design

**Testable outcome**: `npm run build` generates `index.html` with all 7 section cards. Titles and summaries match the section config. SVGs render. Cards link to the correct section pages.

### Slice 5: Dev experience
**What**: Make the dev workflow smooth.

- `npm run dev` — Vite dev server with HMR for CSS, auto-regeneration when templates change
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview the production build locally
- Clean up: remove old `build-sections.js`, `_source.md` (replaced by cache), update `.gitignore`

**Testable outcome**: Editing CSS triggers hot reload. Changing a template triggers page reload. `npm run build && npm run preview` shows the production site.

## Shared Components Impacted
- `site/css/style.css` → moves to `src/css/style.css`
- `site/index.html` → replaced by generated output
- `site/section-*.html` → replaced by generated output
- `build-sections.js` → replaced by Vite plugin/build logic

## Pre-existing Tests Impacted
- None

## Open Questions
- **Content URL path**: Currently `_draft/agent-sdk-writeup.md`, may become `articles/agent-sdk-writeup.md`. Use env var to make it easy to switch.
- **Deployment target**: Deferred. `dist/` output is deployment-agnostic. A future slice can add GitHub Actions + deploy config when the target is decided.
