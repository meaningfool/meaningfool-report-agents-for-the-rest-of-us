import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Collect all HTML files in src/ as Vite entry points
function getHtmlInputs() {
  const srcDir = resolve(__dirname, 'src');
  const inputs = {};
  try {
    for (const file of readdirSync(srcDir)) {
      if (file.endsWith('.html')) {
        const name = file.replace('.html', '');
        inputs[name] = resolve(srcDir, file);
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
