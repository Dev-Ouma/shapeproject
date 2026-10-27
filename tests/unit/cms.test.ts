import { describe, it, expect, beforeEach } from 'vitest';
import { resetDbForTests } from '../../src/lib/db';
import { slugify, validateFields, getCollection } from '../../src/lib/schema';
import { parseNested } from '../../src/lib/forms';
import { sanitizeRichText, plainText } from '../../src/lib/sanitize';
import { projectMonth, wpStatus, wpProgress } from '../../src/lib/status';
import * as content from '../../src/lib/content';
import * as auth from '../../src/lib/auth';
import * as eng from '../../src/lib/engagement';

describe('schema', () => {
  it('slugifies titles', () => {
    expect(slugify('SHAPE Project Officially Launches: A New Partnership!')).toBe('shape-project-officially-launches-a-new-partnership');
    expect(slugify('Université du Burundi & Co')).toBe('universite-du-burundi-and-co');
    expect(slugify('   ')).toBe('');
  });

  it('validates required, email, url, colour and number ranges', () => {
    const c = getCollection('workpackages')!;
    const r = validateFields(c.fields, { wp: '0', title: '', summary: 'x', lead: 'Moi University', start: '1', end: '999', color: 'teal', tint: '#ffffff' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.wp).toMatch(/at least 1/);
      expect(r.errors.title).toBe('Required');
      expect(r.errors.end).toMatch(/at most/);
      expect(r.errors.color).toMatch(/hex/);
    }
    const s = getCollection('settings')!;
    const r2 = validateFields(s.fields, { phone: '1', email: 'nope', socials: [{ name: 'X', href: 'ftp://x', icon: 'x' }], footerText: 'f', disclaimer: 'd', projectStart: '2025-01-01', projectMonths: '36' });
    expect(r2.ok).toBe(false);
    if (!r2.ok) {
      expect(r2.errors.email).toBe('Invalid email');
      expect(r2.errors['socials.0.href']).toMatch(/http/);
    }
  });

  it('coerces booleans from checkbox + hidden pairs and tags from text', () => {
    const r = validateFields([{ name: 'b', label: 'B', type: 'boolean' }, { name: 't', label: 'T', type: 'tags' }], { b: ['false', 'true'], t: 'Kenya, Mombasa ,Kenya, ' });
    expect(r.ok && r.data).toEqual({ b: true, t: ['Kenya', 'Mombasa'] });
  });

  it('rejects select values outside the allowed options', () => {
    const r = validateFields([{ name: 's', label: 'S', type: 'select', options: ['A', 'B'], required: true }], { s: 'C' });
    expect(r.ok).toBe(false);
  });
});

describe('forms', () => {
  it('parses bracketed names into nested objects and ordered lists', () => {
    const fd = new FormData();
    fd.append('data[title]', 'Hello');
    fd.append('data[deliverables][n2][code]', 'D1.2');
    fd.append('data[deliverables][0][code]', 'D1.1');
    fd.append('data[categories][]', 'News');
    fd.append('data[categories][]', 'Events');
    fd.append('other', 'ignored');
    const out = parseNested(fd) as any;
    expect(out.title).toBe('Hello');
    expect(out.categories).toEqual(['News', 'Events']);
    expect(Object.keys(out.deliverables).length).toBe(2);
  });
});

describe('sanitize', () => {
  it('strips scripts, event handlers and javascript: links but keeps gallery markup', () => {
    const html = sanitizeRichText('<p onclick="x()">Hi<script>alert(1)</script></p><a href="javascript:alert(1)">bad</a><figure class="wp-block-gallery evil"><img src="/a.jpg" onerror="x"></figure>');
    expect(html).not.toMatch(/script|onclick|onerror|javascript:/);
    expect(html).toContain('class="wp-block-gallery"');
    expect(html).toContain('<img src="/a.jpg"');
  });
  it('opens external links safely', () => {
    expect(sanitizeRichText('<a href="https://example.org">x</a>')).toContain('rel="noopener noreferrer"');
  });
  it('plainText removes all tags', () => {
    expect(plainText('<b>hi</b><img src=x onerror=alert(1)>')).toBe('hi');
  });
});

describe('status', () => {
  it('computes project month from the start date, clamped', () => {
    expect(projectMonth('2025-01-01', 36, new Date('2025-01-15T00:00:00Z'))).toBe(1);
    expect(projectMonth('2025-01-01', 36, new Date('2026-10-26T00:00:00Z'))).toBe(22);
    expect(projectMonth('2025-01-01', 36, new Date('2030-01-01T00:00:00Z'))).toBe(36);
    expect(projectMonth('2025-01-01', 36, new Date('2024-06-01T00:00:00Z'))).toBe(1);
  });
  it('derives work-package status and progress', () => {
    expect(wpStatus({ start: 2, end: 12 }, 22)).toBe('done');
    expect(wpStatus({ start: 25, end: 34 }, 22)).toBe('upcoming');
    expect(wpStatus({ start: 1, end: 36 }, 22)).toBe('progress');
    expect(wpProgress({ start: 1, end: 36 }, 22)).toBe(60);
    expect(wpProgress({ start: 2, end: 12 }, 22)).toBe(100);
  });
});

describe('content store (in-memory DB)', () => {
  beforeEach(() => { resetDbForTests(); content.resetContentForTests(); });

  it('seeds the database with the original site content', () => {
    const site = content.loadSite();
    expect(site.partners).toHaveLength(9);
    expect(site.workPackages).toHaveLength(5);
    expect(site.posts.map((p) => p.slug)).toContain('shape-project-officially-launches');
    expect(site.coordinator?.name).toBe('Prof. Kirimi Kiriamiti');
  });

  it('creates drafts that stay off the public site until published, with unique slugs', () => {
    const base = { title: 'Launch News', date: new Date('2026-01-01').toISOString(), content: '<p>x</p>' };
    const a = content.saveEntry('posts', { raw: base, status: 'draft' });
    const b = content.saveEntry('posts', { raw: base, status: 'draft' });
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.entry.slug).toBe('launch-news');
    expect(b.entry.slug).toBe('launch-news-2');
    expect(content.loadSite().posts.some((p) => p.slug === 'launch-news')).toBe(false);
    content.saveEntry('posts', { id: a.entry.id, raw: base, status: 'published' });
    expect(content.loadSite().posts.some((p) => p.slug === 'launch-news')).toBe(true);
  });

  it('hides future-dated (scheduled) posts', () => {
    const r = content.saveEntry('posts', { raw: { title: 'Future', date: new Date(Date.now() + 864e5).toISOString(), content: '<p>x</p>' }, status: 'published' });
    expect(r.ok).toBe(true);
    expect(content.loadSite().posts.some((p) => p.title === 'Future')).toBe(false);
  });

  it('sanitises rich text on save', () => {
    const r = content.saveEntry('posts', { raw: { title: 'XSS', date: new Date().toISOString(), content: '<p>ok</p><script>alert(1)</script>' }, status: 'published' });
    expect(r.ok && r.entry.data.content).toBe('<p>ok</p>');
  });

  it('reorders list entries', () => {
    const ids = content.listEntries('facts').map((e) => e.id);
    content.reorder('facts', [...ids].reverse());
    expect(content.listEntries('facts').map((e) => e.id)).toEqual([...ids].reverse());
  });
});

describe('auth', () => {
  beforeEach(() => { resetDbForTests(); auth.resetRateLimits(); });

  it('hashes and verifies passwords', () => {
    const h = auth.hashPassword('correct horse 123');
    expect(auth.verifyPassword('correct horse 123', h)).toBe(true);
    expect(auth.verifyPassword('wrong', h)).toBe(false);
    expect(auth.verifyPassword('x', null)).toBe(false);
  });

  it('enforces password strength', () => {
    expect(auth.passwordProblem('short1')).toBeTruthy();
    expect(auth.passwordProblem('onlyletterslong')).toBeTruthy();
    expect(auth.passwordProblem('letters-and-123')).toBeNull();
  });

  it('logs in, resolves sessions, logs out, and locks after repeated failures', () => {
    auth.createUser('a@b.org', 'A', 'editor', 'letters-and-123');
    const meta = { ip: '1.2.3.4', userAgent: 'test' };
    const ok = auth.login('A@B.org', 'letters-and-123', meta);
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(auth.userForSession(ok.token)?.email).toBe('a@b.org');
    auth.logout(ok.token);
    expect(auth.userForSession(ok.token)).toBeUndefined();
    for (let i = 0; i < 5; i++) expect(auth.login('a@b.org', 'bad', meta).ok).toBe(false);
    const locked = auth.login('a@b.org', 'letters-and-123', meta);
    expect(locked.ok).toBe(false);
    if (!locked.ok) expect(locked.error).toMatch(/Too many attempts/);
  });

  it('disabled users cannot log in and their sessions end', () => {
    const id = auth.createUser('d@b.org', 'D', 'editor', 'letters-and-123');
    const r = auth.login('d@b.org', 'letters-and-123', { ip: '1', userAgent: '' });
    auth.updateUser(id, { disabled: true });
    if (r.ok) expect(auth.userForSession(r.token)).toBeUndefined();
    expect(auth.login('d@b.org', 'letters-and-123', { ip: '2', userAgent: '' }).ok).toBe(false);
  });

  it('invites are single use', () => {
    const admin = auth.createUser('admin@b.org', 'Admin', 'admin', 'letters-and-123');
    const token = auth.createInvite('new@b.org', 'New', 'editor', admin);
    expect(auth.getInvite(token)?.email).toBe('new@b.org');
    expect(auth.acceptInvite(token, 'letters-and-456')?.role).toBe('editor');
    expect(auth.getInvite(token)).toBeUndefined();
    expect(auth.acceptInvite(token, 'letters-and-456')).toBeUndefined();
  });

  it('role checks', () => {
    const u = { id: 1, email: '', name: '', role: 'editor' as const, disabled: 0, created_at: '', last_login: null };
    expect(auth.can(u, 'content')).toBe(true);
    expect(auth.can(u, 'admin')).toBe(false);
    expect(auth.can({ ...u, role: 'admin' }, 'admin')).toBe(true);
  });
});

describe('engagement', () => {
  beforeEach(() => { resetDbForTests(); eng.resetThrottle(); });

  it('stores comments as pending and only shows approved ones', () => {
    const r = eng.addComment({ post: 'p', author: '<b>Ann</b>', email: 'ann@x.org', body: 'Hello <script>x</script>', ip: '1' });
    expect(r.ok).toBe(true);
    expect(eng.approvedComments('p')).toHaveLength(0);
    if (r.ok) eng.setCommentStatus(r.id, 'approved');
    const [c] = eng.approvedComments('p');
    expect(c.author).toBe('Ann');
    expect(c.body).toBe('Hello');
  });

  it('stores literal text for messages: markup stripped, characters not entity-encoded', async () => {
    const { addMessage, getMessage } = await import('../../src/lib/engagement');
    const r = addMessage({ name: 'Q&A Desk', email: 'qa@example.org', subject: 'Fees < 5 & "dates"', body: "It's <b>fine</b> & <script>x()</script>ok" });
    if (!r.ok) throw new Error('setup');
    const m = getMessage(r.id)!;
    expect(m.name).toBe('Q&A Desk');
    expect(m.subject).toBe('Fees < 5 & "dates"');
    expect(m.body).toBe("It's fine & ok");
  });

  it('keeps an inbox: folders, search, star, archive and recorded replies', async () => {
    const { addMessage, listMessages, folderCounts, setStarred, setArchived, addReply, listReplies, countUnreadMessages, markAllRead } = await import('../../src/lib/engagement');
    const a = addMessage({ name: 'Inbox Tester', email: 'inbox@example.org', subject: 'Inbox subject one', body: 'Body about curricula' });
    const b = addMessage({ name: 'Second Sender', email: 'second@example.org', subject: 'Inbox subject two', body: 'Another body' });
    if (!a.ok || !b.ok) throw new Error('setup');
    expect(listMessages('inbox', 'curricula').map((m) => m.id)).toEqual([a.id]);
    setStarred(a.id, true);
    setArchived(b.id, true);
    expect(listMessages('starred').some((m) => m.id === a.id)).toBe(true);
    expect(listMessages('inbox').some((m) => m.id === b.id)).toBe(false);
    expect(listMessages('archived').some((m) => m.id === b.id)).toBe(true);
    const unreadBefore = countUnreadMessages();
    expect(folderCounts().unread).toBe(unreadBefore);
    const { createUser } = await import('../../src/lib/auth');
    const uid = createUser('inbox-replier@test.local', 'Replier', 'editor', 'a-long-enough-password');
    addReply(a.id, uid, 'Thanks!', 'logged');
    expect(listReplies(a.id)[0]).toMatchObject({ body: 'Thanks!', status: 'logged' });
    expect(listMessages('inbox').find((m) => m.id === a.id)?.replies).toBe(1);
    expect(listMessages('inbox', "x' OR 1=1 --")).toEqual([]);
    markAllRead();
    expect(countUnreadMessages()).toBe(0);
  });

  it('rejects invalid comments and messages', () => {
    expect(eng.addComment({ post: 'p', author: '', email: 'x', body: '', ip: '1' }).ok).toBe(false);
    expect(eng.addMessage({ name: 'a', email: 'bad', subject: 's', body: 'b' }).ok).toBe(false);
  });

  it('throttles bursts from one IP', () => {
    for (let i = 0; i < 5; i++) expect(eng.throttled('9.9.9.9')).toBe(false);
    expect(eng.throttled('9.9.9.9')).toBe(true);
  });
});

import * as otp from '../../src/lib/otp';

describe('one-time passwords', () => {
  beforeEach(() => { resetDbForTests(); content.resetContentForTests(); });

  it('matches the RFC 6238 test vector and round-trips base32', () => {
    const secret = otp.base32Encode(Buffer.from('12345678901234567890'));
    expect(secret).toBe('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
    expect(otp.base32Decode(secret).toString()).toBe('12345678901234567890');
    expect(otp.totpAt(secret, 1)).toBe('287082'); // T = 59 s
    expect(otp.totpAt(secret, 37037036)).toBe('081804'); // T = 1111111109 s
  });

  it('accepts ±1 step of clock drift only', () => {
    const s = otp.generateSecret();
    const now = Date.now();
    const step = otp.currentStep(now);
    expect(otp.verifyTotp(s, otp.totpAt(s, step), now)).toBe(step);
    expect(otp.verifyTotp(s, otp.totpAt(s, step - 1), now)).toBe(step - 1);
    expect(otp.verifyTotp(s, otp.totpAt(s, step + 5), now)).toBeNull();
    expect(otp.verifyTotp(s, 'abcdef', now)).toBeNull();
  });

  it('enrols, blocks code replay, and uses recovery codes once', () => {
    const id = auth.createUser('o@b.org', 'O', 'admin', 'letters-and-123');
    const secret = otp.beginEnrolment(id);
    expect(otp.otpEnabled(id)).toBe(false);
    expect(otp.confirmEnrolment(id, '000000')).toBeNull();
    const step = otp.currentStep();
    const codes = otp.confirmEnrolment(id, otp.totpAt(secret, step - 1));
    expect(codes).toHaveLength(8);
    expect(otp.otpEnabled(id)).toBe(true);
    // The enrolment code cannot be replayed; a newer one works once.
    expect(otp.verifyLoginCode(id, otp.totpAt(secret, step - 1))).toBeNull();
    expect(otp.verifyLoginCode(id, otp.totpAt(secret, step))).toBe('totp');
    expect(otp.verifyLoginCode(id, otp.totpAt(secret, step))).toBeNull();
    expect(otp.verifyLoginCode(id, codes![0])).toBe('recovery');
    expect(otp.verifyLoginCode(id, codes![0])).toBeNull();
    expect(otp.recoveryCodesLeft(id)).toBe(7);
    otp.resetOtp(id);
    expect(otp.otpEnabled(id)).toBe(false);
  });

  it('sessions stay pending until the second factor is completed', () => {
    process.env.REQUIRE_OTP = 'true';
    try {
      auth.createUser('p@b.org', 'P', 'editor', 'letters-and-123');
      const r = auth.login('p@b.org', 'letters-and-123', { ip: '7', userAgent: '' });
      expect(r.ok && r.needsOtp).toBe(true);
      if (!r.ok) return;
      expect(auth.userForSession(r.token)).toBeUndefined();
      expect(auth.sessionInfo(r.token)?.mfaOk).toBe(false);
      const fresh = auth.completeMfa(r.token, r.user.id);
      // The token is rotated: the pre-OTP token is dead, the new one is a full session.
      expect(auth.sessionInfo(r.token)).toBeUndefined();
      expect(auth.userForSession(fresh)?.email).toBe('p@b.org');
    } finally {
      process.env.REQUIRE_OTP = 'false';
    }
  });
});
