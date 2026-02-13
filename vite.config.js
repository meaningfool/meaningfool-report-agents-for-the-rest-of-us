import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, statSync } from 'fs';

// Collect all HTML files in src/ (flat + nested slug dirs) as Vite entry points
function getHtmlInputs() {
  const srcDir = resolve(__dirname, 'src');
  const inputs = {};
  try {
    for (const entry of readdirSync(srcDir)) {
      const full = resolve(srcDir, entry);
      if (entry.endsWith('.html')) {
        // Flat HTML files (index.html)
        const name = entry.replace('.html', '');
        inputs[name] = full;
      } else if (statSync(full).isDirectory()) {
        // Nested slug dirs: {slug}/index.html
        const nested = resolve(full, 'index.html');
        try {
          statSync(nested);
          inputs[entry] = nested;
        } catch {
          // No index.html in this dir, skip
        }
      }
    }
  } catch {
    // src/ may not have HTML files yet (before generate runs)
  }
  return inputs;
}

export default defineConfig({
  root: 'src',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: getHtmlInputs(),
    },
  },
});
