// POST handler shared by the "new" and "edit" admin pages.
import type { AstroGlobal } from 'astro';
import { getCollection, type Collection } from './schema';
import { saveEntry, deleteEntry, duplicateEntry, restoreRevision, diffData, entryTitle, getEntry, type Entry } from './content';
import { parseNested } from './forms';
import { audit, can } from './auth';

export type FormState = { values: Record<string, any>; errors: Record<string, string>; slug?: string };

export async function handleEntryPost(Astro: AstroGlobal, c: Collection, entry?: Entry): Promise<Response | FormState> {
  const user = Astro.locals.user!;
  if (c.adminOnly && !can(user, 'admin')) return new Response('Forbidden', { status: 403 });
  const form = await Astro.request.formData();
  const action = String(form.get('_action') ?? 'save');

  if (action === 'delete' && entry && c.kind === 'list') {
    deleteEntry(entry.id, user.id);
    audit(user.id, `${c.key}.delete`, entryTitle(c, entry), { id: entry.id });
    return Astro.redirect(`/admin/content/${c.key}?deleted=${entry.id}`, 303);
  }
  if (action === 'duplicate' && entry && c.kind === 'list') {
    const copy = duplicateEntry(entry.id, user.id);
    if (!copy) return new Response('Could not duplicate', { status: 400 });
    audit(user.id, `${c.key}.duplicate`, entryTitle(c, copy), { from: entry.id, id: copy.id });
    return Astro.redirect(`/admin/content/${c.key}/${copy.id}?duplicated=1`, 303);
  }
  if (action === 'restore-revision' && entry) {
    const rev = Number(form.get('rev'));
    const restored = restoreRevision(entry.id, rev, user.id);
    if (!restored) return new Response('Revision not found', { status: 404 });
    audit(user.id, `${c.key}.restore-revision`, entryTitle(c, restored), { id: entry.id, revision: rev, changes: diffData(entry.data, restored.data) });
    const target = c.kind === 'singleton' ? `/admin/content/${c.key}` : `/admin/content/${c.key}/${entry.id}`;
    return Astro.redirect(`${target}?restored=${rev}`, 303);
  }

  const raw = parseNested(form);
  const status = action === 'publish' ? 'published' : action === 'draft' ? 'draft' : undefined;
  const r = saveEntry(c.key, { id: entry?.id, raw, status, slug: String(form.get('slug') ?? ''), userId: user.id });
  if (!r.ok) {
    Astro.response.status = 422;
    return { values: raw, errors: r.errors, slug: String(form.get('slug') ?? '') };
  }
  const changes = diffData(entry?.data, r.entry.data);
  if (entry && entry.status !== r.entry.status) changes.push({ field: '(status)', before: entry.status, after: r.entry.status });
  audit(user.id, `${c.key}.${entry ? 'update' : 'create'}${status ? `.${status}` : ''}`, entryTitle(c, r.entry), { id: r.entry.id, changes });
  const target = c.kind === 'singleton' ? `/admin/content/${c.key}` : `/admin/content/${c.key}/${r.entry.id}`;
  return Astro.redirect(`${target}?saved=1`, 303);
}

export { getCollection, getEntry };
