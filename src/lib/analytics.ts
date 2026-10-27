// First-party, cookieless analytics. Nothing is stored on the visitor's device and no IP address is kept:
// a visitor id is SHA-256(daily random salt + IP + user agent), and each day's salt is deleted after the day
// ends, so ids cannot be linked across days or reversed. Sessions are derived server-side (30-minute gap).
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { getDb } from './db';

export type EventType = 'pageview' | 'click' | 'outbound' | 'download' | 'contact' | 'search' | 'leave' | 'notfound';
export const EVENT_TYPES: EventType[] = ['pageview', 'click', 'outbound', 'download', 'contact', 'search', 'leave', 'notfound'];

const BOT_RE = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|uptime|curl|wget|python|httpclient|axios|node-fetch|facebookexternalhit|embedly|whatsapp|telegram/i;
const SESSION_GAP_MIN = 30;
const RETENTION_DAYS = 400;

/** Real client IP: trust X-Real-IP / X-Forwarded-For only when the socket peer is the local reverse proxy. */
export function clientIp(request: Request, socketAddress: string): string {
  const local = socketAddress === '127.0.0.1' || socketAddress === '::1' || socketAddress === '::ffff:127.0.0.1';
  if (!local) return socketAddress;
  return request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? socketAddress;
}

export function isBot(ua: string): boolean {
  return !ua || BOT_RE.test(ua);
}

export function parseUA(ua: string): { device: string; browser: string; os: string } {
  const device = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua) ? 'Tablet' : /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua) ? 'Mobile' : 'Desktop';
  const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\/|CriOS/.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Other';
  const os = /Windows/.test(ua) ? 'Windows' : /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Mac OS X|Macintosh/.test(ua) ? 'macOS' : /CrOS/.test(ua) ? 'ChromeOS' : /Linux/.test(ua) ? 'Linux' : 'Other';
  return { device, browser, os };
}

const today = () => new Date().toISOString().slice(0, 10);

function saltFor(day: string): string {
  const db = getDb();
  const row = db.prepare('SELECT salt FROM analytics_salts WHERE day = ?').get(day) as { salt: string } | undefined;
  if (row) return row.salt;
  const salt = randomBytes(32).toString('hex');
  db.prepare('INSERT OR IGNORE INTO analytics_salts (day, salt) VALUES (?, ?)').run(day, salt);
  // Yesterday's salt is kept so sessions crossing midnight still resolve; older salts are destroyed.
  db.prepare("DELETE FROM analytics_salts WHERE day < date(?, '-1 day')").run(day);
  return (db.prepare('SELECT salt FROM analytics_salts WHERE day = ?').get(day) as { salt: string }).salt;
}

export function visitorId(ip: string, ua: string, day = today()): string {
  return createHash('sha256').update(`${saltFor(day)}|${ip}|${ua}`).digest('hex').slice(0, 24);
}

const clip = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n) : '') || null;

/** Keep only the path (no query strings, which can carry personal data), except the search term on /search. */
function cleanPath(v: unknown): string | null {
  const s = clip(v, 300);
  if (!s || !s.startsWith('/') || s.startsWith('//')) return null;
  return s.split(/[?#]/)[0]!;
}

function refHost(v: unknown, ownHost: string): string | null {
  const s = clip(v, 500);
  if (!s) return null;
  try {
    const u = new URL(s);
    if (!/^https?:$/.test(u.protocol) || u.hostname === ownHost) return null;
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function cleanTarget(type: EventType, v: unknown): string | null {
  const s = clip(v, 300);
  if (!s) return null;
  if (type === 'contact') return s.startsWith('mailto:') ? 'email' : s.startsWith('tel:') ? 'phone' : null;
  if (s.startsWith('/')) return s.split('#')[0]!.split('?')[0]!;
  try {
    const u = new URL(s);
    return /^https?:$/.test(u.protocol) ? `${u.hostname.replace(/^www\./, '')}${u.pathname === '/' ? '' : u.pathname}`.slice(0, 300) : null;
  } catch {
    return null;
  }
}

export type CollectInput = { type?: unknown; path?: unknown; title?: unknown; target?: unknown; label?: unknown; ref?: unknown; utm?: unknown; value?: unknown };

const perVisitor = new Map<string, number[]>();

/** Validate and store one event. Returns false when dropped (bot, invalid, rate-limited). */
export function record(input: CollectInput, ctx: { ip: string; ua: string; lang?: string | null; host: string; now?: Date }): boolean {
  const type = String(input.type) as EventType;
  if (!EVENT_TYPES.includes(type) || isBot(ctx.ua)) return false;
  const path = cleanPath(input.path);
  if (!path || path.startsWith('/admin') || path.startsWith('/api')) return false;

  const now = ctx.now ?? new Date();
  const day = now.toISOString().slice(0, 10);
  const visitor = visitorId(ctx.ip, ctx.ua, day);

  const t = now.getTime();
  const hits = (perVisitor.get(visitor) ?? []).filter((x) => t - x < 3600_000);
  if (hits.length >= 600) return false;
  hits.push(t);
  perVisitor.set(visitor, hits);
  if (perVisitor.size > 50_000) perVisitor.clear();

  const db = getDb();
  const ts = now.toISOString().slice(0, 19).replace('T', ' ');
  const last = db
    .prepare(`SELECT session FROM analytics_events WHERE visitor = ? AND ts >= datetime(?, '-${SESSION_GAP_MIN} minutes') ORDER BY id DESC LIMIT 1`)
    .get(visitor, ts) as { session: string } | undefined;
  const session = last?.session ?? randomUUID().slice(0, 18);
  const ua = parseUA(ctx.ua);
  const lang = ctx.lang?.split(',')[0]?.trim().slice(0, 12) || null;
  const value = Number.isFinite(Number(input.value)) ? Math.max(0, Math.min(Math.round(Number(input.value)), 6 * 3600_000)) : null;

  db.prepare(
    `INSERT INTO analytics_events (ts, day, type, path, title, target, label, ref, utm, visitor, session, device, browser, os, lang, value)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    ts, day, type, path, clip(input.title, 160), cleanTarget(type, input.target),
    type === 'search' ? clip(input.label, 100)?.toLowerCase() ?? null : clip(input.label, 100),
    type === 'pageview' ? refHost(input.ref, ctx.host) : null, type === 'pageview' ? clip(input.utm, 80) : null,
    visitor, session, ua.device, ua.browser, ua.os, lang, value,
  );
  if (Math.random() < 0.002) db.prepare(`DELETE FROM analytics_events WHERE day < date('now', '-${RETENTION_DAYS} days')`).run();
  return true;
}

/* ---------------- reporting ---------------- */

export type Range = { from: string; to: string; days: number };

export function rangeFor(days: number, end = new Date()): { cur: Range; prev: Range } {
  const d = (offset: number) => new Date(end.getTime() - offset * 86400_000).toISOString().slice(0, 10);
  return { cur: { from: d(days - 1), to: d(0), days }, prev: { from: d(days * 2 - 1), to: d(days), days } };
}

const one = <T>(sql: string, ...a: (string | number)[]) => getDb().prepare(sql).get(...a) as T;
const all = <T>(sql: string, ...a: (string | number)[]) => getDb().prepare(sql).all(...a) as T[];

export type Summary = { visitors: number; pageviews: number; sessions: number; bounceRate: number; avgEngagedMs: number; clicks: number; searches: number; downloads: number };

export function summary(r: Range): Summary {
  const w = 'day BETWEEN ? AND ?';
  const base = one<{ visitors: number; pageviews: number; sessions: number }>(
    `SELECT COUNT(DISTINCT visitor) visitors, SUM(type = 'pageview') pageviews, COUNT(DISTINCT CASE WHEN type = 'pageview' THEN session END) sessions FROM analytics_events WHERE ${w}`, r.from, r.to);
  const bounced = one<{ n: number }>(
    `SELECT COUNT(*) n FROM (SELECT session FROM analytics_events WHERE ${w} AND type = 'pageview' GROUP BY session HAVING COUNT(*) = 1)`, r.from, r.to).n;
  const leave = one<{ avg: number | null }>(`SELECT AVG(value) avg FROM analytics_events WHERE ${w} AND type = 'leave' AND value > 0`, r.from, r.to);
  const c = one<{ clicks: number; searches: number; downloads: number }>(
    `SELECT SUM(type IN ('click','outbound','download','contact')) clicks, SUM(type = 'search') searches, SUM(type = 'download') downloads FROM analytics_events WHERE ${w}`, r.from, r.to);
  return {
    visitors: base.visitors ?? 0, pageviews: base.pageviews ?? 0, sessions: base.sessions ?? 0,
    bounceRate: base.sessions ? bounced / base.sessions : 0, avgEngagedMs: Math.round(leave.avg ?? 0),
    clicks: c.clicks ?? 0, searches: c.searches ?? 0, downloads: c.downloads ?? 0,
  };
}

export type DayPoint = { day: string; visitors: number; pageviews: number; clicks: number; searches: number };

/** One row per day in the range, zero-filled. */
export function daily(r: Range): DayPoint[] {
  const rows = all<DayPoint>(
    `SELECT day, COUNT(DISTINCT visitor) visitors, SUM(type = 'pageview') pageviews, SUM(type IN ('click','outbound','download','contact')) clicks, SUM(type = 'search') searches
     FROM analytics_events WHERE day BETWEEN ? AND ? GROUP BY day`, r.from, r.to);
  const map = new Map(rows.map((x) => [x.day, x]));
  const out: DayPoint[] = [];
  for (let t = Date.parse(r.from + 'T00:00:00Z'); t <= Date.parse(r.to + 'T00:00:00Z'); t += 86400_000) {
    const day = new Date(t).toISOString().slice(0, 10);
    out.push(map.get(day) ?? { day, visitors: 0, pageviews: 0, clicks: 0, searches: 0 });
  }
  return out;
}

export function topPages(r: Range, limit = 10) {
  return all<{ path: string; title: string | null; views: number; visitors: number; avgMs: number | null }>(
    `SELECT p.path, MAX(p.title) title, COUNT(*) views, COUNT(DISTINCT p.visitor) visitors,
       (SELECT AVG(l.value) FROM analytics_events l WHERE l.type = 'leave' AND l.path = p.path AND l.day BETWEEN ? AND ? AND l.value > 0) avgMs
     FROM analytics_events p WHERE p.type = 'pageview' AND p.day BETWEEN ? AND ? GROUP BY p.path ORDER BY views DESC LIMIT ?`,
    r.from, r.to, r.from, r.to, limit);
}

export function breakdown(r: Range, column: 'device' | 'browser' | 'os' | 'ref' | 'utm' | 'lang', limit = 8) {
  const label = column === 'ref' ? "COALESCE(ref, 'Direct / none')" : column === 'utm' ? 'utm' : `COALESCE(${column}, 'Unknown')`;
  const where = column === 'utm' ? 'AND utm IS NOT NULL' : '';
  return all<{ bucket: string; visitors: number }>(
    // Alias is not "label": that would resolve to the table's own label column in GROUP BY.
    `SELECT ${label} AS bucket, COUNT(DISTINCT visitor) visitors FROM analytics_events WHERE type = 'pageview' AND day BETWEEN ? AND ? ${where} GROUP BY bucket ORDER BY visitors DESC LIMIT ?`,
    r.from, r.to, limit).map((x) => ({ label: x.bucket, visitors: x.visitors }));
}

export function topClicks(r: Range, types: EventType[], limit = 10) {
  return all<{ label: string | null; target: string | null; type: string; clicks: number; visitors: number }>(
    `SELECT label, target, type, COUNT(*) clicks, COUNT(DISTINCT visitor) visitors FROM analytics_events
     WHERE type IN (${types.map(() => '?').join(',')}) AND day BETWEEN ? AND ? GROUP BY label, target, type ORDER BY clicks DESC LIMIT ?`,
    ...types, r.from, r.to, limit);
}

export function topSearches(r: Range, limit = 10) {
  return all<{ term: string; searches: number; zero: number }>(
    `SELECT label term, COUNT(*) searches, SUM(value = 0) zero FROM analytics_events WHERE type = 'search' AND label IS NOT NULL AND day BETWEEN ? AND ? GROUP BY label ORDER BY searches DESC LIMIT ?`,
    r.from, r.to, limit);
}

export function zeroResultSearches(r: Range, limit = 8) {
  return all<{ term: string; searches: number }>(
    `SELECT label term, COUNT(*) searches FROM analytics_events WHERE type = 'search' AND value = 0 AND label IS NOT NULL AND day BETWEEN ? AND ? GROUP BY label ORDER BY searches DESC LIMIT ?`,
    r.from, r.to, limit);
}

export function notFound(r: Range, limit = 8) {
  return all<{ path: string; hits: number }>(
    `SELECT path, COUNT(*) hits FROM analytics_events WHERE type = 'notfound' AND day BETWEEN ? AND ? GROUP BY path ORDER BY hits DESC LIMIT ?`, r.from, r.to, limit);
}

/** Page views by weekday (0 = Monday) and hour, in East Africa Time. */
export function heatmap(r: Range): number[][] {
  const grid = Array.from({ length: 7 }, () => Array<number>(24).fill(0));
  for (const x of all<{ wd: number; h: number; n: number }>(
    `SELECT (CAST(strftime('%w', ts, '+3 hours') AS INTEGER) + 6) % 7 wd, CAST(strftime('%H', ts, '+3 hours') AS INTEGER) h, COUNT(*) n
     FROM analytics_events WHERE type = 'pageview' AND day BETWEEN ? AND ? GROUP BY wd, h`, r.from, r.to)) grid[x.wd]![x.h] = x.n;
  return grid;
}

export function liveVisitors(minutes = 5): { visitors: number; pages: { path: string; visitors: number }[] } {
  const visitors = one<{ n: number }>(`SELECT COUNT(DISTINCT visitor) n FROM analytics_events WHERE ts >= datetime('now', '-${minutes} minutes')`).n;
  const pages = all<{ path: string; visitors: number }>(
    `SELECT path, COUNT(DISTINCT visitor) visitors FROM analytics_events WHERE type = 'pageview' AND ts >= datetime('now', '-${minutes} minutes') GROUP BY path ORDER BY visitors DESC LIMIT 5`);
  return { visitors, pages };
}

export function exportRows(r: Range) {
  return all<Record<string, string | number | null>>(
    `SELECT ts, type, path, title, target, label, ref, utm, session, device, browser, os, lang, value FROM analytics_events WHERE day BETWEEN ? AND ? ORDER BY id`, r.from, r.to);
}
