import type { APIRoute } from 'astro';
import { record, clientIp } from '../../lib/analytics';

// Receives beacons from the site's analytics script. Always answers 204 so failures are invisible to visitors.
export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  const done = new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  // Same-origin beacons only; staff browsing while signed in are not counted.
  const site = request.headers.get('sec-fetch-site');
  if ((site && site !== 'same-origin') || locals.user || locals.pendingUser) return done;
  const text = await request.text();
  if (text.length > 4096) return done;
  let events: unknown;
  try { events = JSON.parse(text); } catch { return done; }
  const list = (Array.isArray(events) ? events : [events]).slice(0, 20);
  const ctx = {
    ip: clientIp(request, clientAddress),
    ua: request.headers.get('user-agent') ?? '',
    lang: request.headers.get('accept-language'),
    host: new URL(request.url).hostname,
  };
  for (const e of list) if (e && typeof e === 'object') {
    try { record(e as Record<string, unknown>, ctx); } catch (err) { console.error('analytics:', (err as Error).message); }
  }
  return done;
};
