// SQLite access via Node's built-in `node:sqlite` (no native build step).
// One connection per process; WAL mode so the site can read while the admin writes.
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const MIGRATIONS: string[] = [
  // 1 — core tables
  `
  CREATE TABLE entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    collection TEXT NOT NULL,
    slug TEXT,
    status TEXT NOT NULL DEFAULT 'published',
    position INTEGER NOT NULL DEFAULT 0,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by INTEGER
  );
  CREATE INDEX entries_collection ON entries(collection, position);
  CREATE UNIQUE INDEX entries_slug ON entries(collection, slug) WHERE slug IS NOT NULL;

  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','editor')),
    password_hash TEXT,
    disabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login TEXT
  );

  CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    ip TEXT,
    user_agent TEXT
  );

  CREATE TABLE invites (
    token_hash TEXT PRIMARY KEY,
    email TEXT NOT NULL COLLATE NOCASE,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin','editor')),
    expires_at INTEGER NOT NULL,
    used_at TEXT,
    created_by INTEGER REFERENCES users(id)
  );

  CREATE TABLE comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_slug TEXT NOT NULL,
    author TEXT NOT NULL,
    email TEXT NOT NULL,
    url TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','spam')),
    ip_hash TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX comments_post ON comments(post_slug, status);

  CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    original_name TEXT NOT NULL,
    mime TEXT NOT NULL,
    size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    alt TEXT NOT NULL DEFAULT '',
    variants TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    created_by INTEGER REFERENCES users(id)
  );

  CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target TEXT,
    at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  `,
  // 2 — one-time-password (TOTP) second factor
  `
  ALTER TABLE users ADD COLUMN totp_secret TEXT;
  ALTER TABLE users ADD COLUMN totp_enabled INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE users ADD COLUMN totp_last_step INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE users ADD COLUMN recovery_codes TEXT NOT NULL DEFAULT '[]';
  ALTER TABLE sessions ADD COLUMN mfa_ok INTEGER NOT NULL DEFAULT 1;
  `,
  // 3 — inbox: star/archive messages and keep a record of replies sent from the CMS
  `
  ALTER TABLE messages ADD COLUMN starred INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE messages ADD COLUMN archived INTEGER NOT NULL DEFAULT 0;
  CREATE TABLE message_replies (
    id INTEGER PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX message_replies_msg ON message_replies(message_id);
  `,
  // 4 — first-party, cookieless analytics (no IPs stored; visitor ids are salted per day and unlinkable)
  `
  CREATE TABLE analytics_events (
    id INTEGER PRIMARY KEY,
    ts TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    day TEXT NOT NULL,
    type TEXT NOT NULL,
    path TEXT NOT NULL,
    title TEXT,
    target TEXT,
    label TEXT,
    ref TEXT,
    utm TEXT,
    visitor TEXT NOT NULL,
    session TEXT NOT NULL,
    device TEXT,
    browser TEXT,
    os TEXT,
    lang TEXT,
    value INTEGER
  );
  CREATE INDEX analytics_day_type ON analytics_events(day, type);
  CREATE INDEX analytics_visitor_ts ON analytics_events(visitor, ts);
  CREATE TABLE analytics_salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL);
  `,
  // 5 — administration: recycle bin, revisions, richer audit trail, system switches, first release note
  `
  ALTER TABLE entries ADD COLUMN deleted_at TEXT;
  ALTER TABLE entries ADD COLUMN deleted_by INTEGER;
  ALTER TABLE media ADD COLUMN deleted_at TEXT;
  ALTER TABLE media ADD COLUMN deleted_by INTEGER;
  ALTER TABLE audit_log ADD COLUMN ip TEXT;
  ALTER TABLE audit_log ADD COLUMN user_agent TEXT;
  ALTER TABLE audit_log ADD COLUMN detail TEXT;
  CREATE INDEX audit_at ON audit_log(at);
  CREATE TABLE revisions (
    id INTEGER PRIMARY KEY,
    entry_id INTEGER NOT NULL,
    collection TEXT NOT NULL,
    slug TEXT,
    status TEXT NOT NULL,
    data TEXT NOT NULL,
    note TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX revisions_entry ON revisions(entry_id, id);
  CREATE TABLE system_flags (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_by INTEGER
  );
  INSERT INTO entries (collection, slug, status, position, data) VALUES ('releases', '1-4-0', 'published', 0, json_object(
    'version', '1.4.0',
    'title', 'Administration module',
    'date', date('now'),
    'summary', 'Audit trail, recycle bin, revisions, release notes, maintenance and lockdown modes.',
    'notes', '<h3>New</h3><ul><li><strong>Administration</strong> section: system overview, audit trail with filters, diffs and CSV export, recycle bin with 30-day retention, release notes, maintenance and lockdown switches.</li><li><strong>Revisions</strong> on every save, with compare and one-click restore.</li><li><strong>Duplicate</strong> any item from its list or editor.</li><li>Richer dashboard: content mix, publishing activity, engagement trends and project timeline.</li></ul><h3>Already in place</h3><ul><li>First-party, cookieless analytics with live visitors and CSV export.</li><li>Inbox with folders, search, stars, archive and reply threads.</li><li>Two-step sign-in (authenticator app) for every account.</li><li>Comments moderation, media library, Project Book PDF.</li></ul>'
  ));
  `,
  // 6 — session policy: idle timeout and absolute lifetime are enforced from these timestamps (ms)
  `
  ALTER TABLE sessions ADD COLUMN last_seen INTEGER NOT NULL DEFAULT 0;
  ALTER TABLE sessions ADD COLUMN started_at INTEGER NOT NULL DEFAULT 0;
  UPDATE sessions SET last_seen = CAST(strftime('%s','now') AS INTEGER) * 1000, started_at = CAST(strftime('%s','now') AS INTEGER) * 1000;
  CREATE INDEX sessions_user ON sessions(user_id);
  `,
];

let db: DatabaseSync | undefined;

export function dbPath(): string {
  const p = process.env.DB_PATH ?? 'var/shape.db';
  return p === ':memory:' ? p : resolve(p);
}

export function getDb(): DatabaseSync {
  if (db) return db;
  const path = dbPath();
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  db = new DatabaseSync(path);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
  migrate(db);
  return db;
}

function migrate(d: DatabaseSync) {
  const { user_version } = d.prepare('PRAGMA user_version').get() as { user_version: number };
  for (let v = user_version; v < MIGRATIONS.length; v++) {
    d.exec('BEGIN');
    try {
      d.exec(MIGRATIONS[v]);
      d.exec(`PRAGMA user_version = ${v + 1}`);
      d.exec('COMMIT');
    } catch (e) {
      d.exec('ROLLBACK');
      throw e;
    }
  }
}

/** Run `fn` inside a transaction. */
export function tx<T>(fn: () => T): T {
  const d = getDb();
  d.exec('BEGIN');
  try {
    const r = fn();
    d.exec('COMMIT');
    return r;
  } catch (e) {
    d.exec('ROLLBACK');
    throw e;
  }
}

/** Test helper: drop the cached connection (used with DB_PATH=':memory:'). */
export function resetDbForTests() {
  db?.close();
  db = undefined;
}
