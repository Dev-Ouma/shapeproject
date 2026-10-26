// Authentication: scrypt password hashes, opaque session tokens (only their
// SHA-256 is stored), invite links, and an in-memory login rate limiter.
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { getDb } from './db';
import { otpRequired } from './otp';

export type Role = 'admin' | 'editor';
export type User = { id: number; email: string; name: string; role: Role; disabled: number; created_at: string; last_login: string | null };

export const SESSION_COOKIE = 'shape_session';
const SESSION_DAYS = 14;
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64, SCRYPT);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored?.startsWith('scrypt$')) return false;
  const [, saltB64, hashB64] = stored.split('$');
  const expected = Buffer.from(hashB64, 'base64');
  const actual = scryptSync(password, Buffer.from(saltB64, 'base64'), expected.length, SCRYPT);
  return timingSafeEqual(actual, expected);
}

export function passwordProblem(pw: string): string | null {
  if (pw.length < 12) return 'Use at least 12 characters.';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Use letters and numbers.';
  return null;
}

// A precomputed hash so failed lookups take as long as real checks.
const DUMMY_HASH = hashPassword(randomBytes(12).toString('hex'));

/* ---------------- users ---------------- */

export function findUserByEmail(email: string): (User & { password_hash: string | null }) | undefined {
  return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email.trim()) as any;
}

export function getUser(id: number): User | undefined {
  return getDb().prepare('SELECT id, email, name, role, disabled, created_at, last_login FROM users WHERE id = ?').get(id) as any;
}

export function listUsers(): User[] {
  return getDb().prepare('SELECT id, email, name, role, disabled, created_at, last_login FROM users ORDER BY created_at').all() as any;
}

export function countUsers(): number {
  return (getDb().prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n;
}

export function createUser(email: string, name: string, role: Role, password: string): number {
  const r = getDb().prepare('INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, ?, ?)').run(email.trim().toLowerCase(), name.trim(), role, hashPassword(password));
  return Number(r.lastInsertRowid);
}

export function updateUser(id: number, fields: { role?: Role; disabled?: boolean; name?: string }) {
  const u = getUser(id);
  if (!u) return;
  getDb().prepare('UPDATE users SET role = ?, disabled = ?, name = ? WHERE id = ?').run(fields.role ?? u.role, fields.disabled === undefined ? u.disabled : fields.disabled ? 1 : 0, fields.name ?? u.name, id);
  if (fields.disabled) getDb().prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
}

export function setPassword(id: number, password: string) {
  getDb().prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(password), id);
}

export function countActiveAdmins(): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin' AND disabled = 0").get() as { n: number }).n;
}

/* ---------------- login + rate limiting ---------------- */

const attempts = new Map<string, { count: number; until: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function isLocked(key: string): number {
  const a = attempts.get(key);
  if (!a) return 0;
  if (a.until > Date.now()) return Math.ceil((a.until - Date.now()) / 60000);
  if (Date.now() - a.first > WINDOW_MS) attempts.delete(key);
  return 0;
}

function recordFailure(key: string) {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || now - a.first > WINDOW_MS) attempts.set(key, { count: 1, first: now, until: 0 });
  else {
    a.count++;
    if (a.count >= MAX_ATTEMPTS) a.until = now + WINDOW_MS;
  }
}

export function resetRateLimits() {
  attempts.clear();
}

export type LoginResult = { ok: true; token: string; user: User; needsOtp: boolean } | { ok: false; error: string };

export function login(email: string, password: string, meta: { ip: string; userAgent: string }): LoginResult {
  const key = `${meta.ip}|${email.trim().toLowerCase()}`;
  const locked = isLocked(key);
  if (locked) return { ok: false, error: `Too many attempts. Try again in ${locked} minute${locked > 1 ? 's' : ''}.` };
  const user = findUserByEmail(email);
  const ok = verifyPassword(password, user?.password_hash ?? DUMMY_HASH) && !!user && !user.disabled;
  if (!ok) {
    recordFailure(key);
    return { ok: false, error: 'Incorrect email or password.' };
  }
  attempts.delete(key);
  const token = randomBytes(32).toString('base64url');
  const needsOtp = otpRequired();
  // A session that still needs its second factor lives only 10 minutes until the code is entered.
  getDb()
    .prepare('INSERT INTO sessions (id, user_id, expires_at, ip, user_agent, mfa_ok) VALUES (?, ?, ?, ?, ?, ?)')
    .run(sha256(token), user!.id, Date.now() + (needsOtp ? 10 * 60 * 1000 : SESSION_DAYS * 864e5), meta.ip, meta.userAgent.slice(0, 200), needsOtp ? 0 : 1);
  if (!needsOtp) getDb().prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user!.id);
  return { ok: true, token, user: getUser(user!.id)!, needsOtp };
}

export function sessionInfo(token: string | undefined): { user: User; mfaOk: boolean } | undefined {
  if (!token) return undefined;
  const row = getDb()
    .prepare('SELECT u.id, u.email, u.name, u.role, u.disabled, u.created_at, u.last_login, s.expires_at, s.mfa_ok FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?')
    .get(sha256(token)) as (User & { expires_at: number; mfa_ok: number }) | undefined;
  if (!row || row.disabled || row.expires_at < Date.now()) return undefined;
  const { expires_at, mfa_ok, ...user } = row;
  return { user, mfaOk: !!mfa_ok };
}

/** The signed-in user, only once any required second factor has been passed. */
export function userForSession(token: string | undefined): User | undefined {
  const s = sessionInfo(token);
  return s?.mfaOk ? s.user : undefined;
}

/** Second factor passed: upgrade the session to full length. */
export function completeMfa(token: string, userId: number) {
  getDb().prepare('UPDATE sessions SET mfa_ok = 1, expires_at = ? WHERE id = ?').run(Date.now() + SESSION_DAYS * 864e5, sha256(token));
  getDb().prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(userId);
}

/** Rate limiting for OTP codes, sharing the login limiter. */
export function otpLocked(userId: number): number {
  return isLocked(`otp|${userId}`);
}
export function otpFailure(userId: number) {
  recordFailure(`otp|${userId}`);
}
export function otpSuccess(userId: number) {
  attempts.delete(`otp|${userId}`);
}

export function logout(token: string | undefined) {
  if (token) getDb().prepare('DELETE FROM sessions WHERE id = ?').run(sha256(token));
}

export const sessionMaxAge = SESSION_DAYS * 86400;

/* ---------------- invites ---------------- */

export function createInvite(email: string, name: string, role: Role, createdBy: number): string {
  const token = randomBytes(24).toString('base64url');
  getDb()
    .prepare('INSERT INTO invites (token_hash, email, name, role, expires_at, created_by) VALUES (?, ?, ?, ?, ?, ?)')
    .run(sha256(token), email.trim().toLowerCase(), name.trim(), role, Date.now() + 7 * 864e5, createdBy);
  return token;
}

export function getInvite(token: string) {
  const inv = getDb().prepare('SELECT * FROM invites WHERE token_hash = ?').get(sha256(token)) as any;
  if (!inv || inv.used_at || inv.expires_at < Date.now()) return undefined;
  return inv as { email: string; name: string; role: Role };
}

export function acceptInvite(token: string, password: string): User | undefined {
  const inv = getInvite(token);
  if (!inv) return undefined;
  if (findUserByEmail(inv.email)) return undefined;
  const id = createUser(inv.email, inv.name, inv.role, password);
  getDb().prepare("UPDATE invites SET used_at = datetime('now') WHERE token_hash = ?").run(sha256(token));
  return getUser(id);
}

export function listPendingInvites() {
  return getDb().prepare('SELECT email, name, role, expires_at FROM invites WHERE used_at IS NULL AND expires_at > ? ORDER BY expires_at DESC').all(Date.now()) as any[];
}

/* ---------------- audit ---------------- */

export function audit(userId: number | undefined, action: string, target?: string) {
  getDb().prepare('INSERT INTO audit_log (user_id, action, target) VALUES (?, ?, ?)').run(userId ?? null, action, target ?? null);
}

export function recentAudit(limit = 50) {
  return getDb()
    .prepare('SELECT a.*, u.name AS user_name FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.id DESC LIMIT ?')
    .all(limit) as any[];
}

/* ---------------- permissions ---------------- */

export function can(user: User | undefined, need: 'content' | 'admin'): boolean {
  if (!user || user.disabled) return false;
  return need === 'content' ? true : user.role === 'admin';
}

/** Sign out every session of `userId` except the one identified by `keepToken`. */
export function logoutOthers(userId: number, keepToken: string | undefined) {
  getDb().prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?').run(userId, keepToken ? sha256(keepToken) : '');
}

/** Create the first admin from BOOTSTRAP_ADMIN_* env vars when no users exist (first deploy, tests). */
let bootstrapped = false;
export function bootstrapAdmin() {
  if (bootstrapped) return;
  bootstrapped = true;
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  if (!email || !password || countUsers() > 0) return;
  if (passwordProblem(password)) {
    console.error('BOOTSTRAP_ADMIN_PASSWORD is too weak; no admin created.');
    return;
  }
  createUser(email, process.env.BOOTSTRAP_ADMIN_NAME ?? 'Administrator', 'admin', password);
  console.log(`Created first admin ${email}.`);
}
