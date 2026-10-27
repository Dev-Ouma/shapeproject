# SHAPE Project website and CMS

The public website and content management system of **SHAPE** (Smart City Higher Education Advancement Program in East Africa), an Erasmus+ Capacity Building in Higher Education project hosted by the Open University of Kenya.

- Live site: <https://shapeproject.ouk.ac.ke>
- CMS: <https://shapeproject.ouk.ac.ke/admin>

The site is an [Astro 5](https://astro.build) server-rendered app. Every page reads its content from a SQLite database that editors manage through the built-in CMS at `/admin`. There is no external CMS, database server or third-party analytics.

## Contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Quick start](#quick-start)
- [Project layout](#project-layout)
- [The CMS](#the-cms)
- [Configuration](#configuration)
- [Testing](#testing)
- [Deployment](#deployment)
- [Security](#security)
- [Operations](#operations)

## Features

**Public website**

- Pages: home (hero slider), about (thematic areas, target groups, impacts), partners, project team, deliverables and work packages, materials, events with an interactive Gantt timeline, news with categories, tags and comments, contact form, site search and an RSS feed.
- **Executive Brief**: a 12-page project brief that reads online and downloads as a PDF.
- OUK brand colours (teal `#037b90`, coral `#ff7f50`), scroll and text animations, page-load progress bar, responsive down to phone width.
- SEO: unique titles and descriptions, canonical URLs, Open Graph and Twitter cards, `robots.txt`, an image sitemap, and schema.org JSON-LD (Organization, WebSite with sitelinks search, BreadcrumbList, NewsArticle, Event).

**CMS (`/admin`)**

- Schema-driven editors for every content type (slides, facts, thematic areas, team, partners, work packages, events, news, settings, navigation, redirects and more), with rich text, a media library and drag-and-drop ordering.
- **Duplicate** any entry, **version history** with field-by-field compare and one-click restore, and a **recycle bin** (30-day retention).
- **Inbox** for contact-form messages (folders, search, star, archive, replies recorded per thread) and comment moderation.
- **Analytics**: cookieless, first-party visit, click, download and search tracking with charts, top pages, sources, devices, content gaps (failed searches, 404s), a weekday × hour heatmap and CSV export.
- **Administration**: system overview, users and invites, full audit trail (filters, diffs, CSV), release notes and "What's new", **maintenance mode** and emergency **lockdown**.
- Sign-in with password plus **two-step verification** (authenticator app TOTP with recovery codes). Roles: **admin** and **editor**.
- Branded account emails (invitation and welcome) sent through SMTP.

## Technology stack

| Layer | Technology |
| --- | --- |
| **Language** | TypeScript (Astro strict config) on **Node.js 24 LTS** in production (Node 22.12 or newer is the minimum Astro supports) |
| **Framework** | **Astro 7** in server-rendered (SSR) mode with the **@astrojs/node 11** standalone adapter — one Node process serves the site, the CMS and the APIs |
| **Frontend** | Astro components rendering semantic HTML; plain CSS with design tokens (custom properties) in `global.css`, `admin.css` and `book.css`; small vanilla TypeScript modules for interactivity — no client framework |
| **Backend** | Astro pages, API routes and middleware (`src/middleware.ts`) for routing, security headers, sign-in and roles; business logic in `src/lib/` |
| **Database** | **SQLite** through Node's built-in `node:sqlite` module (WAL journal, foreign keys, versioned migrations in `src/lib/db.ts`). Content is stored as JSON entries per collection; no ORM |
| **CMS** | Custom, schema-driven (`src/lib/schema.ts`): forms, validation and lists are generated from collection definitions. Rich text with **TipTap 3**; HTML cleaned with **sanitize-html** |
| **Authentication** | scrypt password hashing (Node `crypto`), opaque session tokens stored as SHA-256 hashes, **TOTP** two-step verification (RFC 6238) with recovery codes, QR codes via **qrcode**, invitation links, roles (admin, editor) |
| **Images and media** | **sharp 0.35** (libvips) for resizing, with an **ImageMagick** fallback on servers where sharp cannot run |
| **Email** | **Nodemailer 10** over SMTP (Google Workspace relay `smtp-relay.gmail.com:587`, STARTTLS) with branded HTML templates |
| **PDF** | **Playwright** with headless Chromium renders the Executive Brief to PDF |
| **Analytics** | First-party and cookieless: a small beacon script (`navigator.sendBeacon`) and SQL reports; charts are hand-built SVG with monotone cubic curves (no chart library) |
| **Icons and fonts** | **Lucide** icons (inlined SVG); **Poppins** (headings) and **Inter** (text) from Google Fonts |
| **Web server and hosting** | **Nginx** reverse proxy with **Let's Encrypt** TLS (HSTS), **systemd** service, Ubuntu 22.04 LTS VPS |
| **Testing and quality** | **Vitest** (unit), **Playwright** (end-to-end, real browser), **StackHawk HawkScan** (DAST security scans), `npm audit` |

### UI and UX

- **Design language**: the Open University of Kenya palette — teal `#037b90` as the primary colour, coral `#ff7f50` for calls to action and highlights, on white — with Poppins headings and Inter body text. Chart series use a colour-blind-safe palette (teal, coral, violet) that was checked with a palette validator.
- **Public site**: a faithful rebuild of the original layout with a hero slider, card grids, hover effects on thematic areas and partners, an interactive Gantt timeline with date tooltips, and a print-ready Executive Brief.
- **CMS**: a calm, task-focused admin interface — collapsible sidebar (icons only on desktop, slide-in drawer on phones), dashboards with KPI cards and sparklines, an email-style inbox, and empty states, confirmations and status messages throughout.
- **Responsive and accessible**: works from 390 px phones to wide desktops without horizontal scrolling; semantic landmarks, labelled controls, visible keyboard focus, keyboard-operable charts with table views, and colour never used as the only signal.

### Motion and animation

All motion is CSS transitions and keyframes plus a small vanilla TypeScript module (`src/scripts/motion.ts`) using `IntersectionObserver` — no animation library. Everything is switched off when the visitor's system asks for reduced motion (`prefers-reduced-motion`).

- Headings reveal word by word; cards and sections fade and slide in as they scroll into view, with staggered timing.
- Numbers count up when they appear; the hero image slowly zooms (Ken Burns effect).
- A progress bar runs along the top on every page change and form submission; a short branded loader appears on the first visit.
- Hover effects on cards and links; a pulsing "live" dot in analytics; easing curves such as `cubic-bezier(0.22, 1, 0.36, 1)` for natural movement.

## Quick start

Requirements: **Node.js 24 LTS or newer** (the app uses the built-in `node:sqlite` module) and npm.

```sh
npm install
BOOTSTRAP_ADMIN_EMAIL=you@example.org BOOTSTRAP_ADMIN_PASSWORD='a-long-pass-123' npm run dev
```

Open <http://localhost:4321> for the site and <http://localhost:4321/admin> for the CMS. On first run the database is created at `var/shape.db` and seeded with the project's content. The `BOOTSTRAP_ADMIN_*` variables create the first admin only when no users exist.

You can also create or reset an admin from the shell:

```sh
npm run create-admin -- --email you@example.org --name "Your Name"
```

Two-step verification is required at sign-in by default. Set `REQUIRE_OTP=false` to switch it off for local development only.

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload on port 4321 |
| `npm run build` | Production build into `dist/` |
| `npm start` | Run the production build (`node ./dist/server/entry.mjs`) |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end browser tests (Playwright, needs a fresh `npm run build`) |
| `npm run create-admin` | Create or reset an admin account |
| `npm run export:book` | Render the Executive Brief to PDF with headless Chrome |

## Project layout

```
src/
  pages/             Public routes, /admin pages, /api endpoints, robots.txt, sitemap.xml, feed.xml, healthz
  layouts/           Base.astro (public site) and Admin.astro (CMS shell)
  components/        Site components; components/admin/ holds CMS widgets (forms, charts, diffs, revisions)
  lib/               Server logic
    db.ts              SQLite connection and migrations
    schema.ts          Content collections — the CMS forms are generated from these definitions
    content.ts         Loading, saving, seeding and duplicating content
    auth.ts, otp.ts    Users, sessions, roles, invites, two-step verification
    analytics.ts       Cookieless analytics collection and reports
    system.ts          Maintenance mode, lockdown, request context
    audit.ts, trash.ts Audit trail and recycle bin
    mail.ts, emails.ts SMTP sending and branded email templates
    seo.ts             Structured data and meta helpers
  scripts/           Client-side scripts (motion, analytics beacon, admin charts, editor)
  styles/            global.css (site), admin.css (CMS), book.css (Executive Brief)
  seed/              Initial site content
  middleware.ts      Security headers (CSP), sign-in and role checks, maintenance, lockdown, redirects
public/              Static files (images, downloads, boot scripts)
data/                Source content used to seed the database
tests/unit/          Vitest tests
tests/e2e/           Playwright tests
deploy/              Server setup, deploy, backup, Nginx and systemd files
docs/CMS-PLAN.md     Original CMS plan and decisions
```

## The CMS

- **Content** is stored as JSON entries per collection in SQLite. To add a field or a new content type, edit `src/lib/schema.ts`; the editor form, validation and list views follow from it.
- **Database changes** go in `src/lib/db.ts`: append a new SQL string to `MIGRATIONS` (never edit an existing one). Migrations run automatically when the app starts.
- **Roles**: admins manage everything, including users, settings, navigation, redirects and the Administration area. Editors manage content only.
- **Users** are added by invitation (Administration → Users). The invitee gets a branded email with a single-use link valid for 7 days, then a welcome email once the account exists.
- **Maintenance mode** shows visitors a branded 503 page while signed-in staff keep browsing the live site.
- **Lockdown** signs out every other session, revokes unused invites, blocks editor sign-in and user management, closes the contact and comment forms, and can freeze all CMS edits. Use it during a security incident; lift it from Administration → Maintenance & lockdown.
- **Analytics** stores no cookies, nothing on the visitor's device and no IP addresses. Visitors are counted with a hash salted per day, and old salts are destroyed, so people cannot be identified or followed across days. Signed-in staff and bots are not counted. Events are kept for 400 days.

## Configuration

Settings come from environment variables. In production they live in `/var/www/shapeproject/shared/.env` on the server; `deploy/env.example` is the template.

| Variable | Purpose |
| --- | --- |
| `HOST`, `PORT` | Address the Node server listens on (production: `127.0.0.1:4321` behind Nginx) |
| `SITE_URL` | Public URL, used for canonical links, sitemap and emails |
| `ALLOWED_HOSTS` | Extra host names accepted for form submissions |
| `DB_PATH`, `UPLOAD_DIR` | SQLite file and uploaded media folder |
| `REQUIRE_OTP` | `false` disables two-step verification (development only) |
| `SESSION_IDLE_MINUTES`, `SESSION_ABSOLUTE_HOURS` | Sign out after this much inactivity (default 60 minutes) and after this long in any case (default 12 hours) |
| `BOOTSTRAP_ADMIN_EMAIL`, `_NAME`, `_PASSWORD` | Create the first admin when no users exist |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Outgoing mail. Production uses the Google Workspace relay `smtp-relay.gmail.com:587`, which trusts the server's IP and needs no username or password |
| `SMTP_FROM`, `SMTP_HELO` | Sender (`SHAPE Project <shape@ouk.ac.ke>`) and the name announced to the mail server |
| `NOTIFY_EMAIL` | Where contact-form and comment notifications go |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | Search Console and Bing Webmaster ownership tags |
| `CHROME_PATH` | Chrome or Chromium binary for regenerating the Executive Brief PDF |
| `MAIL_CAPTURE` | Tests only: write outgoing mail to this file instead of sending it |

## Testing

```sh
npm test                           # unit tests
npm run build && npm run test:e2e  # browser tests against the production build
```

The end-to-end suite starts the built server on a fresh database and covers sign-in with two-step verification, content editing, duplicate, revisions, the recycle bin, the inbox, comments, analytics, maintenance mode, lockdown, release notes, invitations and their emails, and the sidebar on desktop and phone.

The app is also scanned with StackHawk HawkScan (`stackhawk.yml`). Set `HAWK_API_KEY` in your shell to run it; never commit the key.

## Deployment

Production runs on an Ubuntu VPS behind Nginx with a Let's Encrypt certificate. The app runs as the `shape` systemd service under the `wabwire` user.

```
/var/www/shapeproject/
  releases/<git-sha>/   one folder per deployed commit
  current -> releases/… the live release
  shared/               .env, shape.db, uploads/ and logs (kept across releases)
  backups/              nightly database and uploads snapshots
```

**Deploy a new version** (after pushing to `main`):

```sh
ssh wabwire@197.136.12.54 'bash /var/www/shapeproject/current/deploy/server-deploy.sh'
```

The script fetches `main` from GitHub, installs and builds in a new release folder, backs up the database, switches `current`, restarts the service and checks `/healthz`. If the new release does not come up, it switches back to the previous one automatically.

**First-time server setup** (once, needs sudo): `deploy/root-setup.sh` installs the systemd unit, the Nginx site, the TLS certificate, ImageMagick and the nightly backup job. On this server port 443 is shared with another service, so HTTPS for this site is routed by host name (see `deploy/share-443.sh`).

## Security

- Strict Content Security Policy: no inline scripts or `<style>` blocks; all client code is bundled. Security headers are set in `src/middleware.ts` and Nginx.
- Passwords are hashed with scrypt; sign-in is rate-limited and locks after repeated failures; two-step verification with replay protection.
- **Sessions**: random 256-bit tokens, stored only as SHA-256 hashes; `HttpOnly`, `Secure` and `SameSite=Lax` cookie. A session ends after **60 minutes without activity** (a countdown warns 5 minutes before, with "Stay signed in") and after **12 hours** in any case. The token is replaced when two-step verification succeeds (no session fixation). Changing a password, role or access signs that person out everywhere. Users can see and end their own sessions under *My account*. Configure with `SESSION_IDLE_MINUTES` and `SESSION_ABSOLUTE_HOURS`.
- Rich text is sanitised, JSON embedded in pages is escaped, links reject `javascript:` URLs, uploads are checked by their file signature, and the CSV exports guard against spreadsheet formulas.
- Same-origin checks on every form post; admin-only areas are enforced on the server.
- Report security issues privately to shape@ouk.ac.ke.

## Operations

- **Backups**: nightly copies of the database and uploads (kept 30 days) under `/var/www/shapeproject/backups`; every deploy also backs up the database first.
- **Health check**: `GET /healthz` returns `{"ok":true,...}`.
- **Logs**: `journalctl -u shape` on the server.
- **Search Console**: the property `https://shapeproject.ouk.ac.ke` is verified; the sitemap is `/sitemap.xml`.

---

SHAPE is co-funded by the Erasmus+ Programme of the European Union. Views and opinions expressed are those of the authors only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA).
