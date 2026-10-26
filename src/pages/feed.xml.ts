import type { APIRoute } from 'astro';
import { news } from '../data/news';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://shapeproject.org');
  const items = news
    .map((p) => {
      const url = new URL(`/news/${p.slug}/`, base).href;
      return `<item><title>${esc(p.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${p.date.toUTCString()}</pubDate>${p.categories.map((c) => `<category>${esc(c.name)}</category>`).join('')}<description>${esc(p.excerpt)}</description></item>`;
    })
    .join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>SHAPE Project</title><link>${base.href}</link><description>Smart City Higher Education Advancement Program in East Africa</description><language>en-US</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
