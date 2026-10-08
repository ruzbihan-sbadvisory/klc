import type { APIRoute } from 'astro';
import { abs } from '../lib';

export const GET: APIRoute = () =>
  new Response(`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${abs('/sitemap-index.xml')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
