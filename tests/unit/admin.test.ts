import { describe, it, expect, beforeEach } from 'vitest';
import { resetDbForTests, getDb } from '../../src/lib/db';
import * as content from '../../src/lib/content';
import * as auth from '../../src/lib/auth';
import * as sys from '../../src/lib/system';
import { listTrash, purgeOlderThan, restoreItem } from '../../src/lib/trash';
import { queryAudit, auditCsv } from '../../src/lib/audit';
import { maintenancePage } from '../../src/lib/maintenance-page';

beforeEach(() => {
  resetDbForTests();
  content.resetContentForTests();
  auth.resetRateLimits();
});

describe('duplicate', () => {
  it('copies an entry with a " (copy)" title, placed last', () => {
    const src = content.listEntries('thematic')[0]!;
    const copy = content.duplicateEntry(src.id)!;
    expect(copy.data.title).toBe(`${src.data.title} (copy)`);
    expect(copy.id).not.toBe(src.id);
    expect(content.listEntries('thematic').at(-1)!.id).toBe(copy.id);
  });

  it('gives slugged entries a unique slug and saves drafts', () => {
    const post = content.listEntries('posts')[0]!;
    const a = content.duplicateEntry(post.id)!;
    const b = content.duplicateEntry(post.id)!;
    expect(a.slug).toBe(`${post.slug}-copy`);
    expect(b.slug).toBe(`${post.slug}-copy-2`);
    expect(a.status).toBe('draft');
    expect(content.loadSite().posts.some((p) => p.slug === a.slug)).toBe(false);
  });

  it('works for every list collection', async () => {
    const { collections } = await import('../../src/lib/schema');
    for (const c of collections.filter((c) => c.kind === 'list')) {
      const e = content.listEntries(c.key, { includeDrafts: true })[0];
      if (e) expect(content.duplicateEntry(e.id), c.key).toBeTruthy();
    }
  });
});

describe('recycle bin', () => {
  it('hides deleted entries from the site and restores them', () => {
    const post = content.listEntries('posts')[0]!;
    expect(content.deleteEntry(post.id, undefined)).toBe(true);
    expect(content.loadSite().posts.some((p) => p.slug === post.slug)).toBe(false);
    expect(content.getEntry(post.id)).toBeUndefined();
    expect(listTrash().map((t) => t.id)).toContain(post.id);
    expect(restoreItem('entry', post.id)).toBe(true);
    expect(content.loadSite().posts.some((p) => p.slug === post.slug)).toBe(true);
  });

  it('purges items older than the retention window only', () => {
    const [a, b] = content.listEntries('facts');
    content.deleteEntry(a!.id);
    content.deleteEntry(b!.id);
    getDb().prepare("UPDATE entries SET deleted_at = datetime('now', '-31 days') WHERE id = ?").run(a!.id);
    expect(purgeOlderThan()).toBe(1);
    expect(listTrash().map((t) => t.id)).toEqual([b!.id]);
    expect(purgeOlderThan(0)).toBe(1);
    expect(listTrash()).toEqual([]);
  });
});

describe('revisions', () => {
  it('records each save and restores an earlier version as a new revision', () => {
    const r1 = content.saveEntry('categories', { raw: { name: 'Alpha' } });
    expect(r1.ok).toBe(true);
    if (!r1.ok) return;
    content.saveEntry('categories', { id: r1.entry.id, raw: { name: 'Beta' } });
    const revs = content.listRevisions(r1.entry.id);
    expect(revs.map((r) => r.data.name)).toEqual(['Beta', 'Alpha']);
    expect(content.diffData(revs[1]!.data, revs[0]!.data)).toEqual([{ field: 'name', before: 'Alpha', after: 'Beta' }]);
    const restored = content.restoreRevision(r1.entry.id, revs[1]!.id)!;
    expect(restored.data.name).toBe('Alpha');
    expect(content.listRevisions(r1.entry.id)).toHaveLength(3);
  });
});

describe('maintenance', () => {
  it('blocks anonymous visitors but lets staff, admin and the health check through', () => {
    expect(sys.maintenanceBlocks('/', false)).toBe(false);
    sys.setMaintenance(true, { message: 'Upgrading <servers>', until: new Date(Date.now() + 600e3).toISOString() });
    const m = sys.getMaintenance();
    expect(sys.maintenanceBlocks('/', false, m)).toBe(true);
    expect(sys.maintenanceBlocks('/', true, m)).toBe(false);
    expect(sys.maintenanceBlocks('/admin/login', false, m)).toBe(false);
    expect(sys.maintenanceBlocks('/healthz', false, m)).toBe(false);
    expect(sys.retryAfter(m)).toBeGreaterThan(500);
    expect(maintenancePage(m)).toContain('Upgrading &lt;servers&gt;');
    sys.setMaintenance(false);
    expect(sys.getMaintenance().on).toBe(false);
  });
});

describe('lockdown', () => {
  it('signs out other sessions and refuses editor logins until lifted', () => {
    const admin = auth.createUser('a@x.org', 'A', 'admin', 'Admin-pass-12345');
    auth.createUser('e@x.org', 'E', 'editor', 'Editor-pass-12345');
    const meta = { ip: '1.1.1.1', userAgent: 'test' };
    const mine = auth.login('a@x.org', 'Admin-pass-12345', meta);
    const ed = auth.login('e@x.org', 'Editor-pass-12345', meta);
    if (!mine.ok || !ed.ok) throw new Error('login failed');
    sys.startLockdown({ freeze: true }, admin, auth.sessionHash(mine.token));
    expect(auth.sessionInfo(mine.token)).toBeTruthy();
    expect(auth.sessionInfo(ed.token)).toBeUndefined();
    const again = auth.login('e@x.org', 'Editor-pass-12345', meta);
    expect(again.ok).toBe(false);
    expect(auth.login('a@x.org', 'Admin-pass-12345', meta).ok).toBe(true);
    sys.liftLockdown(admin);
    expect(auth.login('e@x.org', 'Editor-pass-12345', meta).ok).toBe(true);
  });
});

describe('release notes', () => {
  it('seeds one published release and supports create, publish and version validation', () => {
    expect(content.listEntries('releases').map((r) => r.data.version)).toEqual(['1.4.0']);
    const bad = content.saveEntry('releases', { raw: { version: 'v2', title: 'X', date: '2026-11-01', notes: '<p>x</p>' } });
    expect(bad.ok).toBe(false);
    const r = content.saveEntry('releases', { raw: { version: '1.5.0', title: 'Next', date: '2099-01-01', notes: '<p>Hi</p>' }, status: 'draft' });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(content.listEntries('releases')).toHaveLength(1);
    content.saveEntry('releases', { id: r.entry.id, raw: r.entry.data, status: 'published' });
    expect(content.listEntries('releases')[0]!.data.version).toBe('1.5.0');
  });
});

describe('audit trail', () => {
  it('stores detail and request metadata and filters by area, verb and search', () => {
    sys.requestContext.run({ ip: '9.9.9.9', userAgent: 'UA' }, () => auth.audit(undefined, 'posts.update.published', 'Hello', { changes: [] }));
    auth.audit(undefined, 'media.delete', 'pic.png');
    expect(queryAudit({ area: 'posts' }).rows[0]).toMatchObject({ ip: '9.9.9.9', user_agent: 'UA', target: 'Hello' });
    expect(queryAudit({ verb: 'delete' }).total).toBe(1);
    expect(queryAudit({ q: 'pic' }).total).toBe(1);
    expect(auditCsv({})).toContain('"media.delete"');
  });
});
