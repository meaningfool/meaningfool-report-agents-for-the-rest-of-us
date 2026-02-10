import { marked } from 'marked';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sections } from './sections.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SRC = resolve(ROOT, 'src');
const CACHE = resolve(ROOT, '.cache');
const CACHE_FILE = resolve(CACHE, 'source.md');
const TEMPLATES = resolve(__dirname, 'templates');

const DEFAULT_URL =
  'https://raw.githubusercontent.com/meaningfool/meaningfool-writing/main/_draft/agent-sdk-writeup.md';
const CONTENT_URL = process.env.CONTENT_URL || DEFAULT_URL;

// ---------------------------------------------------------------------------
// Fetch markdown (with local cache)
// ---------------------------------------------------------------------------
async function fetchMarkdown() {
  mkdirSync(CACHE, { recursive: true });

  try {
    console.log(`  Fetching ${CONTENT_URL}`);
    const res = await fetch(CONTENT_URL);
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
                <svg class="path-svg" viewBox="0 0 100 60" preserveAspectRatio="none">
                    ${section.svg}
                </svg>
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

  // --- Section 1 special case: preamble (before Part 1) ---
  const preambleStart = md.indexOf('\n', md.indexOf('# Agent Frameworks')) + 1;
  const preambleMd = md.slice(preambleStart, md.indexOf('# Part 1')).trim();

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

    const bodyHtml = marked.parse(sectionMd, { breaks: true });
    const pad = String(section.num).padStart(2, '0');

    const page = sectionTemplate
      .replaceAll('{{TITLE}}', section.title)
      .replaceAll('{{NUM}}', pad)
      .replace('{{SIDEBAR}}', buildSidebar(section.num))
      .replace('{{CONTENT}}', bodyHtml);

    const outPath = resolve(SRC, `section-${section.num}.html`);
    writeFileSync(outPath, page);
    console.log(`  \u2713 section-${section.num}.html \u2014 ${section.title}`);
  }

  // --- Generate home page ---
  const cards = sections.map(buildCard).join('\n');
  const indexPage = indexTemplate.replace('{{CARDS}}', cards);
  writeFileSync(resolve(SRC, 'index.html'), indexPage);
  console.log('  \u2713 index.html');

  console.log('\nDone.\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
