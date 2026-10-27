// System switches (maintenance, lockdown) stored in `system_flags`, plus the per-request
// context (IP, user agent) that the audit trail records without threading it through every call.
import { AsyncLocalStorage } from 'node:async_hooks';
import { getDb } from './db';

export type Maintenance = { on: boolean; message: string; until: string; since?: string; by?: number };
export type Lockdown = { on: boolean; freeze: boolean; reason: string; since?: string; by?: number };

function getFlag<T>(key: string, fallback: T): T {
  const r = getDb().prepare('SELECT value FROM system_flags WHERE key = ?').get(key) as { value: string } | undefined;
  if (!r) return fallback;
  try {
    return { ...fallback, ...JSON.parse(r.value) };
  } catch {
    return fallback;
  }
}

function setFlag(key: string, value: unknown, userId?: number) {
  getDb()
    .prepare("INSERT INTO system_flags (key, value, updated_by) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_by = excluded.updated_by, updated_at = datetime('now')")
    .run(key, JSON.stringify(value), userId ?? null);
}

export const getMaintenance = () => getFlag<Maintenance>('maintenance', { on: false, message: '', until: '' });
export const getLockdown = () => getFlag<Lockdown>('lockdown', { on: false, freeze: false, reason: '' });

export function setMaintenance(on: boolean, opts: { message?: string; until?: string } = {}, userId?: number) {
  setFlag('maintenance', { on, message: (opts.message ?? '').slice(0, 500), until: opts.until ?? '', since: on ? new Date().toISOString() : undefined, by: userId }, userId);
}

/**
 * Turn lockdown on: every other session (admins included) is signed out and every unused invite link is
 * revoked, so no new account can appear. Returns what was cut off, for the audit trail.
 */
export function startLockdown(opts: { freeze: boolean; reason?: string }, userId: number, keepSessionHash?: string) {
  const db = getDb();
  setFlag('lockdown', { on: true, freeze: opts.freeze, reason: (opts.reason ?? '').slice(0, 300), since: new Date().toISOString(), by: userId }, userId);
  const sessions = db.prepare('DELETE FROM sessions WHERE id IS NOT ?').run(keepSessionHash ?? null).changes;
  const invites = db.prepare('UPDATE invites SET expires_at = 0 WHERE used_at IS NULL AND expires_at > ?').run(Date.now()).changes;
  return { sessions: Number(sessions), invites: Number(invites) };
}

export function liftLockdown(userId: number) {
  setFlag('lockdown', { on: false, freeze: false, reason: '' }, userId);
}

/** Seconds until the planned end of maintenance (for Retry-After), defaulting to 30 minutes. */
export function retryAfter(m: Maintenance, now = Date.now()): number {
  const t = m.until ? Date.parse(m.until) : NaN;
  return Number.isFinite(t) && t > now ? Math.ceil((t - now) / 1000) : 1800;
}

/* ---------------- request context ---------------- */

export type RequestMeta = { ip?: string; userAgent?: string };
export const requestContext = new AsyncLocalStorage<RequestMeta>();
export const currentRequest = (): RequestMeta => requestContext.getStore() ?? {};

/** Should this public request get the maintenance page? Staff and the health check always pass. */
export function maintenanceBlocks(path: string, signedIn: boolean, m: Maintenance = getMaintenance()): boolean {
  if (!m.on || signedIn) return false;
  return !(path.startsWith('/admin') || path === '/healthz' || path.startsWith('/uploads/'));
}
