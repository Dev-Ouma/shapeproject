// Shared helpers for admin pages.
import { collections, type Collection, type Field } from './schema';
import { listEntries } from './content';

/** Resolve dynamic select options (e.g. partner names) for a collection's fields. */
export function resolveOptions(c: Collection): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const visit = (fields: Field[]) =>
    fields.forEach((f) => {
      if ((f.type === 'select' || f.type === 'multiselect') && !Array.isArray(f.options)) {
        const key = `${f.options.from}.${f.options.field}`;
        out[key] ??= listEntries(f.options.from, { includeDrafts: true }).map((e) => String(e.data[f.options.field] ?? '')).filter(Boolean);
      }
      if (f.type === 'list') visit(f.fields);
    });
  visit(c.fields);
  return out;
}

/** Same-origin check for JSON/multipart admin API calls (form posts are covered by Astro's checkOrigin). */
export function sameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('origin');
  if (origin) return origin === url.origin;
  const ref = request.headers.get('referer');
  return !!ref && new URL(ref).origin === url.origin;
}

export function postState(e: { status: string; data: Record<string, any> }): 'published' | 'draft' | 'scheduled' {
  if (e.status === 'draft') return 'draft';
  if (e.data.date && new Date(e.data.date) > new Date()) return 'scheduled';
  return 'published';
}

export function publicUrl(c: Collection, slug: string | null): string | undefined {
  const map: Record<string, string> = {
    settings: '/', nav: '/', slides: '/', facts: '/', partners: '/partners/', team: '/project-team/', associated: '/project-team/',
    about: '/about/', thematic: '/about/#thematic', targets: '/about/#target-groups', impacts: '/about/#impacts',
    workpackages: '/deliverables/', events: '/events/', brand: '/materials/#brand', albums: '/materials/#photos',
  };
  if (c.key === 'posts' && slug) return `/news/${slug}/`;
  if (c.key === 'categories' && slug) return `/category/${slug}/`;
  return map[c.key];
}

export { collections };
