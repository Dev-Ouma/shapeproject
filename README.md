# SHAPE Project website and CMS

The public website and content management system of **SHAPE** (Smart City Higher Education Advancement Program in East Africa), an Erasmus+ Capacity Building in Higher Education project hosted by the Open University of Kenya.

- Live site: <https://shapeproject.ouk.ac.ke>
- CMS: <https://shapeproject.ouk.ac.ke/admin>

The site is an [Astro 5](https://astro.build) server-rendered app. Every page reads its content from a SQLite database that editors manage through the built-in CMS at `/admin`. There is no external CMS, database server or third-party analytics.

## Contents

- [Features](#features)
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

## Quick start

Requirements: **Node.js 24 or newer** (the app uses the built-in `node:sqlite` module) and npm.

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

Settings come from environment variables. In production they live in `~/shapeproject/shared/.env` on the server; `deploy/env.example` is the template.

| Variable | Purpose |
| --- | --- |
| `HOST`, `PORT` | Address the Node server listens on (production: `127.0.0.1:4321` behind Nginx) |
| `SITE_URL` | Public URL, used for canonical links, sitemap and emails |
| `ALLOWED_HOSTS` | Extra host names accepted for form submissions |
| `DB_PATH`, `UPLOAD_DIR` | SQLite file and uploaded media folder |
| `REQUIRE_OTP` | `false` disables two-step verification (development only) |
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
~/shapeproject/
  releases/<git-sha>/   one folder per deployed commit
  current -> releases/… the live release
  shared/               .env, shape.db, uploads/ and logs (kept across releases)
  backups/              nightly database and uploads snapshots
```

**Deploy a new version** (after pushing to `main`):

```sh
ssh wabwire@197.136.12.54 'bash ~/shapeproject/current/deploy/server-deploy.sh'
```

The script fetches `main` from GitHub, installs and builds in a new release folder, backs up the database, switches `current`, restarts the service and checks `/healthz`. If the new release does not come up, it switches back to the previous one automatically.

**First-time server setup** (once, needs sudo): `deploy/root-setup.sh` installs the systemd unit, the Nginx site, the TLS certificate, ImageMagick and the nightly backup job. On this server port 443 is shared with another service, so HTTPS for this site is routed by host name (see `deploy/share-443.sh`).

## Security

- Strict Content Security Policy: no inline scripts or `<style>` blocks; all client code is bundled. Security headers are set in `src/middleware.ts` and Nginx.
- Passwords are hashed with scrypt; session tokens are stored as SHA-256 hashes; sign-in is rate-limited and locks after repeated failures; two-step verification with replay protection.
- Rich text is sanitised, JSON embedded in pages is escaped, links reject `javascript:` URLs, uploads are checked by their file signature, and the CSV exports guard against spreadsheet formulas.
- Same-origin checks on every form post; admin-only areas are enforced on the server.
- Report security issues privately to shape@ouk.ac.ke.

## Operations

- **Backups**: nightly copies of the database and uploads (kept 30 days) under `~/shapeproject/backups`; every deploy also backs up the database first.
- **Health check**: `GET /healthz` returns `{"ok":true,...}`.
- **Logs**: `journalctl -u shape` on the server.
- **Search Console**: the property `https://shapeproject.ouk.ac.ke` is verified; the sitemap is `/sitemap.xml`.

---

SHAPE is co-funded by the Erasmus+ Programme of the European Union. Views and opinions expressed are those of the authors only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA).
