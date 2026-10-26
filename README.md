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

## CMS

The site is server-rendered and every page reads from a SQLite database managed at `/admin`.

```sh
npm run dev                         # http://localhost:4321  (DB: var/shape.db, seeded on first run)
BOOTSTRAP_ADMIN_EMAIL=you@example.org BOOTSTRAP_ADMIN_PASSWORD='long-pass-123' npm run dev   # creates the first admin
npm run create-admin -- --email you@example.org --name "Your Name"   # or create/reset an admin from the shell
npm test                            # unit tests (Vitest)
npm run build && npm run test:e2e   # end-to-end browser tests (fresh DB)
```

- Roles: **admin** (everything, users, settings, navigation, redirects) and **editor** (content). Add people from *Users → Invite*.
- Collections are defined in `src/lib/schema.ts`; the admin forms are generated from it.
- Deployment files are in `deploy/` (systemd unit, Nginx site, env template, deploy + backup scripts). Plan: `docs/CMS-PLAN.md`.
