// Audit trail queries: filtering, paging and CSV export over `audit_log`.
import { getDb } from './db';

export type AuditFilter = { user?: number; verb?: string; area?: string; from?: string; to?: string; q?: string };
export type AuditRow = { id: number; user_id: number | null; user_name: string | null; action: string; target: string | null; at: string; ip: string | null; user_agent: string | null; detail: string | null };

export function parseAuditFilter(p: URLSearchParams): AuditFilter {
  const date = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : undefined);
  const word = (v: string | null) => (v && /^[a-z0-9_-]{1,40}$/i.test(v) ? v : undefined);
  const user = Number(p.get('user'));
  return { user: Number.isInteger(user) && user > 0 ? user : undefined, verb: word(p.get('verb')), area: word(p.get('area')), from: date(p.get('from')), to: date(p.get('to')), q: p.get('q')?.trim().slice(0, 100) || undefined };
}

function where(f: AuditFilter): { sql: string; args: (string | number)[] } {
  const w: string[] = [];
  const args: (string | number)[] = [];
  if (f.user) { w.push('a.user_id = ?'); args.push(f.user); }
  // Actions look like "<area>.<verb>[.<detail>]", e.g. posts.update.published, media.delete, login.
  if (f.area) { w.push("(a.action = ? OR a.action LIKE ? || '.%')"); args.push(f.area, f.area); }
  if (f.verb) { w.push("('.' || a.action || '.') LIKE ?"); args.push(`%.${f.verb}.%`); }
  if (f.from) { w.push('a.at >= ?'); args.push(f.from); }
  if (f.to) { w.push("a.at < date(?, '+1 day')"); args.push(f.to); }
  if (f.q) { w.push('(a.target LIKE ? OR a.action LIKE ? OR a.ip LIKE ? OR u.name LIKE ?)'); args.push(...Array(4).fill(`%${f.q}%`)); }
  return { sql: w.length ? `WHERE ${w.join(' AND ')}` : '', args };
}

export function queryAudit(f: AuditFilter, page = 1, perPage = 50): { rows: AuditRow[]; total: number; pages: number } {
  const { sql, args } = where(f);
  const db = getDb();
  const total = (db.prepare(`SELECT COUNT(*) AS n FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ${sql}`).get(...args) as { n: number }).n;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const p = Math.min(Math.max(1, page), pages);
  const rows = db.prepare(`SELECT a.*, u.name AS user_name FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ${sql} ORDER BY a.id DESC LIMIT ? OFFSET ?`).all(...args, perPage, (p - 1) * perPage) as AuditRow[];
  return { rows, total, pages };
}

/** Distinct first segments of actions ("posts", "media", "login"…) and verbs, for the filter menus. */
export function auditFacets(): { areas: string[]; verbs: string[] } {
  const actions = (getDb().prepare('SELECT DISTINCT action FROM audit_log').all() as { action: string }[]).map((r) => r.action.split('.'));
  return {
    areas: [...new Set(actions.map((a) => a[0]!))].sort(),
    verbs: [...new Set(actions.flatMap((a) => a.slice(1)))].sort(),
  };
}

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  // Neutralise spreadsheet formulas and quote everything.
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export function auditCsv(f: AuditFilter): string {
  const { sql, args } = where(f);
  const rows = getDb().prepare(`SELECT a.*, u.name AS user_name FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ${sql} ORDER BY a.id DESC LIMIT 50000`).all(...args) as AuditRow[];
  const head = ['id', 'at_utc', 'user', 'action', 'target', 'ip', 'user_agent', 'detail'];
  return [head.join(','), ...rows.map((r) => [r.id, r.at, r.user_name, r.action, r.target, r.ip, r.user_agent, r.detail].map(csvCell).join(','))].join('\r\n') + '\r\n';
}

/** Weekly counts of an audit action pattern over the last `weeks` weeks (oldest first), keyed by week start. */
export function weeklyActivity(weeks = 12, like = '%'): { week: string; n: number }[] {
  const rows = getDb()
    .prepare("SELECT date(at, '-6 days', 'weekday 1') AS w, COUNT(*) AS n FROM audit_log WHERE action LIKE ? AND at >= date('now', ?) GROUP BY w")
    .all(like, `-${weeks * 7 + 7} days`) as { w: string; n: number }[];
  return weekBuckets(weeks, rows);
}

/** Fill `weeks` Monday-start buckets ending this week from sparse {w, n} rows. */
export function weekBuckets(weeks: number, rows: { w: string; n: number }[], now = new Date()): { week: string; n: number }[] {
  const map = new Map(rows.map((r) => [r.w, r.n]));
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  const out: { week: string; n: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const w = new Date(d.getTime() - i * 7 * 864e5).toISOString().slice(0, 10);
    out.push({ week: w, n: map.get(w) ?? 0 });
  }
  return out;
}

/** Weekly counts of rows created in an engagement/content table (oldest first). */
export function weeklyCreated(table: 'messages' | 'comments' | 'media', weeks = 12): { week: string; n: number }[] {
  const rows = getDb()
    .prepare(`SELECT date(created_at, '-6 days', 'weekday 1') AS w, COUNT(*) AS n FROM ${table} WHERE created_at >= date('now', ?) GROUP BY w`)
    .all(`-${weeks * 7 + 7} days`) as { w: string; n: number }[];
  return weekBuckets(weeks, rows);
}
