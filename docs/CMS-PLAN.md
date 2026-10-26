# SHAPE website — Admin CMS plan

Status: **planning** · Owner: Ouma · Last updated: 2026-10-26

The public site (`/`) is a static Astro rebuild of https://shapeproject.org. This plan covers turning
it into a CMS-managed site hosted on our own VPS, with an admin area on a subdomain, and testing it end to end.

---

## 1. Open questions (owner to answer)

Each question has a **default decision** in bold. If no answer is given, we go with the default.

| # | Question | Default decision | Answer |
|---|----------|------------------|--------|
| Q1 | Hosting target? | **Own VPS** (IP, port, SSH key and subdomain are ready). Node app behind Nginx + Let's Encrypt, managed by systemd or PM2. | VPS ✅ |
| Q2 | Which subdomain serves what? | **`shapeproject.org` → public site, `admin.<domain>` → CMS.** One codebase, two hostnames on the same server. | |
| Q3 | Who logs in? | **Role-based: `admin` (everything, users, settings) and `editor` (content only, no users/settings).** First admin is created from the CLI on the server. | |
| Q4 | Database? | **SQLite** (single file, WAL mode, nightly backup). It is enough for a project website; it can move to Postgres later without changing the admin UI. | |
| Q5 | Media storage? | **Local disk on the VPS** (`/var/lib/shape/uploads`), served by Nginx, with automatic resized variants (WebP) on upload. | |
| Q6 | Comments? | **Stored in our own DB with a moderation queue** (pending → approved/spam), honeypot + rate limit, optional email notification. Stops posting to the old WordPress. | |
| Q7 | Contact form? | **Saved to DB + emailed to `shape@mu.edu.so`** via SMTP (credentials needed). Inbox view in admin. | |
| Q8 | Publishing model? | **Server-rendered pages with caching** — saves are live immediately, no rebuild step. | |
| Q9 | Keep the old WordPress running? | **No** — after DNS cut-over, WordPress is archived (DB dump + uploads) and switched off. Old permalinks already redirect. | |
| Q10 | Email/SMTP provider? | **Use existing university mail or Brevo/SES** — needs credentials from owner. | |
| Q11 | Analytics? | **Privacy-friendly (Plausible or Umami self-hosted)**, no cookie banner needed. | |
| Q12 | Backups? | **Nightly SQLite + uploads backup to off-server storage, 30-day retention**, restore tested once. | |

## 2. Architecture (chosen)

- **Framework:** Astro in SSR mode (`@astrojs/node` adapter). The public pages already exist; they switch from importing static data to reading the DB.
- **Admin UI:** Astro pages under the admin host + small islands for forms/editors. Rich text: TipTap. Drag-to-reorder for lists (slides, partners, facts, nav).
- **Data layer:** Drizzle ORM + SQLite (`better-sqlite3`), migrations checked into git.
- **Auth:** Email + password (argon2id hashes), HTTP-only secure session cookie, CSRF tokens on all forms, login rate limiting, optional TOTP 2FA for admins.
- **Media:** Upload → validate type/size → `sharp` resize (thumb/medium/large WebP) → store path + alt text in DB.
- **Deploy:** GitHub → SSH deploy script (pull, `npm ci`, build, migrate, restart). Nginx reverse proxy, HTTPS via certbot.
- **Security baseline:** CSP headers, input validation with Zod, output escaping, sanitised rich text (allow-list), audit log of admin actions, HawkScan DAST run before go-live.

## 3. Content model

| Collection | Fields (main) | Used on |
|------------|---------------|---------|
| Settings | site title, contact phone/email, social links, footer text, EU disclaimer | header, footer, contact |
| Navigation | label, href, parent, order | header menu |
| Hero slides | image, title, text, CTA label/link, order | home |
| Quick facts | number, unit, icon, label, sub, back text, tag, order | home |
| Partners | name, role, country, flag, logo, website, description, order | home, partners, team |
| Team members | name, title, institution (→ partner), photo, bio, WP roles, links, order | project team |
| About sections | intro paragraphs, goal, mission, thematic areas, target groups, impacts | about |
| Work packages | number, title, list title, summary, lead (→ partner), start/end month, colour, icon | deliverables, events (Gantt) |
| Deliverables | code, description, WP (→ WP), due month, status override, file | deliverables, materials |
| Events | title, type, start/end date, location, description, image, link, status | events |
| Materials | title, type, description, file/link, cover, WP, published date | materials |
| Project Book | chapter order, chapter text/images, edition date; "Regenerate PDF" button | project book |
| Posts | title, slug, content (rich text), excerpt, featured image, categories, tags, status (draft/published), publish date, SEO fields | news, archives, feed |
| Categories / Tags | name, slug | archives |
| Comments | post, author, email, url, body, status, IP hash, created | posts, admin queue |
| Messages | name, email, subject, body, read flag | admin inbox |
| Media | file, variants, alt text, caption, size | everywhere |
| Users | name, email, role, password hash, 2FA secret, last login | admin |
| Redirects | from, to, code | old WordPress URLs |

## 4. To-do plan

### Phase 0 — Finish the rebuild ✅ (mostly done)
- [x] Mirror original site, export WordPress REST data (`reference/`, `data/`)
- [x] Rebuild all pages in Astro, matching layout and hover animations
- [x] News posts with galleries, tags, comment form, category/tag/author archives
- [x] Search, 404, RSS feed, sitemap, SEO/OG meta, legacy redirects
- [x] Project Team, Materials and Events pages designed (Gantt timeline, library, team structure)
- [x] Project Book: online A4 reader + PDF export (`npm run export:book`)
- [ ] Commit and push to `Dev-Ouma/shapeproject`

### Phase 1 — Foundations
- [ ] Switch Astro to SSR (`@astrojs/node`), keep public output identical
- [ ] Add Drizzle + SQLite, schema for all collections above, migrations
- [ ] Seed script: import everything currently in `src/data/*.ts` and `data/*.json` into the DB
- [ ] Public pages read from DB (with in-memory cache, invalidated on save)
- [ ] Visual regression check: screenshots before/after must match

### Phase 2 — Auth & admin shell
- [ ] Users table, argon2id, sessions, CSRF, login rate limit
- [ ] `admin`/`editor` roles and permission checks on every route
- [ ] Admin layout: sidebar, dashboard (counts, recent posts, pending comments, unread messages)
- [ ] CLI: `npm run create-admin`

### Phase 3 — Content management
- [ ] Settings, navigation, footer
- [ ] Home: slides, quick facts (reorder, preview)
- [ ] Partners, team members
- [ ] About sections
- [ ] Work packages + deliverables (feeds Deliverables page and Gantt)
- [ ] Events, materials
- [ ] Posts: TipTap editor, galleries, featured image, categories/tags, draft/publish/schedule, slug + SEO fields
- [ ] Media library: upload, resize, alt text, delete-with-usage-check
- [ ] Redirect manager

### Phase 4 — Engagement
- [ ] Comments: submit, moderation queue, approve/spam/delete, email notification
- [ ] Contact form: store + email, admin inbox
- [ ] Audit log viewer

### Phase 5 — Testing
- [ ] Unit tests (Vitest): validation, permissions, slug generation, status calculation
- [ ] Integration tests: API routes against a temp SQLite DB
- [ ] E2E (Playwright): login/logout, wrong password lockout, editor vs admin access, create/edit/delete each content type and see it on the public site, image upload, post draft → publish, comment → approve → visible, contact message → inbox, search, 404, redirects
- [ ] Accessibility checks (axe) on public + admin pages
- [ ] HawkScan DAST on staging; fix all findings

### Phase 6 — Deploy (VPS)
- [ ] Server hardening: non-root deploy user, SSH key only, UFW (22/80/443), fail2ban, unattended upgrades
- [ ] Node LTS, Nginx, certbot for both hostnames
- [ ] systemd/PM2 service, log rotation
- [ ] Deploy script + GitHub Actions (optional)
- [ ] Backups (DB + uploads) and a tested restore
- [ ] DNS cut-over, monitor, archive WordPress

## 5. What the owner needs to provide

- VPS IP, SSH port, SSH key access for a deploy user ✅ (ready)
- Subdomain(s) and DNS access ✅ (ready)
- SMTP credentials for contact/comment emails
- Names and emails of the first admin and editors
- Team member details (names, titles, photos, bios) for the Project Team page
- Real documents for Materials (reports, presentations, brand assets) as they are produced
