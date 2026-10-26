import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, userForSession, can, bootstrapAdmin } from './lib/auth';
import { loadSite } from './lib/content';

// Admin pages anyone may open (login + invite acceptance).
const PUBLIC_ADMIN = [/^\/admin\/login\/?$/, /^\/admin\/invite\/[^/]+\/?$/];
// Admin-only areas (editors are refused).
const ADMIN_ONLY = [/^\/admin\/users/, /^\/admin\/audit/, /^\/admin\/content\/(settings|nav|redirects)(\/|$)/];

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "img-src 'self' data: blob: https://flagcdn.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

export const onRequest = defineMiddleware(async (ctx, next) => {
  bootstrapAdmin();
  const path = ctx.url.pathname;
  const user = userForSession(ctx.cookies.get(SESSION_COOKIE)?.value);
  ctx.locals.user = user;

  if (path.startsWith('/admin')) {
    const isPublic = PUBLIC_ADMIN.some((r) => r.test(path));
    if (!isPublic && !user) return ctx.redirect(`/admin/login?next=${encodeURIComponent(path + ctx.url.search)}`, 303);
    if (user && ADMIN_ONLY.some((r) => r.test(path)) && !can(user, 'admin')) return new Response('Forbidden: admins only', { status: 403 });
  }

  const res = await next();

  // CMS-managed redirects for paths that would otherwise 404.
  if (res.status === 404 && !path.startsWith('/admin') && !path.startsWith('/api')) {
    const want = path.replace(/\/+$/, '') || '/';
    const hit = loadSite().redirects.find((r) => r.from.replace(/\/+$/, '') === want);
    if (hit) return ctx.redirect(hit.to, 301);
  }

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) if (!res.headers.has(k)) res.headers.set(k, v);
  if (path.startsWith('/admin') || path.startsWith('/api')) res.headers.set('Cache-Control', 'no-store');
  return res;
});
