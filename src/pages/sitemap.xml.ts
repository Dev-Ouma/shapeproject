import type { APIRoute } from 'astro';
import { loadSite } from '../lib/content';

export const GET: APIRoute = ({ site }) => {
  const { posts: news, categories } = loadSite();
  const base = site ?? new URL('https://shapeproject.ouk.ac.ke');
  // Tag archives are noindex, so they stay out of the sitemap.
  const latest = news.reduce((d, p) => Math.max(d, p.modified.getTime()), 0);
  const day = (t: number) => (t ? new Date(t).toISOString().slice(0, 10) : undefined);
  const pages: { path: string; lastmod?: string; image?: string }[] = [
    { path: '/', lastmod: day(latest) }, { path: '/about/' }, { path: '/partners/' }, { path: '/project-team/' },
    { path: '/deliverables/' }, { path: '/materials/' }, { path: '/events/' }, { path: '/project-book/' }, { path: '/contact/' },
    { path: '/news/', lastmod: day(latest) },
    ...news.map((p) => ({ path: `/news/${p.slug}/`, lastmod: day(p.modified.getTime()), image: p.image })),
    ...categories.map((c) => ({ path: `/category/${c.slug}/` })),
  ];
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const urls = pages
    .map((p) => `<url><loc>${esc(new URL(p.path, base).href)}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}${p.image ? `<image:image><image:loc>${esc(new URL(p.image, base).href)}</image:loc></image:image>` : ''}</url>`)
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' } },
  );
};
