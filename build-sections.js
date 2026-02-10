const { marked } = require('marked');
const fs = require('fs');
const path = require('path');

// Section definitions: number, title, and which part of the markdown they map to
const sections = [
  { num: 1, title: 'Mapping the Terrain',          startMarker: null,       endMarker: '# Part 1' },
  { num: 2, title: "What's an Agent, Anyway?",      startMarker: '# Part 1', endMarker: '# Part 2' },
  { num: 3, title: 'Where Orchestration Lives',     startMarker: '# Part 2', endMarker: '# Part 3' },
  { num: 4, title: 'Two Tools to Rule Them All',    startMarker: '# Part 3', endMarker: '# Part 4' },
  { num: 5, title: 'Agent SDK to Agent Server',     startMarker: '# Part 4', endMarker: '# Part 5' },
  { num: 6, title: 'Architecture by Example',       startMarker: '# Part 5', endMarker: '## Bibliography' },
  { num: 7, title: 'Further Reading',               startMarker: '## Bibliography', endMarker: null },
];

function extractSection(md, startMarker, endMarker) {
  let start = 0;
  if (startMarker) {
    start = md.indexOf(startMarker);
    if (start === -1) { console.error(`Start marker not found: ${startMarker}`); return ''; }
    // Skip past the heading line itself
    start = md.indexOf('\n', start) + 1;
  }

  let end = md.length;
  if (endMarker) {
    end = md.indexOf(endMarker, start);
    if (end === -1) { console.error(`End marker not found: ${endMarker}`); end = md.length; }
  }

  return md.slice(start, end).trim();
}

function buildSidebar(activeNum) {
  return sections.map(s => {
    const active = s.num === activeNum ? ' active' : '';
    const padNum = String(s.num).padStart(2, '0');
    return `            <a href="section-${s.num}.html" class="nav-item${active}">
                <span class="nav-num">${padNum}</span>
                <span class="nav-title">${s.title}</span>
            </a>`;
  }).join('\n');
}

function buildPage(section, bodyHtml) {
  const padNum = String(section.num).padStart(2, '0');
  const escapedTitle = section.title.replace(/'/g, '&rsquo;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapedTitle} — Agent SDKs for the Rest of Us</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body class="content-page">

    <aside class="sidebar">
        <div class="sidebar-header">
            <span class="mono-label sidebar-header__label">Report</span>
            <h1 class="sidebar-header__title"><a href="index.html">Agent SDKs for the Rest of Us</a></h1>
        </div>
        <nav class="sidebar-nav">
${buildSidebar(section.num)}
        </nav>
    </aside>

    <main class="content-main">
        <div class="top-bar">
            <div class="top-bar__meta">
                <div class="meta-item">
                    <span class="mono-label">Subject</span>
                    <span class="meta-item__value">Agent Frameworks</span>
                </div>
                <div class="meta-item">
                    <span class="mono-label">Date</span>
                    <span class="meta-item__value">Feb 2026</span>
                </div>
            </div>
            <div class="meta-item">
                <span class="mono-label">Section</span>
                <span class="meta-item__value">${padNum} / 07</span>
            </div>
        </div>

        <div class="content-body">
            <div class="content-body__section-num">${padNum}</div>
            <h1 class="content-body__title">${escapedTitle}</h1>

${bodyHtml}
        </div>
    </main>

</body>
</html>
`;
}

// --- Main ---
const mdPath = process.argv[2];
if (!mdPath) {
  console.error('Usage: node build-sections.js <path-to-markdown>');
  process.exit(1);
}

const md = fs.readFileSync(mdPath, 'utf-8');
const outDir = path.join(__dirname, 'site');

// For section 1, extract the preamble (everything before Part 1)
// We skip the main title line "# Agent Frameworks for the Rest of Us"
const preambleStart = md.indexOf('\n', md.indexOf('# Agent Frameworks')) + 1;
const preambleMd = md.slice(preambleStart, md.indexOf('# Part 1')).trim();

for (const section of sections) {
  let sectionMd;
  if (section.num === 1) {
    sectionMd = preambleMd;
  } else {
    sectionMd = extractSection(md, section.startMarker, section.endMarker);
  }

  // Remove the horizontal rule separators between parts
  sectionMd = sectionMd.replace(/^---\s*$/gm, '');

  const bodyHtml = marked.parse(sectionMd, { breaks: true });
  const pageHtml = buildPage(section, bodyHtml);
  const outPath = path.join(outDir, `section-${section.num}.html`);
  fs.writeFileSync(outPath, pageHtml);
  console.log(`  ✓ section-${section.num}.html — ${section.title}`);
}

console.log('\nDone. All 7 sections generated.');
