// Recycle bin: soft-deleted entries and media, restored or purged from one place.
import { getDb } from './db';
import { getCollection } from './schema';
import { entryTitle, getTrashedEntry, purgeEntry, restoreEntry } from './content';
import { purgeMedia, restoreMedia } from './media';

export const RETENTION_DAYS = 30;

export type TrashItem = { kind: 'entry' | 'media'; id: number; title: string; type: string; collection?: string; deleted_at: string; deleted_by: string | null; purge_on: string };

export function listTrash(): TrashItem[] {
  const db = getDb();
  const purgeOn = (at: string) => new Date(Date.parse(at.replace(' ', 'T') + 'Z') + RETENTION_DAYS * 864e5).toISOString().slice(0, 10);
  const entries = (db.prepare('SELECT e.id, e.collection, e.deleted_at, u.name AS who FROM entries e LEFT JOIN users u ON u.id = e.deleted_by WHERE e.deleted_at IS NOT NULL').all() as any[]).map((r): TrashItem => {
    const c = getCollection(r.collection);
    const e = getTrashedEntry(r.id)!;
    return { kind: 'entry', id: r.id, title: c ? entryTitle(c, e) : `#${r.id}`, type: c?.singular ?? r.collection, collection: r.collection, deleted_at: r.deleted_at, deleted_by: r.who, purge_on: purgeOn(r.deleted_at) };
  });
  const media = (db.prepare('SELECT m.id, m.original_name, m.deleted_at, u.name AS who FROM media m LEFT JOIN users u ON u.id = m.deleted_by WHERE m.deleted_at IS NOT NULL').all() as any[]).map(
    (r): TrashItem => ({ kind: 'media', id: r.id, title: r.original_name, type: 'Media file', deleted_at: r.deleted_at, deleted_by: r.who, purge_on: purgeOn(r.deleted_at) }),
  );
  return [...entries, ...media].sort((a, b) => b.deleted_at.localeCompare(a.deleted_at));
}

export const countTrash = () => {
  const db = getDb();
  const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  return n('SELECT COUNT(*) AS n FROM entries WHERE deleted_at IS NOT NULL') + n('SELECT COUNT(*) AS n FROM media WHERE deleted_at IS NOT NULL');
};

export function restoreItem(kind: string, id: number): boolean {
  return kind === 'media' ? restoreMedia(id) : !!restoreEntry(id);
}

export function purgeItem(kind: string, id: number): boolean {
  return kind === 'media' ? purgeMedia(id) : purgeEntry(id);
}

/** Purge everything binned more than `days` ago (all of it with days = 0). Returns how many items went. */
export function purgeOlderThan(days = RETENTION_DAYS): number {
  const db = getDb();
  const cutoff = `-${days} days`;
  const ids = (sql: string) => (db.prepare(sql).all(cutoff) as { id: number }[]).map((r) => r.id);
  const e = ids("SELECT id FROM entries WHERE deleted_at IS NOT NULL AND deleted_at <= datetime('now', ?)");
  const m = ids("SELECT id FROM media WHERE deleted_at IS NOT NULL AND deleted_at <= datetime('now', ?)");
  e.forEach(purgeEntry);
  m.forEach(purgeMedia);
  return e.length + m.length;
}

let lastSweep = 0;
/** Auto-purge at most once an hour (called from request handling). */
export function sweepTrash(now = Date.now()) {
  if (now - lastSweep < 3600e3) return;
  lastSweep = now;
  try {
    purgeOlderThan();
  } catch (e) {
    console.error('Recycle bin sweep failed', e);
  }
}
