import type { APIRoute } from 'astro';
import { clientIp } from '../../lib/analytics';
import { addMessage, throttled } from '../../lib/engagement';
import { notify } from '../../lib/mail';
import { loadSite } from '../../lib/content';

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const form = await request.formData();
  if (String(form.get('website_hp') ?? '')) return redirect('/contact/?sent=1', 303);
  if (throttled(clientIp(request, clientAddress))) return new Response('Too many requests', { status: 429 });
  const input = {
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    subject: String(form.get('subject') ?? ''),
    body: String(form.get('message') ?? ''),
  };
  const r = addMessage(input);
  if (r.ok) notify(loadSite().contact.email, `[SHAPE website] ${input.subject}`, `From: ${input.name} <${input.email}>\n\n${input.body}\n\n— Reply directly to this email, or manage messages at /admin/messages`, input.email);
  return redirect(r.ok ? '/contact/?sent=1' : '/contact/?sent=0', 303);
};
