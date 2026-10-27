// Structured data (schema.org JSON-LD) and SEO helpers shared by the public layout and pages.
const BREADCRUMB_NAMES: Record<string, string> = {
  about: 'About', partners: 'Partners', 'project-team': 'Project Team', deliverables: 'Deliverables', materials: 'Materials',
  events: 'Events', news: 'News', contact: 'Contact', 'project-book': 'Executive Brief', category: 'Category', tag: 'Tag',
};

export function breadcrumbs(path: string, title: string, site: URL) {
  const parts = path.split('/').filter(Boolean);
  if (!parts.length) return null;
  const items = [{ name: 'Home', url: new URL('/', site).href }];
  parts.forEach((p, i) => {
    const last = i === parts.length - 1;
    // Category/tag hubs have no index page; skip them as intermediate crumbs.
    if (!last && (p === 'category' || p === 'tag' || p === 'author')) return;
    items.push({ name: last ? title : BREADCRUMB_NAMES[p] ?? p, url: new URL(`/${parts.slice(0, i + 1).join('/')}/`, site).href });
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

export function websiteLd(site: URL) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SHAPE Project',
    alternateName: 'Smart City Higher Education Advancement Program in East Africa',
    url: site.href,
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: new URL('/search/?s={search_term_string}', site).href },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function organizationLd(site: URL, sameAs: string[], contact: { phone: string; email: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': new URL('/#organization', site).href,
    name: 'SHAPE Project',
    alternateName: 'Smart City Higher Education Advancement Program in East Africa',
    url: site.href,
    logo: new URL('/images/Shape-and-EU-scaled.png', site).href,
    description: 'Erasmus+ Capacity Building in Higher Education project developing smart city curricula and capacity at universities in East Africa.',
    email: contact.email,
    telephone: contact.phone,
    sameAs,
    parentOrganization: { '@type': 'CollegeOrUniversity', name: 'Open University of Kenya', url: 'https://www.ouk.ac.ke/' },
    funder: { '@type': 'Organization', name: 'European Union — Erasmus+ Programme' },
  };
}

export function articleLd(site: URL, a: { title: string; description: string; url: string; image: string; published?: Date; modified?: Date }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: a.title,
    description: a.description,
    image: [a.image],
    datePublished: a.published?.toISOString(),
    dateModified: (a.modified ?? a.published)?.toISOString(),
    mainEntityOfPage: a.url,
    author: { '@type': 'Organization', name: 'SHAPE Project', url: site.href },
    publisher: { '@id': new URL('/#organization', site).href },
  };
}

export function eventLd(site: URL, e: { title: string; start: string; end?: string; location?: string; text?: string; image?: string; planned?: boolean }) {
  const online = /online|virtual|zoom|teams/i.test(e.location ?? '');
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.title,
    startDate: e.start,
    endDate: e.end || e.start,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: online ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
    location: online ? { '@type': 'VirtualLocation', url: new URL('/events/', site).href } : { '@type': 'Place', name: e.location || 'East Africa', address: e.location || 'East Africa' },
    description: (e.text ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300) || e.title,
    image: e.image ? [new URL(e.image, site).href] : undefined,
    organizer: { '@id': new URL('/#organization', site).href },
  };
}

/** Plain-text meta description from HTML or long text: ~155 characters, cut on a word boundary. */
export function metaDescription(text: string, max = 155): string {
  const t = text.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(' ', max - 1)).replace(/[,;:.\s]+$/, '') + '…';
}
