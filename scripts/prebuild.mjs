import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('public/admin', { recursive: true });
copyFileSync('node_modules/@sveltia/cms/dist/sveltia-cms.js', 'public/admin/sveltia-cms.js');
console.log('Sveltia CMS disalin ke public/admin/');
