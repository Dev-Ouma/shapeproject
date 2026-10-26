import type { APIRoute } from 'astro';
import { addComment, throttled } from '../../lib/engagement';
import { loadSite } from '../../lib/content';
import { notify } from '../../lib/mail';

export const POST: APIRoute = async ({ request, clientAddress, redirect }) => {
  const form = await request.formData();
  const slug = String(form.get('post') ?? '');
  const post = loadSite().posts.find((p) => p.slug === slug);
  if (!post || !post.commentsOpen) return new Response('Not found', { status: 404 });
  const back = (state: string) => redirect(`/news/${slug}/?comment=${state}#respond`, 303);
  // Honeypot: real visitors never fill this hidden field.
  if (String(form.get('website_hp') ?? '')) return back('pending');
  if (throttled(clientAddress)) return new Response('Too many requests', { status: 429 });
  const r = addComment({
    post: slug,
    author: String(form.get('author') ?? ''),
    email: String(form.get('email') ?? ''),
    url: String(form.get('url') ?? ''),
    body: String(form.get('comment') ?? ''),
    ip: clientAddress,
  });
  if (r.ok) notify(loadSite().contact.email, `[SHAPE website] New comment awaiting review`, `${String(form.get('author'))} commented on "${post.title}":\n\n${String(form.get('comment'))}\n\nReview it at /admin/comments`);
  return back(r.ok ? 'pending' : 'error');
};
