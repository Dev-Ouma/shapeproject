import type { APIRoute } from 'astro';
import { can } from '../../../lib/auth';
import { auditCsv, parseAuditFilter } from '../../../lib/audit';

// Audit trail export with the same filters as the page (admins only; also enforced by the middleware).
export const GET: APIRoute = ({ url, locals }) => {
  if (!can(locals.user, 'admin')) return new Response('Forbidden', { status: 403 });
  return new Response(auditCsv(parseAuditFilter(url.searchParams)), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="shape-audit-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
};
