import { describe, it, expect } from 'vitest';
import { breadcrumbs, metaDescription, eventLd, websiteLd } from '../../src/lib/seo';

const site = new URL('https://shapeproject.ouk.ac.ke');

describe('seo helpers', () => {
  it('builds breadcrumbs from the path, skipping hub segments without pages', () => {
    const b = breadcrumbs('/category/news/', 'News', site)!;
    expect(b.itemListElement.map((i) => i.name)).toEqual(['Home', 'News']);
    expect(b.itemListElement[1]!.item).toBe('https://shapeproject.ouk.ac.ke/category/news/');
    expect(breadcrumbs('/', 'Home', site)).toBeNull();
  });

  it('cuts meta descriptions on a word boundary and strips markup', () => {
    const d = metaDescription('<p>' + 'word '.repeat(60) + '</p>');
    expect(d.length).toBeLessThanOrEqual(156);
    expect(d.endsWith('…')).toBe(true);
    expect(d).not.toContain('<');
    expect(metaDescription('Short &amp; sweet')).toBe('Short sweet');
  });

  it('marks online events as virtual and in-person events with a place', () => {
    expect(eventLd(site, { title: 'Webinar', start: '2026-03-01', location: 'Online (Zoom)' }).location).toMatchObject({ '@type': 'VirtualLocation' });
    expect(eventLd(site, { title: 'Kickoff', start: '2025-02-10', location: 'Nairobi, Kenya' }).location).toMatchObject({ '@type': 'Place', name: 'Nairobi, Kenya' });
  });

  it('declares a sitelinks search box pointing at the site search', () => {
    expect(websiteLd(site).potentialAction.target.urlTemplate).toBe('https://shapeproject.ouk.ac.ke/search/?s={search_term_string}');
  });
});
