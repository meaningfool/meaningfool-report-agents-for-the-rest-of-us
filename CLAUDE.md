# Project: Agent Frameworks for the Rest of Us

Static website for a technical report. Vite build, content and images fetched from GitHub at build time. Deployed to Cloudflare Pages.

## Commands

- `npm run dev` — Generate pages + start Vite dev server (HMR for CSS)
- `npm run build` — Generate pages + production build to `dist/`
- `npm run preview` — Preview the production build locally
- `npm run generate` — Just regenerate HTML pages from markdown (no Vite)

## Deployment

- **Hosting**: Cloudflare Pages, project name `agent-frameworks-report`
- **Production URL**: https://agent-frameworks-report.meaningfool.net
- **Pages URL**: https://agent-frameworks-report.pages.dev
- **Deploy**: `npm run build && npx wrangler pages deploy dist --project-name agent-frameworks-report`
- DNS: CNAME `agent-frameworks-report.meaningfool.net` → `agent-frameworks-report.pages.dev` (Cloudflare proxied)

## Skills to use

- **`dev-browser`** (sawyerhood/dev-browser): Use this skill anytime we need to test how pages render in the browser — visual verification, layout checks, responsiveness. Always prefer this over guessing whether something looks right.
- **`frontend-design`** (.claude/skills/frontend-design.md): Use this skill when building or iterating on HTML/CSS/JS for the site. Guides toward distinctive, non-generic design choices.

## Project structure

- `src/css/style.css` — Design system (hand-maintained)
- `src/index.html`, `src/{slug}/index.html` — Generated pages (gitignored, rebuilt from markdown + templates)
- `src/images/card-*.webp` — Homepage card images (committed, optimized WebP)
- `src/images/article/` — Article images fetched at build time (gitignored)
- `src/favicon-*.png`, `src/apple-touch-icon.png` — Favicon files
- `scripts/generate.js` — Fetches markdown + images from GitHub, converts to HTML, writes pages
- `scripts/sections.js` — Section metadata: num, slug, markers, card image paths
- `scripts/templates/` — HTML templates for index and section pages
- `content.yaml` — Site metadata (author, date, subject, social links)
- `.cache/` — Cached markdown and images (gitignored)
- `dist/` — Build output (gitignored)
- `_references/` — Design inspiration HTML files (not part of the site)
- `_original-images/` — Unoptimized source images (gitignored, kept for skill development)
- `specs/` — Spec-driven development workflow files

## Content source

Markdown and images are fetched from `meaningfool-writing` repo on GitHub at build time. Article images are auto-fetched when referenced in markdown (`![alt](../images/X.webp)`) and cached in `.cache/images/`. Adding a new image to the article requires no changes in this repo.

Configurable via env vars:
- `CONTENT_REPO` — default: `meaningfool/meaningfool-writing`
- `CONTENT_PATH` — default: `articles/2026-02-13-agent-frameworks-for-the-rest-of-us.md`

## URL structure

SEO-friendly directory-based slugs. Each section is `/{slug}/` (e.g. `/agent-orchestration/`). Slugs are defined in `scripts/sections.js`.

## Image strategy

- **Card images** (homepage): stored locally as `src/images/card-{slug}.webp`, committed to git. Max 1400px wide, WebP q85.
- **Article images** (content diagrams): fetched from the writing repo at build time into `src/images/article/`. Cached in `.cache/images/`. Not committed.
- **Originals**: preserved in `_original-images/` (gitignored) for skill development.
