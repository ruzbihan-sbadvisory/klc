import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'node:fs';

// URL laman diambil dari Tetapan Umum (boleh tukar di panel admin)
const site = JSON.parse(readFileSync(new URL('./src/data/site.json', import.meta.url), 'utf8')).siteUrl;

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] }
});
