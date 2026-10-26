import type { APIRoute } from 'astro';
import { listMedia, saveUpload } from '../../../lib/media';
import { sameOrigin } from '../../../lib/admin';
import { audit } from '../../../lib/auth';

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

export const GET: APIRoute = ({ url, locals }) => {
  if (!locals.user) return json({ error: 'Unauthorised' }, 401);
  return json(listMedia({ q: url.searchParams.get('q') ?? '', images: url.searchParams.get('images') === '1' }));
};

export const POST: APIRoute = async ({ request, url, locals }) => {
  if (!locals.user || !sameOrigin(request, url)) return json({ error: 'Forbidden' }, 403);
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) return json({ error: 'No file received.' }, 400);
  const r = await saveUpload(file, locals.user.id, String(form.get('alt') ?? ''));
  if (!r.ok) return json({ error: r.error }, 400);
  audit(locals.user.id, 'media.upload', r.media.path);
  return json(r.media, 201);
};
