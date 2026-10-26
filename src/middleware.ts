import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, sessionInfo, can, bootstrapAdmin } from './lib/auth';
import { loadSite } from './lib/content';

// Admin pages anyone may open (login + invite acceptance).
const PUBLIC_ADMIN = [/^\/admin\/login\/?$/, /^\/admin\/invite\/[^/]+\/?$/];
// Reachable while the second factor is still pending.
const OTP_PATHS = [/^\/admin\/otp\/?$/, /^\/admin\/logout\/?$/];
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
    "style-src 'self' https://fonts.googleapis.com",
    // Per-element style attributes (CSS custom properties for colours/positions) only — no <style> blocks.
    "style-src-attr 'unsafe-inline'",
    "font-src 'self' https://fonts.gstatic.com",
    "script-src 'self'",
    "script-src-attr 'none'",
    "object-src 'none'",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};

export const onRequest = defineMiddleware(async (ctx, next) => {
  bootstrapAdmin();
  const path = ctx.url.pathname;
  const session = sessionInfo(ctx.cookies.get(SESSION_COOKIE)?.value);
  const user = session?.mfaOk ? session.user : undefined;
  ctx.locals.user = user;
  ctx.locals.pendingUser = session && !session.mfaOk ? session.user : undefined;

  if (path.startsWith('/admin')) {
    const isPublic = PUBLIC_ADMIN.some((r) => r.test(path));
    if (ctx.locals.pendingUser && !OTP_PATHS.some((r) => r.test(path))) return ctx.redirect('/admin/otp', 303);
    if (!isPublic && !user && !(ctx.locals.pendingUser && OTP_PATHS.some((r) => r.test(path)))) return ctx.redirect(`/admin/login?next=${encodeURIComponent(path + ctx.url.search)}`, 303);
    if (user && ADMIN_ONLY.some((r) => r.test(path)) && !can(user, 'admin')) return new Response('Forbidden: admins only', { status: 403 });
  }

  const res = await next();

  // CMS-managed redirects for paths that would otherwise 404.
  if (res.status === 404 && !path.startsWith('/admin') && !path.startsWith('/api')) {
    const want = path.replace(/\/+$/, '') || '/';
    const hit = loadSite().redirects.find((r) => r.from.replace(/\/+$/, '') === want);
    if (hit) return ctx.redirect(hit.to, 301);
  }

  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    // Vite dev injects <style> blocks and inline HMR scripts, which the production CSP forbids.
    if (import.meta.env.DEV && k === 'Content-Security-Policy') continue;
    if (!res.headers.has(k)) res.headers.set(k, v);
  }
  if (path.startsWith('/admin') || path.startsWith('/api')) res.headers.set('Cache-Control', 'no-store');
  return res;
});
