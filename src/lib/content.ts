// Content store: CRUD over the `entries` table plus `loadSite()`, which shapes
// everything the public pages need. Reads are cached in memory and the cache
// is invalidated on every write, so admin saves show up immediately.
import { getDb, tx } from './db';
import { getCollection, slugify, validateFields, type Collection, type Field } from './schema';
import { sanitizeRichText } from './sanitize';
import { projectMonth } from './status';

export type Entry<T = Record<string, any>> = {
  id: number;
  collection: string;
  slug: string | null;
  status: 'published' | 'draft';
  position: number;
  data: T;
  created_at: string;
  updated_at: string;
};

type Row = Omit<Entry, 'data'> & { data: string };
const parse = (r: Row): Entry => ({ ...r, data: JSON.parse(r.data) });

let version = 0;
let cache: { version: number; site: Site } | undefined;
const listeners = new Set<() => void>();
export function invalidate() {
  version++;
  listeners.forEach((fn) => fn());
}
export function onInvalidate(fn: () => void) {
  listeners.add(fn);
}

export function listEntries(collection: string, opts: { includeDrafts?: boolean } = {}): Entry[] {
  ensureSeeded();
  const rows = getDb()
    .prepare(`SELECT * FROM entries WHERE collection = ? ${opts.includeDrafts ? '' : "AND status = 'published'"} ORDER BY position, id`)
    .all(collection) as Row[];
  const entries = rows.map(parse);
  const c = getCollection(collection);
  if (c?.orderBy) {
    const { field, dir } = c.orderBy;
    entries.sort((a, b) => {
      const x = a.data[field], y = b.data[field];
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''));
      return dir === 'asc' ? r : -r;
    });
  }
  return entries;
}

export function getEntry(id: number): Entry | undefined {
  ensureSeeded();
  const r = getDb().prepare('SELECT * FROM entries WHERE id = ?').get(id) as Row | undefined;
  return r ? parse(r) : undefined;
}

export function getSingleton<T = Record<string, any>>(collection: string): Entry<T> | undefined {
  ensureSeeded();
  const r = getDb().prepare('SELECT * FROM entries WHERE collection = ? ORDER BY id LIMIT 1').get(collection) as Row | undefined;
  return r ? (parse(r) as Entry<T>) : undefined;
}

function sanitizeRich(fields: Field[], data: Record<string, any>) {
  for (const f of fields) {
    if (f.type === 'richtext' && typeof data[f.name] === 'string') data[f.name] = sanitizeRichText(data[f.name]);
    if (f.type === 'list' && Array.isArray(data[f.name])) data[f.name].forEach((item: any) => sanitizeRich(f.fields, item));
  }
}

function uniqueSlug(collection: string, base: string, exceptId?: number): string {
  const stmt = getDb().prepare('SELECT id FROM entries WHERE collection = ? AND slug = ? AND id IS NOT ?');
  let slug = base || 'item';
  for (let i = 2; stmt.get(collection, slug, exceptId ?? null); i++) slug = `${base}-${i}`;
  return slug;
}

export type SaveInput = { id?: number; raw: Record<string, unknown>; status?: 'published' | 'draft'; slug?: string; userId?: number };
export type SaveResult = { ok: true; entry: Entry } | { ok: false; errors: Record<string, string> };

export function saveEntry(collectionKey: string, input: SaveInput): SaveResult {
  ensureSeeded();
  const c = getCollection(collectionKey);
  if (!c) return { ok: false, errors: { _: 'Unknown collection' } };
  const v = validateFields(c.fields, input.raw);
  if (!v.ok) return v;
  const data = v.data as Record<string, any>;
  sanitizeRich(c.fields, data);

  const db = getDb();
  const existing = input.id ? getEntry(input.id) : c.kind === 'singleton' ? getSingleton(collectionKey) : undefined;
  if (input.id && (!existing || existing.collection !== collectionKey)) return { ok: false, errors: { _: 'Not found' } };

  let slug: string | null = existing?.slug ?? null;
  if (c.slugFrom) {
    const wanted = slugify(input.slug?.trim() || existing?.slug || String(data[c.slugFrom] ?? ''));
    if (!wanted) return { ok: false, errors: { slug: 'Required' } };
    slug = uniqueSlug(collectionKey, wanted, existing?.id);
  }
  const status = c.drafts ? (input.status ?? existing?.status ?? 'draft') : 'published';

  const id = tx(() => {
    if (existing) {
      db.prepare("UPDATE entries SET data = ?, slug = ?, status = ?, updated_at = datetime('now'), updated_by = ? WHERE id = ?").run(
        JSON.stringify(data), slug, status, input.userId ?? null, existing.id,
      );
      return existing.id;
    }
    const { p } = db.prepare('SELECT COALESCE(MAX(position), -1) + 1 AS p FROM entries WHERE collection = ?').get(collectionKey) as { p: number };
    const r = db
      .prepare('INSERT INTO entries (collection, slug, status, position, data, updated_by) VALUES (?, ?, ?, ?, ?, ?)')
      .run(collectionKey, slug, status, p, JSON.stringify(data), input.userId ?? null);
    return Number(r.lastInsertRowid);
  });
  invalidate();
  return { ok: true, entry: getEntry(id)! };
}

export function deleteEntry(id: number): boolean {
  const r = getDb().prepare('DELETE FROM entries WHERE id = ?').run(id);
  invalidate();
  return r.changes > 0;
}

export function reorder(collection: string, ids: number[]) {
  const stmt = getDb().prepare('UPDATE entries SET position = ? WHERE id = ? AND collection = ?');
  tx(() => ids.forEach((id, i) => stmt.run(i, id, collection)));
  invalidate();
}

export function entryTitle(c: Collection, e: Entry): string {
  if (c.kind === 'singleton') return c.label;
  const v = c.titleField ? e.data[c.titleField] : undefined;
  return String(v || `${c.singular} #${e.id}`);
}

/* ------------------------------------------------------------------ */
/* Seeding                                                             */
/* ------------------------------------------------------------------ */

let seeded = false;
export function ensureSeeded() {
  if (seeded) return;
  const db = getDb();
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM entries').get() as { n: number };
  seeded = true;
  if (n > 0) return;
  // Imported lazily so the seed data is only bundled into the seeding path.
  seedFromStaticData(db);
}

function seedFromStaticData(db: ReturnType<typeof getDb>) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const seed = seedData();
  const insert = db.prepare('INSERT INTO entries (collection, slug, status, position, data) VALUES (?, ?, ?, ?, ?)');
  tx(() => {
    for (const [collection, items] of Object.entries(seed)) {
      items.forEach((item, i) => insert.run(collection, item.slug ?? null, item.status ?? 'published', i, JSON.stringify(item.data)));
    }
  });
}

import * as S from '../seed/site';
import * as P from '../seed/programme';
import { news as seedNews, categories as seedCategories } from '../seed/news';

type SeedItem = { slug?: string; status?: 'published' | 'draft'; data: Record<string, unknown> };
function seedData(): Record<string, SeedItem[]> {
  const list = <T extends object>(arr: readonly T[]) => arr.map((d) => ({ data: { ...d } as Record<string, unknown> }));
  return {
    settings: [{ data: { phone: S.contact.phone, email: S.contact.email, socials: S.socials.map((s) => ({ ...s })), footerText: 'Smart City Higher Education Advancement Program in East Africa, funded by the EU through European Education and Culture Executive Agency EACEA', disclaimer: S.disclaimer, projectStart: '2025-01-01', projectMonths: 36 } }],
    nav: S.nav.map((n) => ({ data: { label: n.label, href: n.href, children: n.children ?? [] } })),
    redirects: [
      { from: '/shape-project-officially-launches', to: '/news/shape-project-officially-launches/' },
      { from: '/shape-consortium-convenes-partners-meeting-in-mombasa-to-set-the-course-for-smart-city-education-in-east-africa', to: '/news/shape-consortium-convenes-partners-meeting-in-mombasa-to-set-the-course-for-smart-city-education-in-east-africa/' },
      { from: '/feed', to: '/feed.xml' },
      { from: '/sitemap_index.xml', to: '/sitemap.xml' },
      { from: '/project-team-2', to: '/project-team/' },
    ].map((d) => ({ data: d })),
    slides: S.slides.map((s) => ({ data: { image: s.image, title: s.title, text: s.text, ctaLabel: s.cta.label, ctaHref: s.cta.href } })),
    facts: list(S.facts),
    partners: list(S.partners),
    team: [{ data: { name: P.coordinator.name, title: P.coordinator.role, institution: P.coordinator.institution, photo: '', bio: P.coordinator.text, featured: true } }],
    associated: list(P.associatedPartners),
    about: [{ data: { paragraphs: S.aboutParagraphs.map((text) => ({ text })), goal: S.goal, mission: S.mission } }],
    thematic: list(S.thematicAreas),
    targets: list(S.targetGroups),
    impacts: list(S.impacts),
    workpackages: S.workPackages.map((w) => ({ data: { ...w, listTitle: 'listTitle' in w ? w.listTitle : '', deliverables: w.deliverables.map((d) => ({ ...d, file: '' })) } })),
    events: P.events.map((e) => ({ data: { title: e.title, type: e.type, start: e.start.length === 7 ? e.start + '-01' : e.start, end: e.end ? (e.end.length === 7 ? e.end + '-01' : e.end) : '', planned: !!e.planned, location: e.location, text: e.text, image: e.image ?? '', link: e.link ?? '' } })),
    brand: P.brandAssets.map((b) => ({ data: { title: b.title, file: b.file, note: b.note, dark: 'dark' in b ? !!b.dark : false } })),
    albums: P.photoAlbums.map((a) => ({ data: { title: a.title, date: a.date, link: a.link ?? '', photos: a.photos.map((src) => ({ src })) } })),
    categories: seedCategories.map((c) => ({ slug: c.slug, data: { name: c.name } })),
    posts: seedNews.map((p) => ({
      slug: p.slug,
      status: 'published' as const,
      data: { title: p.title, date: p.date.toISOString(), excerpt: p.excerpt, image: p.image ?? '', content: p.html, categories: p.categories.map((c) => c.name), tags: p.tags.map((t) => t.name), commentsOpen: p.commentsOpen },
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Public site view model                                              */
/* ------------------------------------------------------------------ */

const stripTags = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;/g, '’').replace(/\s+/g, ' ').trim();

export type Post = {
  id: number;
  slug: string;
  title: string;
  date: Date;
  modified: Date;
  excerpt: string;
  image?: string;
  category: string;
  categories: { name: string; slug: string }[];
  tags: { name: string; slug: string }[];
  commentsOpen: boolean;
  html: string;
  readingMinutes: number;
};

export function toPost(e: Entry, catSlugs: Map<string, string>): Post {
  const d = e.data;
  const text = stripTags(d.content ?? '');
  const excerpt = d.excerpt?.trim() || (text.split(' ').slice(0, 55).join(' ') + (text.split(' ').length > 55 ? ' […]' : ''));
  const categories = (d.categories ?? []).map((name: string) => ({ name, slug: catSlugs.get(name) ?? slugify(name) }));
  return {
    id: e.id,
    slug: e.slug!,
    title: d.title,
    date: new Date(d.date),
    modified: new Date(e.updated_at.replace(' ', 'T') + 'Z'),
    excerpt,
    image: d.image || undefined,
    category: categories[0]?.name ?? 'News',
    categories,
    tags: (d.tags ?? []).map((name: string) => ({ name, slug: slugify(name) })),
    commentsOpen: !!d.commentsOpen,
    html: d.content ?? '',
    readingMinutes: Math.max(1, Math.round(text.split(' ').length / 200)),
  };
}

export function loadSite() {
  if (cache && cache.version === version) return cache.site;
  const d = (key: string) => listEntries(key).map((e) => e.data as any);
  const settings = getSingleton('settings')?.data as any;
  const about = getSingleton('about')?.data as any;
  const categories = listEntries('categories').map((e) => ({ name: e.data.name as string, slug: e.slug! }));
  const catSlugs = new Map(categories.map((c) => [c.name, c.slug]));
  const now = new Date();
  const posts = listEntries('posts').map((e) => toPost(e, catSlugs)).filter((p) => p.date <= now);
  const currentMonth = projectMonth(settings.projectStart, settings.projectMonths, now);
  const monthOf = (iso: string) => projectMonth(settings.projectStart, 10_000, new Date(iso + 'T00:00:00Z'));
  const partners = d('partners');
  const workPackages = d('workpackages');
  const team = d('team');

  const site = {
    settings,
    contact: { phone: settings.phone as string, email: settings.email as string },
    socials: settings.socials as { name: string; href: string; icon: string }[],
    disclaimer: settings.disclaimer as string,
    footerText: settings.footerText as string,
    projectStart: settings.projectStart as string,
    projectMonths: settings.projectMonths as number,
    currentMonth,
    nav: d('nav').map((n) => ({ label: n.label as string, href: n.href as string, children: n.children?.length ? (n.children as { label: string; href: string }[]) : undefined })),
    redirects: d('redirects') as { from: string; to: string }[],
    slides: d('slides').map((s) => ({ image: s.image, title: s.title, text: s.text, cta: { label: s.ctaLabel, href: s.ctaHref } })),
    facts: d('facts'),
    partners,
    team,
    coordinator: (() => {
      const t = team.find((m) => m.featured);
      if (!t) return undefined;
      const p = partners.find((x) => x.name === t.institution);
      return { ...t, role: t.title as string, text: t.bio as string, country: (p?.country ?? '') as string, logo: p?.logo as string | undefined };
    })(),
    associated: d('associated'),
    aboutParagraphs: (about?.paragraphs ?? []).map((p: any) => p.text as string),
    goal: about?.goal as string,
    mission: about?.mission as string,
    thematicAreas: d('thematic'),
    targetGroups: d('targets'),
    impacts: d('impacts'),
    workPackages,
    institutions: partners.map((p) => ({
      ...p,
      leads: workPackages.filter((w) => w.lead === p.name).map((w) => ({ wp: w.wp, title: w.title, color: w.color, tint: w.tint })),
      region: ['Kenya', 'Somalia', 'Uganda'].includes(p.country) ? 'East Africa' : 'Europe',
      members: team.filter((t) => t.institution === p.name),
    })),
    events: d('events').map((e) => ({ ...e, start: e.planned ? String(e.start).slice(0, 7) : e.start, end: e.end ? (e.planned ? String(e.end).slice(0, 7) : e.end) : undefined, image: e.image || undefined, link: e.link || undefined, month: monthOf(e.start) })),
    brandAssets: d('brand'),
    photoAlbums: d('albums').map((a) => ({ ...a, photos: (a.photos ?? []).map((p: any) => p.src) })),
    categories,
    posts,
  };
  cache = { version, site };
  return site;
}

export type Site = ReturnType<typeof loadSite>;

/** Test helper: forget the seeded flag and cached view after the DB was reset. */
export function resetContentForTests() {
  seeded = false;
  invalidate();
}
