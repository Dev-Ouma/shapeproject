// POST handler shared by the "new" and "edit" admin pages.
import type { AstroGlobal } from 'astro';
import { getCollection, type Collection } from './schema';
import { saveEntry, deleteEntry, entryTitle, getEntry, type Entry } from './content';
import { parseNested } from './forms';
import { audit, can } from './auth';

export type FormState = { values: Record<string, any>; errors: Record<string, string>; slug?: string };

export async function handleEntryPost(Astro: AstroGlobal, c: Collection, entry?: Entry): Promise<Response | FormState> {
  const user = Astro.locals.user!;
  if (c.adminOnly && !can(user, 'admin')) return new Response('Forbidden', { status: 403 });
  const form = await Astro.request.formData();
  const action = String(form.get('_action') ?? 'save');

  if (action === 'delete' && entry && c.kind === 'list') {
    deleteEntry(entry.id);
    audit(user.id, `${c.key}.delete`, entryTitle(c, entry));
    return Astro.redirect(`/admin/content/${c.key}?deleted=1`, 303);
  }

  const raw = parseNested(form);
  const status = action === 'publish' ? 'published' : action === 'draft' ? 'draft' : undefined;
  const r = saveEntry(c.key, { id: entry?.id, raw, status, slug: String(form.get('slug') ?? ''), userId: user.id });
  if (!r.ok) {
    Astro.response.status = 422;
    return { values: raw, errors: r.errors, slug: String(form.get('slug') ?? '') };
  }
  audit(user.id, `${c.key}.${entry ? 'update' : 'create'}${status ? `.${status}` : ''}`, entryTitle(c, r.entry));
  const target = c.kind === 'singleton' ? `/admin/content/${c.key}` : `/admin/content/${c.key}/${r.entry.id}`;
  return Astro.redirect(`${target}?saved=1`, 303);
}

export { getCollection, getEntry };
