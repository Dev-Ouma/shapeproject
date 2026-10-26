# SHAPE Project website

Rebuild of https://shapeproject.org/ (originally WordPress + Elementor) as a static [Astro](https://astro.build) site.

## Structure

- `src/pages/` – routes: home, about, partners, project-team, deliverables, materials, events, contact, news (+ single posts), category/tag/author archives, search, 404, `feed.xml`, `sitemap.xml`. Old WordPress permalinks redirect via `astro.config.mjs`.
- `src/data/site.ts` – all site content (nav, slides, facts, partners, thematic areas, work packages, deliverables)
- `src/data/news.ts` – news posts loaded from the WordPress export in `data/posts.json`
- `src/styles/global.css` – design tokens and styles
- `public/images/` – logos, slider and news images
- `data/` – WordPress REST API export (pages, posts, media, categories)
- `reference/` – static wget mirror of the original site, kept for visual comparison

## Commands

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
npm run preview
```
