import { describe, it, expect, beforeEach } from 'vitest';
import { resetDbForTests } from '../../src/lib/db';
import * as auth from '../../src/lib/auth';

const meta = { ip: '1.2.3.4', userAgent: 'Mozilla/5.0 Chrome/130' };
const MIN = 60_000;

function signIn(email = 's@x.org') {
  if (!auth.findUserByEmail(email)) auth.createUser(email, 'S', 'editor', 'Session-pass-123');
  const r = auth.login(email, 'Session-pass-123', meta);
  if (!r.ok) throw new Error('login failed');
  return r;
}

describe('session policy', () => {
  beforeEach(() => { resetDbForTests(); auth.resetRateLimits(); });

  it('signs out after 60 minutes without activity and says why', () => {
    const { token } = signIn();
    const t0 = Date.now();
    expect(auth.sessionInfo(token, { now: t0 + 59 * MIN })).toBeTruthy();
    let why: string | undefined;
    expect(auth.sessionInfo(token, { now: t0 + 59 * MIN + 61 * MIN, onEnd: (w) => (why = w) })).toBeUndefined();
    expect(why).toBe('idle');
    // Deleted, not just hidden.
    expect(auth.sessionInfo(token)).toBeUndefined();
  });

  it('activity slides the idle deadline forward', () => {
    const { token } = signIn();
    const t0 = Date.now();
    for (let m = 50; m <= 300; m += 50) expect(auth.sessionInfo(token, { now: t0 + m * MIN })).toBeTruthy();
  });

  it('status checks without touch do not keep a session alive', () => {
    const { token } = signIn();
    const t0 = Date.now();
    auth.sessionInfo(token, { now: t0 + 40 * MIN, touch: false });
    expect(auth.sessionInfo(token, { now: t0 + 61 * MIN, touch: false })).toBeUndefined();
  });

  it('ends after the absolute limit even with constant activity', () => {
    const { token } = signIn();
    const t0 = Date.now();
    for (let m = 30; m < 12 * 60; m += 30) expect(auth.sessionInfo(token, { now: t0 + m * MIN })).toBeTruthy();
    let why: string | undefined;
    expect(auth.sessionInfo(token, { now: t0 + 12 * 60 * MIN + MIN, onEnd: (w) => (why = w) })).toBeUndefined();
    expect(why).toBe('expired');
  });

  it('reports when the idle deadline falls', () => {
    const { token } = signIn();
    const s = auth.sessionInfo(token)!;
    expect(s.idleEndsAt - Date.now()).toBeGreaterThan(59 * MIN);
    expect(s.idleEndsAt - Date.now()).toBeLessThanOrEqual(60 * MIN);
  });

  it('a role change or disabling ends every session of that user', () => {
    const a = signIn('r@x.org');
    const id = a.user.id;
    auth.updateUser(id, { role: 'admin' });
    expect(auth.sessionInfo(a.token)).toBeUndefined();
    const b = signIn('r@x.org');
    auth.updateUser(id, { name: 'Renamed' });
    expect(auth.sessionInfo(b.token)).toBeTruthy();
    auth.updateUser(id, { disabled: true });
    expect(auth.sessionInfo(b.token)).toBeUndefined();
  });

  it('lists and revokes sessions by their stored hash, never exposing tokens', () => {
    const one = signIn();
    const two = signIn();
    const list = auth.listSessions(one.user.id);
    expect(list).toHaveLength(2);
    expect(JSON.stringify(list)).not.toContain(one.token);
    auth.revokeSession(one.user.id, auth.sessionHash(two.token)!);
    expect(auth.sessionInfo(two.token)).toBeUndefined();
    expect(auth.sessionInfo(one.token)).toBeTruthy();
  });

  it('cookie options are HttpOnly, SameSite=Lax, Secure on HTTPS and capped at the absolute limit', () => {
    expect(auth.sessionCookie(true)).toEqual({ path: '/', httpOnly: true, sameSite: 'lax', secure: true, maxAge: 12 * 3600 });
  });
});
