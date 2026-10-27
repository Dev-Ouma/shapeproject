import type { APIRoute } from 'astro';
import { SESSION_IDLE_MS } from '../../../lib/auth';

// GET: session status for the idle-timeout warning (does not count as activity).
// POST: "Stay signed in" — the request itself refreshes the activity clock in the middleware.
const status = (locals: App.Locals) =>
  new Response(JSON.stringify({ signedIn: !!locals.user, idleEndsAt: locals.idleEndsAt ?? null, idleMs: SESSION_IDLE_MS, now: Date.now() }), {
    status: locals.user ? 200 : 401,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const GET: APIRoute = ({ locals }) => status(locals);
export const POST: APIRoute = ({ locals }) => status(locals);
