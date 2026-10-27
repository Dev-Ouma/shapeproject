import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, sessionInfo, can, bootstrapAdmin, logout } from './lib/auth';
import { loadSite } from './lib/content';
import { clientIp } from './lib/analytics';
import { getLockdown, getMaintenance, maintenanceBlocks, requestContext, retryAfter } from './lib/system';
import { maintenancePage } from './lib/maintenance-page';
import { sweepTrash } from './lib/trash';

// Admin pages anyone may open (login + invite acceptance).
const PUBLIC_ADMIN = [/^\/admin\/login\/?$/, /^\/admin\/invite\/[^/]+\/?$/];
// Reachable while the second factor is still pending.
const OTP_PATHS = [/^\/admin\/otp\/?$/, /^\/admin\/logout\/?$/];
// Admin-only areas (editors are refused).
const ADMIN_ONLY = [/^\/admin\/users/, /^\/admin\/audit/, /^\/admin\/system/, /^\/admin\/api\/audit/, /^\/admin\/content\/(settings|nav|redirects|releases)(\/|$)/];
// Still accepted while lockdown freezes the CMS (so admins can sign in/out and lift it).
const FREEZE_EXEMPT = [/^\/admin\/(login|logout|otp)\/?$/, /^\/admin\/system\/modes\/?$/];
// Account management closed during lockdown, frozen or not: no invites, role or password changes for others.
const LOCKDOWN_CLOSED = [/^\/admin\/invite\//, /^\/admin\/users/];
// Public form endpoints closed during lockdown.
const PUBLIC_WRITES = /^\/api\/(contact|comments)\/?$/;

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

export const onRequest = defineMiddleware((ctx, next) => {
  let ip: string | undefined;
  try {
    ip = clientIp(ctx.request, ctx.clientAddress);
  } catch {
    // clientAddress is unavailable while prerendering.
  }
  return requestContext.run({ ip, userAgent: ctx.request.headers.get('user-agent') ?? undefined }, () => handle(ctx, next));
});

const handle: Parameters<typeof defineMiddleware>[0] = async (ctx, next) => {
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
    const lock = getLockdown();
    if (lock.on) {
      const who = user ?? ctx.locals.pendingUser;
      if (who && who.role !== 'admin') {
        logout(ctx.cookies.get(SESSION_COOKIE)?.value);
        ctx.cookies.delete(SESSION_COOKIE, { path: '/' });
        return ctx.redirect('/admin/login?lockdown=1', 303);
      }
      if (LOCKDOWN_CLOSED[0]!.test(path)) return ctx.redirect('/admin/login?lockdown=1', 303);
      if (ctx.request.method !== 'GET' && ctx.request.method !== 'HEAD' && LOCKDOWN_CLOSED.some((r) => r.test(path))) {
        return new Response('User management is locked during lockdown. Lift the lockdown first.', { status: 423, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
      if (lock.freeze && ctx.request.method !== 'GET' && ctx.request.method !== 'HEAD' && !FREEZE_EXEMPT.some((r) => r.test(path))) {
        return new Response('The CMS is read-only during lockdown. Lift the lockdown under Administration → Maintenance & lockdown.', { status: 423, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
    }
    if (user) sweepTrash();
  } else if (path !== '/healthz' && !path.startsWith('/uploads/')) {
    if (ctx.request.method === 'POST' && PUBLIC_WRITES.test(path) && getLockdown().on) {
      return new Response('Submissions are temporarily disabled. Please try again later.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '3600', 'Cache-Control': 'no-store' } });
    }
    const m = getMaintenance();
    if (maintenanceBlocks(path, !!user, m)) {
      const res = new Response(path.startsWith('/api/') ? 'Down for maintenance' : maintenancePage(m), {
        status: 503,
        headers: { 'Content-Type': path.startsWith('/api/') ? 'text/plain; charset=utf-8' : 'text/html; charset=utf-8', 'Retry-After': String(retryAfter(m)), 'X-Maintenance': '1', 'Cache-Control': 'no-store' },
      });
      for (const [k, v] of Object.entries(SECURITY_HEADERS)) res.headers.set(k, v);
      return res;
    }
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
  if (path.startsWith('/admin') || path.startsWith('/api') || path === '/healthz') res.headers.set('Cache-Control', 'no-store');
  return res;
};
