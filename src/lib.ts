import site from './data/site.json';
import home from './data/home.json';
import articlesPage from './data/articles-page.json';
import { getCollection } from 'astro:content';

export { site, home, articlesPage };

export const abs = (path: string) => new URL(path, site.siteUrl).href;

// Gambar: URL penuh (https://...) dikekalkan, laluan /uploads/... dijadikan mutlak
export const img = (src?: string) => (src ? src : '');

export const waLink = (msg: string = site.whatsapp.message) =>
  `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(msg)}`;

export const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);

export const dayMonth = (d: Date) => ({
  day: String(d.getUTCDate()).padStart(2, '0'),
  month: new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' }).format(d)
});

export async function getArticles() {
  const all = await getCollection('artikel', ({ data }) => !data.draft);
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const readingMinutes = (text: string = '') => Math.max(1, Math.round(text.split(/\s+/).length / 200));

// Teks berbilang baris (\n) jadi <br>
export const nl2br = (s: string = '') =>
  s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!).replace(/\n/g, '<br>');

export const socialIcon: Record<string, { icon: string; bg: string }> = {
  facebook: { icon: 'fab fa-facebook-f', bg: '#2563eb' },
  instagram: { icon: 'fab fa-instagram', bg: '#db2777' },
  youtube: { icon: 'fab fa-youtube', bg: '#dc2626' },
  linkedin: { icon: 'fab fa-linkedin-in', bg: '#3b82f6' },
  tiktok: { icon: 'fab fa-tiktok', bg: '#000000' },
  x: { icon: 'fab fa-x-twitter', bg: '#000000' },
  whatsapp: { icon: 'fab fa-whatsapp', bg: '#22c55e' }
};
