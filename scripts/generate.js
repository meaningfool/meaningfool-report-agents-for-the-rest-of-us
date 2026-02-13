import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import { sections } from './sections.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const contentYaml = readFileSync(resolve(ROOT, 'content.yaml'), 'utf-8');
const { meta, summaries } = YAML.parse(contentYaml);

// Inject summaries from content.yaml into sections
for (const section of sections) {
  section.summary = summaries[section.num] || '';
}

const SRC = resolve(ROOT, 'src');
const CACHE = resolve(ROOT, '.cache');
const CACHE_FILE = resolve(CACHE, 'source.md');
const TEMPLATES = resolve(__dirname, 'templates');

const DEFAULT_REPO = 'meaningfool/meaningfool-writing';
const DEFAULT_PATH = 'articles/2026-02-13-agent-frameworks-for-the-rest-of-us.md';
const CONTENT_REPO = process.env.CONTENT_REPO || DEFAULT_REPO;
const CONTENT_PATH = process.env.CONTENT_PATH || DEFAULT_PATH;

// ---------------------------------------------------------------------------
// Fetch markdown via GitHub API (with local cache)
// ---------------------------------------------------------------------------
async function fetchMarkdown() {
  mkdirSync(CACHE, { recursive: true });

  const apiUrl = `https://api.github.com/repos/${CONTENT_REPO}/contents/${CONTENT_PATH}`;
  try {
    console.log(`  Fetching ${CONTENT_REPO}/${CONTENT_PATH}`);
    const res = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.raw+json',
        ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const md = await res.text();
    writeFileSync(CACHE_FILE, md);
    console.log('  Cached to .cache/source.md');
    return md;
  } catch (err) {
    if (existsSync(CACHE_FILE)) {
      console.warn(`  Fetch failed (${err.message}), using cached version`);
      return readFileSync(CACHE_FILE, 'utf-8');
    }
    throw new Error(`Fetch failed and no cache exists: ${err.message}`);
  }
}

// ---------------------------------------------------------------------------
// Extract a section from the full markdown
// ---------------------------------------------------------------------------
function extractSection(md, startMarker, endMarker) {
  let start = 0;
  if (startMarker) {
    start = md.indexOf(startMarker);
    if (start === -1) throw new Error(`Start marker not found: ${startMarker}`);
    start = md.indexOf('\n', start) + 1;
  }

  let end = md.length;
  if (endMarker) {
    end = md.indexOf(endMarker, start);
    if (end === -1) throw new Error(`End marker not found: ${endMarker}`);
  }

  return md.slice(start, end).trim();
}

// ---------------------------------------------------------------------------
// Extract section title from the heading line at startMarker
// e.g. "# Part 1 - What's an agent, anyway?" → "What's an agent, anyway?"
// e.g. "## Going further" → "Going further"
// ---------------------------------------------------------------------------
function extractTitle(md, startMarker) {
  if (!startMarker) return null;
  const idx = md.indexOf(startMarker);
  if (idx === -1) return null;
  const lineEnd = md.indexOf('\n', idx);
  const line = md.slice(idx, lineEnd === -1 ? undefined : lineEnd).trim();
  // Strip markdown heading prefix
  const withoutHashes = line.replace(/^#+\s*/, '');
  // Strip "Part N - " or "Part N — " prefix
  const withoutPart = withoutHashes.replace(/^Part\s+\d+\s*[-—–:]\s*/, '');
  return withoutPart;
}

// ---------------------------------------------------------------------------
// Bump heading levels: ## → #, ### → ##, etc.
// ---------------------------------------------------------------------------
function bumpHeadings(md) {
  return md.replace(/^(#{2,6})\s/gm, (match, hashes) => hashes.slice(1) + ' ');
}

// ---------------------------------------------------------------------------
// Fetch article images from the writing repo (with local cache)
// Scans markdown for ![alt](../images/X) references, fetches each image,
// caches in .cache/images/, copies to src/images/, and rewrites paths.
// ---------------------------------------------------------------------------
const IMAGE_CACHE = resolve(CACHE, 'images');
const IMAGE_RE = /!\[([^\]]*)\]\(\.\.\/images\/([^)]+)\)/g;

async function fetchArticleImages(md) {
  mkdirSync(IMAGE_CACHE, { recursive: true });
  mkdirSync(resolve(SRC, 'images', 'article'), { recursive: true });

  const matches = [...md.matchAll(IMAGE_RE)];
  if (matches.length === 0) return;

  // Derive the images/ path relative to the article in the repo
  const articleDir = CONTENT_PATH.split('/').slice(0, -1).join('/');
  const imagesBase = articleDir ? `images` : `images`;
  // The ../images/ in markdown resolves to repo root /images/
  const repoImagesPath = 'images';

  for (const [, , filename] of matches) {
    const cachedPath = resolve(IMAGE_CACHE, filename);
    const destPath = resolve(SRC, 'images', 'article', filename);

    // Skip if already cached
    if (existsSync(cachedPath)) {
      copyFileIfNeeded(cachedPath, destPath);
      continue;
    }

    const apiUrl = `https://api.github.com/repos/${CONTENT_REPO}/contents/${repoImagesPath}/${filename}`;
    try {
      console.log(`  Fetching image: ${filename}`);
      const res = await fetch(apiUrl, {
        headers: {
          Accept: 'application/vnd.github.raw+json',
          ...(process.env.GITHUB_TOKEN ? { Authorization: `token ${process.env.GITHUB_TOKEN}` } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      writeFileSync(cachedPath, buffer);
      copyFileIfNeeded(cachedPath, destPath);
    } catch (err) {
      if (existsSync(cachedPath)) {
        console.warn(`  Fetch failed for ${filename} (${err.message}), using cached version`);
        copyFileIfNeeded(cachedPath, destPath);
      } else {
        console.warn(`  Fetch failed for ${filename} (${err.message}), no cache available`);
      }
    }
  }
}

function copyFileIfNeeded(src, dest) {
  const data = readFileSync(src);
  writeFileSync(dest, data);
}

function replaceDiagrams(md) {
  return md.replace(IMAGE_RE, (match, alt, filename) => {
    return `<figure class="content-diagram"><img src="/images/article/${filename}" alt="${alt}" loading="lazy"></figure>`;
  });
}

// ---------------------------------------------------------------------------
// Build sidebar HTML
// ---------------------------------------------------------------------------
function buildSidebar(activeNum) {
  return sections
    .map((s) => {
      const active = s.num === activeNum ? ' active' : '';
      const pad = String(s.num).padStart(2, '0');
      return `            <a href="/${s.slug}/" class="nav-item${active}">
                <span class="nav-num">${pad}</span>
                <span class="nav-title">${s.title}</span>
            </a>`;
    })
    .join('\n');
}

// ---------------------------------------------------------------------------
// Build a single card for the home page
// ---------------------------------------------------------------------------
function buildCard(section) {
  const pad = String(section.num).padStart(2, '0');
  return `
        <a href="/${section.slug}/" class="section-card">
            <div class="card-header">
                <span class="section-index" style="view-transition-name: section-${pad}-num">${pad}</span>
                <svg class="icon arrow-link" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7V17"></path></svg>
            </div>
            <div class="card-content">
                <h2 style="view-transition-name: section-${pad}-title">${section.title}</h2>
                <p class="summary">${section.summary}</p>
            </div>
            <div class="tech-visual">
                ${section.image
                  ? `<img class="tech-visual__img" src="/${section.image}" alt="${section.title}">`
                  : `<svg class="path-svg" viewBox="0 0 100 60" preserveAspectRatio="none">
                    ${section.svg}
                </svg>`}
            </div>
        </a>`;
}

// ---------------------------------------------------------------------------
// Generate all pages
// ---------------------------------------------------------------------------
async function main() {
  console.log('\nGenerating pages...\n');

  const md = await fetchMarkdown();
  mkdirSync(SRC, { recursive: true });

  // Fetch any images referenced in the article
  await fetchArticleImages(md);

  const sectionTemplate = readFileSync(resolve(TEMPLATES, 'section.html'), 'utf-8');
  const indexTemplate = readFileSync(resolve(TEMPLATES, 'index.html'), 'utf-8');
  const sectionCount = String(sections.length).padStart(2, '0');

  // Build slug → section number map for view transition scripts
  const SLUG_MAP = {};
  for (const s of sections) SLUG_MAP[s.slug] = s.num;
  const slugMapJson = JSON.stringify(SLUG_MAP);

  // --- Section 1 special case: preamble (before Part 1) ---
  // Find the first top-level heading (# ...) to skip frontmatter/title
  const titleMatch = md.match(/^# .+$/m);
  const preambleStart = md.indexOf('\n', titleMatch.index) + 1;
  const preambleMd = md.slice(preambleStart, md.indexOf('# Part 1')).trim();

  // --- Extract titles from markdown headings ---
  for (const section of sections) {
    if (section.num === 1) {
      // Section 1 title comes from the first ## heading in the preamble
      const match = preambleMd.match(/^##\s+(.+)$/m);
      if (match) section.title = match[1];
    } else {
      const extracted = extractTitle(md, section.startMarker);
      if (extracted) section.title = extracted;
    }
  }

  // --- Generate section pages ---
  for (const section of sections) {
    let sectionMd;
    if (section.num === 1) {
      sectionMd = preambleMd;
    } else {
      sectionMd = extractSection(md, section.startMarker, section.endMarker);
    }

    // Remove horizontal rule separators between parts
    sectionMd = sectionMd.replace(/^---\s*$/gm, '');

    // Bump heading levels: h2→h1, h3→h2, etc.
    sectionMd = bumpHeadings(sectionMd);

    // Replace diagram image references with <figure> tags
    sectionMd = replaceDiagrams(sectionMd);

    const bodyHtml = marked.parse(sectionMd, { breaks: true });
    const pad = String(section.num).padStart(2, '0');

    const page = sectionTemplate
      .replaceAll('{{TITLE}}', section.title)
      .replaceAll('{{NUM}}', pad)
      .replaceAll('{{META_TITLE}}', meta.title)
      .replace('{{META_SUBJECT}}', meta.subject)
      .replace('{{META_DATE}}', meta.date)
      .replace('{{META_SECTION_COUNT}}', sectionCount)
      .replace('{{SECTION_IDX}}', String(section.num))
      .replace('{{SLUG_MAP}}', slugMapJson)
      .replace('{{SIDEBAR}}', buildSidebar(section.num))
      .replace('{{CONTENT}}', bodyHtml);

    const outDir = resolve(SRC, section.slug);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, 'index.html'), page);
    console.log(`  \u2713 ${section.slug}/index.html \u2014 ${section.title}`);
  }

  // --- Generate home page ---
  const cards = sections.map(buildCard).join('\n');
  const indexPage = indexTemplate
    .replace('{{CARDS}}', cards)
    .replaceAll('{{META_TITLE}}', meta.title)
    .replace('{{META_AUTHOR}}', meta.author)
    .replace('{{META_SITE}}', meta.site)
    .replace('{{META_SITE_URL}}', meta.siteUrl)
    .replace('{{META_TWITTER}}', meta.twitter)
    .replace('{{META_TWITTER_URL}}', meta.twitterUrl)
    .replace('{{META_SUBJECT}}', meta.subject)
    .replace('{{META_DATE}}', meta.date)
    .replace('{{META_SECTION_COUNT}}', sectionCount)
    .replace('{{SLUG_MAP}}', slugMapJson);
  writeFileSync(resolve(SRC, 'index.html'), indexPage);
  console.log('  \u2713 index.html');

  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
