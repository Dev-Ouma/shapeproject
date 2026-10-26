import type { APIRoute } from 'astro';
import { loadSite } from '../lib/content';

export const GET: APIRoute = ({ site }) => {
  const { posts: news, categories } = loadSite();
  const base = site ?? new URL('https://shapeproject.org');
  const tagSlugs = [...new Set(news.flatMap((p) => p.tags.map((t) => t.slug)))];
  const paths = [
    '/', '/about/', '/partners/', '/project-team/', '/deliverables/', '/materials/', '/events/', '/contact/', '/news/',
    ...news.map((p) => `/news/${p.slug}/`),
    ...categories.map((c) => `/category/${c.slug}/`),
    ...tagSlugs.map((s) => `/tag/${s}/`),
  ];
  const urls = paths.map((p) => `<url><loc>${new URL(p, base).href}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
