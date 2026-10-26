import type { APIRoute } from 'astro';
import { logout, SESSION_COOKIE, audit } from '../../lib/auth';

export const POST: APIRoute = ({ cookies, redirect, locals }) => {
  logout(cookies.get(SESSION_COOKIE)?.value);
  if (locals.user ?? locals.pendingUser) audit((locals.user ?? locals.pendingUser)!.id, 'logout');
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return redirect('/admin/login', 303);
};
