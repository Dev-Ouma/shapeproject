import type { APIRoute } from 'astro';
import { rangeFor, exportRows } from '../../../lib/analytics';

// Raw event export for the selected range (signed-in staff only, enforced by the admin middleware).
export const GET: APIRoute = ({ url, locals }) => {
  if (!locals.user) return new Response('Unauthorized', { status: 401 });
  const asked = Number(url.searchParams.get('days'));
  const days = [7, 30, 90, 365].includes(asked) ? asked : 30;
  const { cur } = rangeFor(days);
  const rows = exportRows(cur);
  const cols = ['ts', 'type', 'path', 'title', 'target', 'label', 'ref', 'utm', 'session', 'device', 'browser', 'os', 'lang', 'value'];
  // Quote every cell; prefix formula-looking text so spreadsheets do not execute it.
  const cell = (v: unknown) => {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const body = [cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n');
  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="shape-analytics-${cur.from}-to-${cur.to}.csv"`,
    },
  });
};
