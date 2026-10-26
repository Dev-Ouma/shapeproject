import type { APIRoute } from 'astro';
import { addMessage, throttled } from '../../lib/engagement';

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const form = await request.formData();
  if (String(form.get('website_hp') ?? '')) return redirect('/contact/?sent=1', 303);
  if (throttled(clientAddress)) return new Response('Too many requests', { status: 429 });
  const r = addMessage({
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    subject: String(form.get('subject') ?? ''),
    body: String(form.get('message') ?? ''),
  });
  return redirect(r.ok ? '/contact/?sent=1' : '/contact/?sent=0', 303);
};
