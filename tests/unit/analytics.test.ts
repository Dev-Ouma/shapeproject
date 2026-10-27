import { describe, it, expect, beforeEach } from 'vitest';
import { resetDbForTests, getDb } from '../../src/lib/db';
import * as an from '../../src/lib/analytics';
import { smoothPath, niceTicks, delta, duration } from '../../src/lib/charts';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const PHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const ctx = (over: Partial<Parameters<typeof an.record>[1]> = {}) => ({ ip: '41.90.1.2', ua: UA, lang: 'en-KE,en;q=0.9', host: 'shapeproject.ouk.ac.ke', ...over });
const rows = () => getDb().prepare('SELECT * FROM analytics_events ORDER BY id').all() as Record<string, any>[];

describe('analytics collection', () => {
  beforeEach(() => resetDbForTests());

  it('records a page view with device, browser, referrer host and language', () => {
    expect(an.record({ type: 'pageview', path: '/events/', title: 'Events', ref: 'https://www.google.com/search?q=shape' }, ctx())).toBe(true);
    expect(rows()[0]).toMatchObject({ type: 'pageview', path: '/events/', device: 'Desktop', browser: 'Chrome', os: 'Windows', ref: 'google.com', lang: 'en-KE' });
  });

  it('never stores the IP address or raw user agent', () => {
    an.record({ type: 'pageview', path: '/' }, ctx());
    const stored = JSON.stringify(rows());
    expect(stored).not.toContain('41.90.1.2');
    expect(stored).not.toContain('Mozilla');
  });

  it('drops bots, unknown types, admin and API paths, and off-site paths', () => {
    expect(an.record({ type: 'pageview', path: '/' }, ctx({ ua: 'Googlebot/2.1' }))).toBe(false);
    expect(an.record({ type: 'pageview', path: '/' }, ctx({ ua: '' }))).toBe(false);
    expect(an.record({ type: 'hack', path: '/' }, ctx())).toBe(false);
    expect(an.record({ type: 'pageview', path: '/admin/users' }, ctx())).toBe(false);
    expect(an.record({ type: 'pageview', path: '/api/collect' }, ctx())).toBe(false);
    expect(an.record({ type: 'pageview', path: '//evil.example/x' }, ctx())).toBe(false);
    expect(an.record({ type: 'pageview', path: 'https://evil.example/' }, ctx())).toBe(false);
    expect(rows()).toHaveLength(0);
  });

  it('strips query strings from paths and keeps own-site referrers out', () => {
    an.record({ type: 'pageview', path: '/contact/?email=someone@example.org#x', ref: 'https://shapeproject.ouk.ac.ke/' }, ctx());
    expect(rows()[0]).toMatchObject({ path: '/contact/', ref: null });
  });

  it('reduces contact links to their kind and outbound links to host + path', () => {
    an.record({ type: 'contact', path: '/', target: 'mailto:shape@ouk.ac.ke' }, ctx());
    an.record({ type: 'outbound', path: '/', target: 'https://www.ouk.ac.ke/about?ref=1' }, ctx());
    an.record({ type: 'outbound', path: '/', target: 'javascript:alert(1)' }, ctx());
    expect(rows().map((r) => r.target)).toEqual(['email', 'ouk.ac.ke/about', null]);
  });

  it('clips oversized and control-character input', () => {
    an.record({ type: 'click', path: '/', label: 'x\u0000y'.repeat(200), title: 't'.repeat(999) }, ctx());
    const r = rows()[0]!;
    expect(r.label.length).toBeLessThanOrEqual(100);
    expect(r.label).not.toContain('\u0000');
    expect(r.title.length).toBe(160);
  });

  it('caps engaged time and ignores non-numeric values', () => {
    an.record({ type: 'leave', path: '/', value: 1e12 }, ctx());
    an.record({ type: 'leave', path: '/', value: 'abc' }, ctx());
    an.record({ type: 'leave', path: '/', value: -5 }, ctx());
    expect(rows().map((r) => r.value)).toEqual([6 * 3600_000, null, 0]);
  });

  it('gives the same visitor one id per day but an unlinkable id the next day', () => {
    const a = an.visitorId('1.1.1.1', UA, '2026-10-26');
    expect(an.visitorId('1.1.1.1', UA, '2026-10-26')).toBe(a);
    expect(an.visitorId('1.1.1.1', UA, '2026-10-27')).not.toBe(a);
    expect(an.visitorId('1.1.1.2', UA, '2026-10-26')).not.toBe(a);
  });

  it('destroys salts older than yesterday', () => {
    an.visitorId('1.1.1.1', UA, '2026-10-20');
    an.visitorId('1.1.1.1', UA, '2026-10-27');
    const days = (getDb().prepare('SELECT day FROM analytics_salts ORDER BY day').all() as { day: string }[]).map((d) => d.day);
    expect(days).toEqual(['2026-10-27']);
  });

  it('starts a new session after 30 minutes of inactivity', () => {
    const t0 = new Date('2026-10-26T08:00:00Z');
    an.record({ type: 'pageview', path: '/' }, ctx({ now: t0 }));
    an.record({ type: 'pageview', path: '/about/' }, ctx({ now: new Date(t0.getTime() + 10 * 60_000) }));
    an.record({ type: 'pageview', path: '/events/' }, ctx({ now: new Date(t0.getTime() + 50 * 60_000) }));
    const s = rows().map((r) => r.session);
    expect(s[0]).toBe(s[1]);
    expect(s[2]).not.toBe(s[1]);
  });

  it('rate-limits a single visitor to 600 events an hour', () => {
    const now = new Date('2026-10-26T09:00:00Z');
    let ok = 0;
    for (let i = 0; i < 620; i++) if (an.record({ type: 'click', path: '/' }, ctx({ ip: '9.9.9.9', now }))) ok++;
    expect(ok).toBe(600);
  });

  it('trusts forwarded addresses only from the local proxy', () => {
    const req = new Request('http://x/', { headers: { 'x-real-ip': '41.1.1.1' } });
    expect(an.clientIp(req, '127.0.0.1')).toBe('41.1.1.1');
    expect(an.clientIp(req, '203.0.113.9')).toBe('203.0.113.9');
  });

  it('detects phones and tablets', () => {
    expect(an.parseUA(PHONE)).toMatchObject({ device: 'Mobile', os: 'iOS', browser: 'Safari' });
    expect(an.parseUA('Mozilla/5.0 (Linux; Android 13; SM-X200) AppleWebKit/537.36 Chrome/120 Safari/537.36').device).toBe('Tablet');
  });
});

describe('analytics reporting', () => {
  beforeEach(() => resetDbForTests());

  it('summarises visitors, page views, bounce rate, engaged time, clicks and searches', () => {
    const now = new Date();
    an.record({ type: 'pageview', path: '/' }, ctx({ now }));
    an.record({ type: 'pageview', path: '/about/' }, ctx({ now }));
    an.record({ type: 'leave', path: '/about/', value: 4000 }, ctx({ now }));
    an.record({ type: 'pageview', path: '/' }, ctx({ ip: '5.5.5.5', ua: PHONE, now }));
    an.record({ type: 'click', path: '/', label: 'Learn more', target: '/about/' }, ctx({ now }));
    an.record({ type: 'search', path: '/search/', label: 'Curriculum', value: 0 }, ctx({ now }));
    const s = an.summary(an.rangeFor(7).cur);
    expect(s).toMatchObject({ visitors: 2, pageviews: 3, sessions: 2, clicks: 1, searches: 1, avgEngagedMs: 4000 });
    expect(s.bounceRate).toBe(0.5);
    expect(an.zeroResultSearches(an.rangeFor(7).cur)[0]).toEqual({ term: 'curriculum', searches: 1 });
    expect(an.breakdown(an.rangeFor(7).cur, 'device').map((d) => d.label).sort()).toEqual(['Desktop', 'Mobile']);
  });

  it('zero-fills every day of the range', () => {
    const d = an.daily(an.rangeFor(30).cur);
    expect(d).toHaveLength(30);
    expect(d.every((p) => p.pageviews === 0)).toBe(true);
  });

  it('returns empty, well-formed results with no data', () => {
    const r = an.rangeFor(7).cur;
    expect(an.summary(r)).toMatchObject({ visitors: 0, pageviews: 0, bounceRate: 0, avgEngagedMs: 0 });
    expect(an.heatmap(r).flat().every((n) => n === 0)).toBe(true);
    expect(an.topPages(r)).toEqual([]);
  });
});

describe('chart helpers', () => {
  it('draws a smooth curve that never overshoots monotone data', () => {
    const d = smoothPath([[0, 100], [10, 50], [20, 50], [30, 0]]);
    const ys = [...d.matchAll(/[ ,C]?(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map((m) => Number(m[2]));
    expect(Math.max(...ys)).toBeLessThanOrEqual(100);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(d.startsWith('M0,100C')).toBe(true);
  });

  it('handles empty and single-point series', () => {
    expect(smoothPath([])).toBe('');
    expect(smoothPath([[5, 5]])).toBe('M5,5');
  });

  it('picks nice ticks and formats deltas and durations', () => {
    expect(niceTicks(0)).toEqual([0, 1]);
    expect(niceTicks(87)).toEqual([0, 25, 50, 75, 100]);
    expect(delta(10, 0)).toBeNull();
    expect(delta(15, 10)).toBe(0.5);
    expect(duration(65_000)).toBe('1m 05s');
  });
});
