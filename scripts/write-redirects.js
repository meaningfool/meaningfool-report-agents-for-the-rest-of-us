// Writes dist/_redirects after the Vite build. Cloudflare Workers answers /slug
// and /slug/index.html with a temporary (307) redirect to /slug/; Cloudflare
// Pages, which hosted this site before, sent a permanent 308, which search
// engines treat as a stronger signal. List every page with a 308 instead.
import { readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

const DIST = 'dist';
const lines = ['/index.html / 308'];
for (const entry of readdirSync(DIST).sort()) {
  if (existsSync(join(DIST, entry, 'index.html'))) {
    lines.push(`/${entry} /${entry}/ 308`, `/${entry}/index.html /${entry}/ 308`);
  }
}
writeFileSync(join(DIST, '_redirects'), lines.join('\n') + '\n');
console.log(`Wrote ${lines.length} redirects to dist/_redirects`);
