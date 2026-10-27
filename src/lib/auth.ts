// Authentication: scrypt password hashes, opaque session tokens (only their
// SHA-256 is stored), invite links, and an in-memory login rate limiter.
import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { getDb } from './db';
import { otpRequired } from './otp';
import { currentRequest, getLockdown } from './system';

export type Role = 'admin' | 'editor';
export type User = { id: number; email: string; name: string; role: Role; disabled: number; created_at: string; last_login: string | null };

export const SESSION_COOKIE = 'shape_session';
/*
 * Session policy (OWASP ASVS V3): opaque random tokens, stored only as SHA-256 hashes; HttpOnly, Secure,
 * SameSite=Lax cookie; signed out after SESSION_IDLE_MINUTES without activity (default 60) and after
 * SESSION_ABSOLUTE_HOURS regardless (default 12); token rotated when the second factor is passed; all of a
 * user's sessions revoked on password change, role change or disabling.
 */
export const SESSION_IDLE_MS = Math.max(5, Number(process.env.SESSION_IDLE_MINUTES ?? 60)) * 60_000;
export const SESSION_ABSOLUTE_MS = Math.max(1, Number(process.env.SESSION_ABSOLUTE_HOURS ?? 12)) * 3600_000;
const PENDING_MFA_MS = 10 * 60_000;
// last_seen is written at most this often, so every request does not cost a database write.
const TOUCH_EVERY_MS = 60_000;
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
export const sessionHash = (token: string | undefined) => (token ? sha256(token) : undefined);

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
  // Disabling or changing the role ends every session, so new permissions apply immediately.
  if (fields.disabled || (fields.role && fields.role !== u.role)) getDb().prepare('DELETE FROM sessions WHERE user_id = ?').run(id);
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
  if (user!.role !== 'admin' && getLockdown().on) return { ok: false, error: 'The CMS is in lockdown. Only administrators can sign in right now.' };
  const token = randomBytes(32).toString('base64url');
  const needsOtp = otpRequired();
  // A session that still needs its second factor lives only 10 minutes until the code is entered.
  getDb()
    .prepare('INSERT INTO sessions (id, user_id, expires_at, ip, user_agent, mfa_ok) VALUES (?, ?, ?, ?, ?, ?)')
    .run(sha256(token), user!.id, Date.now() + (needsOtp ? PENDING_MFA_MS : SESSION_ABSOLUTE_MS), meta.ip, meta.userAgent.slice(0, 200), needsOtp ? 0 : 1);
  getDb().prepare('UPDATE sessions SET last_seen = ?, started_at = ? WHERE id = ?').run(Date.now(), Date.now(), sha256(token));
  if (!needsOtp) getDb().prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user!.id);
  return { ok: true, token, user: getUser(user!.id)!, needsOtp };
}

export type SessionEnd = 'idle' | 'expired';
export type ActiveSession = { user: User; mfaOk: boolean; idleEndsAt: number };

/**
 * Resolve a session token. Expired or idle sessions are deleted on sight, and `onEnd` learns why. Unless
 * `touch` is false, a valid session's activity clock is refreshed (status polls pass false so that an
 * open but untouched tab cannot keep a session alive).
 */
export function sessionInfo(token: string | undefined, opts: { touch?: boolean; now?: number; onEnd?: (why: SessionEnd) => void } = {}): ActiveSession | undefined {
  if (!token) return undefined;
  const now = opts.now ?? Date.now();
  const id = sha256(token);
  const row = getDb()
    .prepare('SELECT u.id, u.email, u.name, u.role, u.disabled, u.created_at, u.last_login, s.expires_at, s.mfa_ok, s.last_seen, s.started_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?')
    .get(id) as (User & { expires_at: number; mfa_ok: number; last_seen: number; started_at: number }) | undefined;
  if (!row) return undefined;
  const idle = !!row.mfa_ok && now - row.last_seen > SESSION_IDLE_MS;
  if (row.disabled || row.expires_at < now || now - row.started_at > SESSION_ABSOLUTE_MS || idle) {
    getDb().prepare('DELETE FROM sessions WHERE id = ?').run(id);
    if (!row.disabled) opts.onEnd?.(idle ? 'idle' : 'expired');
    return undefined;
  }
  let lastSeen = row.last_seen;
  if (opts.touch !== false && now - row.last_seen >= TOUCH_EVERY_MS) {
    getDb().prepare('UPDATE sessions SET last_seen = ? WHERE id = ?').run(now, id);
    lastSeen = now;
  }
  const { expires_at, mfa_ok, last_seen, started_at, ...user } = row;
  return { user, mfaOk: !!mfa_ok, idleEndsAt: Math.min(lastSeen + SESSION_IDLE_MS, started_at + SESSION_ABSOLUTE_MS, expires_at) };
}

/** The signed-in user, only once any required second factor has been passed. */
export function userForSession(token: string | undefined): User | undefined {
  const s = sessionInfo(token);
  return s?.mfaOk ? s.user : undefined;
}

/**
 * Second factor passed: replace the pending session with a full session under a NEW token (prevents
 * session fixation). Returns the new token, which the caller must set as the cookie.
 */
export function completeMfa(token: string, userId: number): string {
  const fresh = randomBytes(32).toString('base64url');
  const now = Date.now();
  getDb()
    .prepare('UPDATE sessions SET id = ?, mfa_ok = 1, expires_at = ?, last_seen = ?, started_at = ? WHERE id = ?')
    .run(sha256(fresh), now + SESSION_ABSOLUTE_MS, now, now, sha256(token));
  getDb().prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(userId);
  return fresh;
}

/** Session cookie options: HttpOnly, SameSite=Lax, Secure on HTTPS, never outliving the absolute limit. */
export const sessionCookie = (secure: boolean) => ({ path: '/', httpOnly: true, sameSite: 'lax' as const, secure, maxAge: Math.floor(SESSION_ABSOLUTE_MS / 1000) });

/** Active sessions of a user, for the account page. `id` is the stored hash, never the token. */
export function listSessions(userId: number) {
  return getDb()
    .prepare('SELECT id, ip, user_agent, created_at, last_seen FROM sessions WHERE user_id = ? AND mfa_ok = 1 AND last_seen > ? ORDER BY last_seen DESC')
    .all(userId, Date.now() - SESSION_IDLE_MS) as { id: string; ip: string | null; user_agent: string | null; created_at: string; last_seen: number }[];
}

export function revokeSession(userId: number, sessionId: string) {
  getDb().prepare('DELETE FROM sessions WHERE user_id = ? AND id = ?').run(userId, sessionId);
}

/** Housekeeping: drop sessions past their idle or absolute limit (resolution enforces both anyway). */
export function purgeSessions(now = Date.now()) {
  getDb().prepare('DELETE FROM sessions WHERE expires_at < ? OR (mfa_ok = 1 AND last_seen < ?) OR started_at < ?').run(now, now - SESSION_IDLE_MS, now - SESSION_ABSOLUTE_MS);
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

export const sessionMaxAge = Math.floor(SESSION_ABSOLUTE_MS / 1000);

/* ---------------- invites ---------------- */

export function createInvite(email: string, name: string, role: Role, createdBy: number): string {
  if (getLockdown().on) throw new Error('Invites cannot be created during lockdown.');
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
  // No new accounts while locked down (pending invites are also revoked when lockdown starts).
  if (getLockdown().on) return undefined;
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

/** Record an action. `detail` (e.g. a field diff) is stored as JSON; IP and user agent come from the request context. */
export function audit(userId: number | undefined, action: string, target?: string, detail?: unknown) {
  const { ip, userAgent } = currentRequest();
  getDb()
    .prepare('INSERT INTO audit_log (user_id, action, target, ip, user_agent, detail) VALUES (?, ?, ?, ?, ?, ?)')
    .run(userId ?? null, action, target ?? null, ip ?? null, userAgent?.slice(0, 300) ?? null, detail === undefined ? null : JSON.stringify(detail));
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
