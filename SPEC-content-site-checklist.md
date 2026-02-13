# Content Mini-Site: Lessons & Reusable Checklist

Distilled from building the "Agent Frameworks for the Rest of Us" report site (Feb 2026, 18 commits over 3 days). The goal: next time I build a content-focused mini website, I have a checklist that Claude can execute mostly autonomously.

---

## What Went Well

- **Spec-first, prototype-second.** First hour was all planning (CLAUDE.md, specs, reference HTML). First visual prototype shipped 26 minutes after that. Specs prevented churn on unclear requirements.
- **Static HTML prototyping before build tools.** Design system was validated in plain HTML/CSS before Vite was added. This kept iteration fast and decisions grounded in real content.
- **Single source of truth for metadata.** `sections.js` + `content.yaml` feed everything: cards, sidebar, page generation. One change propagates everywhere.
- **Content fetched from a separate repo at build time.** Clean separation: writing repo = content, site repo = presentation. No copy-paste drift.
- **Design tokens as CSS custom properties.** Not a framework. Small file, easy to tweak, visually consistent.

## What Went Wrong

- **Image iteration hygiene.** 100+ AI-generated PNGs committed then deleted across 5 cleanup commits. The files are gone from the working tree but permanent in git history (~200MB of dead weight). Should have gitignored iterations from the start.
- **Legacy `site/` directory survived 3 days.** Made obsolete by Vite rewrite on Day 1, removed on Day 3. Dead code lingered because it wasn't hurting anything — until it was confusing.
- **Hardcoded `DIAGRAM_MAP`.** Article images were mapped by hand to local copies. Adding a 5th diagram would have silently broken. Fixed by auto-fetching from the writing repo.
- **No image optimization until Day 3.** 49MB of PNGs served for 2 days before WebP conversion (down to 756KB). Should have been the default from the start.
- **SEO slugs were an afterthought.** Started with `section-1.html`, refactored to `/agent-orchestration/` later. Touching every template, every link, every view transition script.
- **Image tool setup friction.** Every session reinvented image transform code (padding, resize, crop, composition). No reusable tool.

## What Should Be Automated

Things that were manual this time but could be fully automated by an agent:

- **Image optimization**: resize to max-width, convert to WebP, at creation time — not as a late cleanup pass
- **SEO slug generation**: derive from section titles automatically, never use `section-N`
- **Dead file detection**: scan for unreferenced images, unused templates, stale legacy directories
- **Favicon generation**: from a source illustration, generate all sizes + add `<link>` tags
- **Content image pipeline**: auto-fetch any images referenced in the article markdown

---

## Reusable Checklist

### Phase 1: Plan & Design (do this first, write zero code)

- [ ] Collect 3-5 reference designs (screenshots, URLs, HTML files in `_references/`)
- [ ] Define the visual language: palette, typography, shape language, aesthetic rules
- [ ] Define content structure: how many sections, what hierarchy, what metadata
- [ ] Write CLAUDE.md with project conventions, commands, and skill guidance
- [ ] Create specs for each major deliverable (home page, content page, build pipeline)

### Phase 2: Prototype in Static HTML

- [ ] Build home page as a single HTML file with inline CSS
- [ ] Build one content/section page as a single HTML file
- [ ] Establish the full CSS design system: tokens, typography scale, component patterns
- [ ] Test at multiple breakpoints
- [ ] Get visual sign-off before touching build tools

### Phase 3: Content & Metadata Architecture

- [ ] Define a single metadata config (`sections.js`, `content.yaml`, or similar) with:
  - Section titles, summaries, slugs (SEO-friendly from Day 1)
  - Site-level meta (author, date, subject, social links)
  - Image references per section
- [ ] Set up content fetching from the source repo (GitHub API + local cache)
- [ ] Markdown splitting strategy: by heading markers, by frontmatter, or by file
- [ ] Test: fetch, split, convert one section to HTML

### Phase 4: Build Infrastructure

- [ ] Vite (or equivalent) with multi-page HTML support
- [ ] `npm run dev` = generate + dev server with CSS HMR
- [ ] `npm run build` = generate + production build to `dist/`
- [ ] `npm run generate` = just regenerate HTML (no bundler)
- [ ] `.gitignore` from Day 1: `.cache/`, `dist/`, generated HTML, fetched images, iteration files

### Phase 5: Templates & Generation

- [ ] HTML templates with placeholder syntax (`{{TITLE}}`, `{{CONTENT}}`, etc.)
- [ ] `generate.js` that:
  - Fetches markdown + images from source repo
  - Caches both locally (with fallback on fetch failure)
  - Splits content by section markers
  - Processes markdown (heading bump, diagram replacement, etc.)
  - Injects into templates and writes to `src/{slug}/index.html`
- [ ] Home page: generated cards from metadata config
- [ ] Section pages: sidebar nav, metadata bar, rendered content
- [ ] Image references in article markdown auto-fetched — no hardcoded map

### Phase 6: SEO & URLs (do this early, not late)

- [ ] Semantic slugs from Day 1 (`/agent-orchestration/`, never `/section-3.html`)
- [ ] Directory-based routing: `src/{slug}/index.html` → `/{slug}/`
- [ ] Absolute paths for all assets (`/css/style.css`, `/images/...`)
- [ ] Favicon: generate from source illustration, add `<link>` tags to all templates
- [ ] `<title>` tags: `{{Section Title}} -- {{Site Title}}`
- [ ] Consider: meta description, Open Graph tags, canonical URLs

### Phase 7: Images & Assets

- [ ] **Card/homepage images**: stored locally in `src/images/`, committed to git
  - Semantic names: `card-{slug}.webp`
  - Max width: 1400px, WebP quality 85
  - Optimize at creation time, not as a late pass
- [ ] **Content/article images**: fetched from source repo at build time
  - Stored in `src/images/article/` (gitignored)
  - Cached in `.cache/images/`
  - `loading="lazy"` on all content images
- [ ] **AI image generation iterations**: always gitignored
  - Work in a temp directory or `_iterations/`
  - Only move the final version to `src/images/`
  - Name iterations explicitly: `attempt-1.png`, `attempt-2.png`
- [ ] **Image optimization defaults**:
  - WebP for all raster images
  - Max 1400px wide for cards, 2400px for content diagrams
  - If source images come from another repo, optimize at the source

### Phase 8: Navigation & View Transitions

- [ ] Sidebar with numbered sections + active state
- [ ] Home page cards linking to `/{slug}/`
- [ ] View transitions (if supported): morph for card→page, directional slide for section→section
- [ ] Section number + title as view-transition-name targets
- [ ] Back-to-home link in sidebar header

### Phase 9: Polish & Deploy

- [ ] Remove all dead files: legacy directories, unused images, stale configs
- [ ] Verify all links work (home → sections, section → section, sidebar)
- [ ] Verify all images load (homepage cards, content diagrams)
- [ ] Production build: check output sizes, no unexpected large assets
- [ ] Deploy to hosting (Cloudflare Pages, Netlify, GitHub Pages)

---

## File Structure Reference

```
project/
  CLAUDE.md              # Project conventions, commands, skills
  content.yaml           # Site metadata (author, date, social links)
  vite.config.js         # Multi-page Vite config
  package.json
  .gitignore             # dist/, .cache/, generated HTML, article images, iterations
  scripts/
    generate.js          # Fetch content + images, split, convert, write pages
    sections.js          # Section metadata: num, slug, markers, card image
    templates/
      index.html         # Home page template
      section.html       # Section page template
  src/
    css/style.css        # Hand-maintained design system
    images/              # Card images (committed, optimized WebP)
    images/article/      # Fetched article images (gitignored)
    index.html           # Generated home page (gitignored)
    {slug}/index.html    # Generated section pages (gitignored)
  .cache/
    source.md            # Cached article markdown
    images/              # Cached fetched images
  _references/           # Design inspiration files
  _original-images/      # Unoptimized originals (gitignored)
  specs/                 # Spec-driven development docs
  dist/                  # Production build output
```

---

## Key Ratios from This Project

| Metric | Value |
|---|---|
| Specs written before code | 5 |
| Prototype to working site | 2.5 hours |
| Image cleanup commits | 5 of 18 (28%) |
| Image size before optimization | 49 MB |
| Image size after optimization | 756 KB (98.5% reduction) |
| Legacy code survival time | 3 days too long |
| Total build time (production) | ~130ms |
