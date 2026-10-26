import type { APIRoute } from 'astro';
import { getCollection } from '../../../lib/schema';
import { reorder } from '../../../lib/content';
import { sameOrigin } from '../../../lib/admin';
import { audit, can } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, url, locals }) => {
  if (!locals.user || !sameOrigin(request, url)) return new Response('Forbidden', { status: 403 });
  const body = await request.json().catch(() => null);
  const c = getCollection(String(body?.collection ?? ''));
  if (!c?.sortable || !Array.isArray(body.ids) || !body.ids.every((n: unknown) => Number.isInteger(n))) return new Response('Bad request', { status: 400 });
  if (c.adminOnly && !can(locals.user, 'admin')) return new Response('Forbidden', { status: 403 });
  reorder(c.key, body.ids);
  audit(locals.user.id, `${c.key}.reorder`);
  return new Response(null, { status: 204 });
};
