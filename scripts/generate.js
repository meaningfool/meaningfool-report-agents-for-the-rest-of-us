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
const DEFAULT_PATH = '_draft/agent-sdk-writeup.md';
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
// Build sidebar HTML
// ---------------------------------------------------------------------------
function buildSidebar(activeNum) {
  return sections
    .map((s) => {
      const active = s.num === activeNum ? ' active' : '';
      const pad = String(s.num).padStart(2, '0');
      return `            <a href="section-${s.num}.html" class="nav-item${active}">
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
        <a href="section-${section.num}.html" class="section-card">
            <div class="card-header">
                <span class="section-index">${pad}</span>
                <svg class="icon arrow-link" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7V17"></path></svg>
            </div>
            <div class="card-content">
                <h2>${section.title}</h2>
                <p class="summary">${section.summary}</p>
            </div>
            <div class="tech-visual">
                ${section.image
                  ? `<img class="tech-visual__img" src="${section.image}" alt="${section.title}">`
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

  const sectionTemplate = readFileSync(resolve(TEMPLATES, 'section.html'), 'utf-8');
  const indexTemplate = readFileSync(resolve(TEMPLATES, 'index.html'), 'utf-8');
  const sectionCount = String(sections.length).padStart(2, '0');

  // --- Section 1 special case: preamble (before Part 1) ---
  const preambleStart = md.indexOf('\n', md.indexOf('# Agent SDKs')) + 1;
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

    const bodyHtml = marked.parse(sectionMd, { breaks: true });
    const pad = String(section.num).padStart(2, '0');

    const page = sectionTemplate
      .replaceAll('{{TITLE}}', section.title)
      .replaceAll('{{NUM}}', pad)
      .replaceAll('{{META_TITLE}}', meta.title)
      .replace('{{META_SUBJECT}}', meta.subject)
      .replace('{{META_DATE}}', meta.date)
      .replace('{{META_SECTION_COUNT}}', sectionCount)
      .replace('{{SIDEBAR}}', buildSidebar(section.num))
      .replace('{{CONTENT}}', bodyHtml);

    const outPath = resolve(SRC, `section-${section.num}.html`);
    writeFileSync(outPath, page);
    console.log(`  \u2713 section-${section.num}.html \u2014 ${section.title}`);
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
    .replace('{{META_SECTION_COUNT}}', sectionCount);
  writeFileSync(resolve(SRC, 'index.html'), indexPage);
  console.log('  \u2713 index.html');

  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
