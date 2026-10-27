// Numbers for the Administration overview: storage, counts, current release.
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { dbPath, getDb } from './db';
import { UPLOAD_DIR } from './media';
import { listEntries } from './content';

function dirSize(dir: string): { bytes: number; files: number } {
  let bytes = 0, files = 0;
  if (!existsSync(dir)) return { bytes, files };
  for (const d of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, d.name);
    if (d.isDirectory()) {
      const s = dirSize(p);
      bytes += s.bytes;
      files += s.files;
    } else if (d.isFile()) {
      bytes += statSync(p).size;
      files++;
    }
  }
  return { bytes, files };
}

export function formatBytes(n: number): string {
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(n >= 10 || i === 0 ? 0 : 1)} ${u[i]}`;
}

const semver = (v: string) => (v.match(/\d+/g) ?? []).slice(0, 3).map(Number);
export function compareVersions(a: string, b: string): number {
  const x = semver(a), y = semver(b);
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) - (y[i] ?? 0);
  return 0;
}

/** Published release notes, highest version first. */
export const publishedReleases = () => listEntries('releases').sort((a, b) => compareVersions(b.data.version, a.data.version) || String(b.data.date).localeCompare(String(a.data.date)));

/** Newest published release note (the version shown across the CMS). */
export function currentRelease(): { version: string; title: string; date: string; id: number } | undefined {
  const r = publishedReleases()[0];
  return r ? { version: r.data.version, title: r.data.title, date: r.data.date, id: r.id } : undefined;
}

export function systemStats() {
  const db = getDb();
  const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  const path = dbPath();
  const dbBytes = path === ':memory:' ? 0 : ['', '-wal', '-shm'].reduce((s, x) => s + (existsSync(path + x) ? statSync(path + x).size : 0), 0);
  return {
    dbBytes,
    uploads: dirSize(UPLOAD_DIR()),
    entries: n('SELECT COUNT(*) AS n FROM entries WHERE deleted_at IS NULL'),
    media: n('SELECT COUNT(*) AS n FROM media WHERE deleted_at IS NULL'),
    users: n('SELECT COUNT(*) AS n FROM users WHERE disabled = 0'),
    sessions: n('SELECT COUNT(*) AS n FROM sessions WHERE expires_at > ' + Date.now()),
    revisions: n('SELECT COUNT(*) AS n FROM revisions'),
    auditEvents: n('SELECT COUNT(*) AS n FROM audit_log'),
    analyticsEvents: n('SELECT COUNT(*) AS n FROM analytics_events'),
    schema: (db.prepare('PRAGMA user_version').get() as { user_version: number }).user_version,
    node: process.version,
    uptimeSec: Math.round(process.uptime()),
  };
}
