// Collection definitions. The admin UI generates its forms from these, and
// validation (`validateEntry`) enforces them on every save.

export type Field =
  | { name: string; label: string; type: 'text' | 'textarea' | 'url' | 'email' | 'icon' | 'color' | 'date' | 'datetime' | 'image' | 'file' | 'link'; required?: boolean; help?: string; max?: number; pattern?: { re: RegExp; message: string } }
  | { name: string; label: string; type: 'richtext'; required?: boolean; help?: string }
  | { name: string; label: string; type: 'number'; required?: boolean; help?: string; min?: number; max?: number }
  | { name: string; label: string; type: 'boolean'; help?: string }
  | { name: string; label: string; type: 'select'; options: string[] | { from: string; field: string }; required?: boolean; help?: string }
  | { name: string; label: string; type: 'multiselect'; options: { from: string; field: string }; help?: string }
  | { name: string; label: string; type: 'tags'; help?: string }
  | { name: string; label: string; type: 'list'; fields: Field[]; itemLabel?: string; help?: string };

export type Collection = {
  key: string;
  label: string;
  singular: string;
  kind: 'singleton' | 'list';
  group: 'Site' | 'Home' | 'About' | 'Programme' | 'People' | 'Library' | 'News' | 'Administration';
  icon: string;
  fields: Field[];
  titleField?: string;
  slugFrom?: string; // list collections with public URLs
  drafts?: boolean;
  sortable?: boolean; // manual drag ordering
  orderBy?: { field: string; dir: 'asc' | 'desc' };
  adminOnly?: boolean;
  description?: string;
};

const icon = (name = 'icon', label = 'Icon'): Field => ({ name, label, type: 'icon', help: 'Lucide icon name, e.g. GraduationCap, Globe, Users' });

export const collections: Collection[] = [
  {
    key: 'settings', label: 'Site settings', singular: 'Settings', kind: 'singleton', group: 'Site', icon: 'Settings', adminOnly: true,
    fields: [
      { name: 'phone', label: 'Contact phone', type: 'text', required: true },
      { name: 'email', label: 'Contact email', type: 'email', required: true },
      { name: 'socials', label: 'Social links', type: 'list', itemLabel: 'name', fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'href', label: 'URL', type: 'url', required: true },
        { name: 'icon', label: 'Icon', type: 'select', options: ['facebook', 'x', 'linkedin', 'youtube', 'instagram'], required: true },
      ] },
      { name: 'footerText', label: 'Footer text', type: 'textarea', required: true },
      { name: 'disclaimer', label: 'EU disclaimer', type: 'textarea', required: true },
      { name: 'projectStart', label: 'Project start (Month 1)', type: 'date', required: true },
      { name: 'projectMonths', label: 'Project length (months)', type: 'number', min: 1, max: 120, required: true },
    ],
  },
  {
    key: 'nav', label: 'Navigation', singular: 'Menu item', kind: 'list', group: 'Site', icon: 'Menu', sortable: true, titleField: 'label', adminOnly: true,
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'href', label: 'Link', type: 'link', required: true },
      { name: 'children', label: 'Sub-menu', type: 'list', itemLabel: 'label', fields: [
        { name: 'label', label: 'Label', type: 'text', required: true },
        { name: 'href', label: 'Link', type: 'link', required: true },
      ] },
    ],
  },
  {
    key: 'redirects', label: 'Redirects', singular: 'Redirect', kind: 'list', group: 'Site', icon: 'CornerDownRight', titleField: 'from', adminOnly: true,
    fields: [
      { name: 'from', label: 'From path', type: 'link', required: true, help: 'e.g. /old-page' },
      { name: 'to', label: 'To path or URL', type: 'link', required: true },
    ],
  },
  {
    key: 'slides', label: 'Hero slides', singular: 'Slide', kind: 'list', group: 'Home', icon: 'GalleryHorizontal', sortable: true, titleField: 'title',
    fields: [
      { name: 'image', label: 'Background image', type: 'image', required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'text', label: 'Text', type: 'textarea', required: true },
      { name: 'ctaLabel', label: 'Button label', type: 'text', required: true },
      { name: 'ctaHref', label: 'Button link', type: 'link', required: true },
    ],
  },
  {
    key: 'facts', label: 'Quick facts', singular: 'Fact', kind: 'list', group: 'Home', icon: 'LayoutGrid', sortable: true, titleField: 'label',
    fields: [
      { name: 'num', label: 'Number / headline', type: 'text', required: true },
      { name: 'unit', label: 'Unit', type: 'text' },
      icon(),
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'sub', label: 'Caption', type: 'text', required: true },
      { name: 'text', label: 'Back of card text', type: 'textarea', required: true },
      { name: 'tag', label: 'Back of card tag', type: 'text' },
    ],
  },
  {
    key: 'partners', label: 'Partners', singular: 'Partner', kind: 'list', group: 'People', icon: 'Building2', sortable: true, titleField: 'name',
    fields: [
      { name: 'name', label: 'Institution name', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'select', options: ['Coordinator', 'Academic Partner'], required: true },
      { name: 'country', label: 'Country', type: 'text', required: true },
      { name: 'flag', label: 'Country code', type: 'text', required: true, max: 2, help: 'Two letters, e.g. ke, ug, so, de' },
      { name: 'logo', label: 'Logo', type: 'image', required: true },
      { name: 'url', label: 'Website', type: 'url', required: true },
      { name: 'text', label: 'Description', type: 'textarea', required: true },
    ],
  },
  {
    key: 'team', label: 'Team members', singular: 'Team member', kind: 'list', group: 'People', icon: 'Users', sortable: true, titleField: 'name',
    description: 'Shown on the Project Team page. Mark one member as featured to show them as the coordinator card.',
    fields: [
      { name: 'name', label: 'Full name', type: 'text', required: true },
      { name: 'title', label: 'Project role', type: 'text', required: true },
      { name: 'institution', label: 'Institution', type: 'select', options: { from: 'partners', field: 'name' }, required: true },
      { name: 'photo', label: 'Photo', type: 'image' },
      { name: 'bio', label: 'Short bio', type: 'textarea' },
      { name: 'featured', label: 'Featured (coordinator card)', type: 'boolean' },
    ],
  },
  {
    key: 'associated', label: 'Associated partners', singular: 'Associated partner', kind: 'list', group: 'People', icon: 'Handshake', sortable: true, titleField: 'name',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'country', label: 'Country', type: 'text', required: true },
      { name: 'flag', label: 'Country code', type: 'text', required: true, max: 2 },
      icon(),
    ],
  },
  {
    key: 'about', label: 'About page', singular: 'About page', kind: 'singleton', group: 'About', icon: 'Info',
    fields: [
      { name: 'paragraphs', label: 'Introduction paragraphs', type: 'list', itemLabel: 'text', fields: [{ name: 'text', label: 'Paragraph', type: 'textarea', required: true }] },
      { name: 'goal', label: 'Our goal', type: 'textarea', required: true },
      { name: 'mission', label: 'Our mission', type: 'textarea', required: true },
    ],
  },
  {
    key: 'thematic', label: 'Thematic areas', singular: 'Thematic area', kind: 'list', group: 'About', icon: 'Shapes', sortable: true, titleField: 'title',
    fields: [{ name: 'title', label: 'Title', type: 'text', required: true }, icon()],
  },
  {
    key: 'targets', label: 'Target groups', singular: 'Target group', kind: 'list', group: 'About', icon: 'Target', sortable: true, titleField: 'title',
    fields: [{ name: 'title', label: 'Title', type: 'text', required: true }, icon()],
  },
  {
    key: 'impacts', label: 'Expected impacts', singular: 'Impact', kind: 'list', group: 'About', icon: 'TrendingUp', sortable: true, titleField: 'title',
    fields: [{ name: 'title', label: 'Title', type: 'text', required: true }, { name: 'text', label: 'Text', type: 'textarea', required: true }, icon()],
  },
  {
    key: 'workpackages', label: 'Work packages', singular: 'Work package', kind: 'list', group: 'Programme', icon: 'Layers', titleField: 'title', orderBy: { field: 'wp', dir: 'asc' },
    fields: [
      { name: 'wp', label: 'Number', type: 'number', min: 1, max: 20, required: true },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'listTitle', label: 'Full title (deliverables list)', type: 'text' },
      { name: 'summary', label: 'Summary', type: 'textarea', required: true },
      { name: 'lead', label: 'Lead institution', type: 'select', options: { from: 'partners', field: 'name' }, required: true },
      { name: 'start', label: 'Start month', type: 'number', min: 1, max: 120, required: true },
      { name: 'end', label: 'End month', type: 'number', min: 1, max: 120, required: true },
      { name: 'color', label: 'Colour', type: 'color', required: true },
      { name: 'tint', label: 'Tint (light background)', type: 'color', required: true },
      icon(),
      { name: 'deliverables', label: 'Deliverables', type: 'list', itemLabel: 'code', fields: [
        { name: 'code', label: 'Code', type: 'text', required: true },
        { name: 'desc', label: 'Description', type: 'textarea', required: true },
        { name: 'file', label: 'Published document', type: 'file', help: 'Upload when approved — it becomes downloadable on the Materials page.' },
      ] },
    ],
  },
  {
    key: 'events', label: 'Events', singular: 'Event', kind: 'list', group: 'Programme', icon: 'CalendarDays', titleField: 'title', orderBy: { field: 'start', dir: 'asc' },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'type', label: 'Type', type: 'select', options: ['Meeting', 'Launch', 'Hackathon', 'Training', 'Pilot', 'Conference', 'Workshop'], required: true },
      { name: 'start', label: 'Start date', type: 'date', required: true },
      { name: 'end', label: 'End date', type: 'date' },
      { name: 'planned', label: 'Planned (dates to be confirmed)', type: 'boolean' },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'text', label: 'Description', type: 'textarea', required: true },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'link', label: 'Link (e.g. news story)', type: 'link' },
    ],
  },
  {
    key: 'brand', label: 'Brand kit', singular: 'Brand file', kind: 'list', group: 'Library', icon: 'Palette', sortable: true, titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'file', label: 'File', type: 'image', required: true },
      { name: 'note', label: 'Usage note', type: 'text' },
      { name: 'dark', label: 'Preview on dark background', type: 'boolean' },
    ],
  },
  {
    key: 'albums', label: 'Photo albums', singular: 'Album', kind: 'list', group: 'Library', icon: 'Images', sortable: true, titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'date', label: 'Date label', type: 'text', required: true, help: 'e.g. Sep–Oct 2026' },
      { name: 'link', label: 'Story link', type: 'link' },
      { name: 'photos', label: 'Photos', type: 'list', itemLabel: 'src', fields: [{ name: 'src', label: 'Photo', type: 'image', required: true }] },
    ],
  },
  {
    key: 'posts', label: 'News posts', singular: 'Post', kind: 'list', group: 'News', icon: 'Newspaper', titleField: 'title', slugFrom: 'title', drafts: true, orderBy: { field: 'date', dir: 'desc' },
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'date', label: 'Publish date', type: 'datetime', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea', help: 'Shown in lists and search results. Leave empty to use the start of the post.' },
      { name: 'image', label: 'Featured image', type: 'image' },
      { name: 'content', label: 'Content', type: 'richtext', required: true },
      { name: 'categories', label: 'Categories', type: 'multiselect', options: { from: 'categories', field: 'name' } },
      { name: 'tags', label: 'Tags', type: 'tags' },
      { name: 'commentsOpen', label: 'Allow comments', type: 'boolean' },
    ],
  },
  {
    key: 'categories', label: 'Categories', singular: 'Category', kind: 'list', group: 'News', icon: 'FolderTree', titleField: 'name', slugFrom: 'name',
    fields: [{ name: 'name', label: 'Name', type: 'text', required: true }],
  },
  {
    key: 'releases', label: 'Release notes', singular: 'Release', kind: 'list', group: 'Administration', icon: 'Rocket', titleField: 'title', slugFrom: 'version', drafts: true, adminOnly: true, orderBy: { field: 'date', dir: 'desc' },
    description: 'What changed in the CMS and website. Published notes appear under “What’s new”; the newest published version is shown in the sidebar.',
    fields: [
      { name: 'version', label: 'Version', type: 'text', required: true, help: 'Semantic version, e.g. 1.4.0', pattern: { re: /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/, message: 'Use a version like 1.4.0' } },
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'date', label: 'Release date', type: 'date', required: true },
      { name: 'summary', label: 'Summary', type: 'textarea', max: 300 },
      { name: 'notes', label: 'Notes', type: 'richtext', required: true },
    ],
  },
];

export const collectionMap = new Map(collections.map((c) => [c.key, c]));

export function getCollection(key: string): Collection | undefined {
  return collectionMap.get(key);
}

export function slugify(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export type ValidationResult = { ok: true; data: Record<string, unknown> } | { ok: false; errors: Record<string, string> };

/** Coerce and validate raw form data against a field list. */
export function validateFields(fields: Field[], raw: Record<string, unknown>, prefix = ''): ValidationResult {
  const data: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const key = prefix + f.name;
    const rawV = raw[f.name];
    // Checkbox + hidden fallback, or repeated scalar inputs: the last value wins.
    const v = Array.isArray(rawV) && f.type !== 'list' && f.type !== 'tags' && f.type !== 'multiselect' ? rawV[rawV.length - 1] : rawV;
    switch (f.type) {
      case 'boolean':
        data[f.name] = v === true || v === 'on' || v === 'true' || v === '1';
        break;
      case 'number': {
        if (v === undefined || v === '') {
          if (f.required) errors[key] = 'Required';
          break;
        }
        const n = Number(v);
        if (!Number.isFinite(n)) errors[key] = 'Must be a number';
        else if (f.min !== undefined && n < f.min) errors[key] = `Must be at least ${f.min}`;
        else if (f.max !== undefined && n > f.max) errors[key] = `Must be at most ${f.max}`;
        else data[f.name] = n;
        break;
      }
      case 'tags':
      case 'multiselect': {
        const arr = Array.isArray(v) ? v : typeof v === 'string' ? v.split(',') : [];
        data[f.name] = [...new Set(arr.map((x) => String(x).trim()).filter(Boolean))];
        break;
      }
      case 'list': {
        const items = Array.isArray(v) ? v : v && typeof v === 'object' ? Object.values(v as object) : [];
        const out: unknown[] = [];
        items.forEach((item, i) => {
          if (!item || typeof item !== 'object') return;
          const r = validateFields(f.fields, item as Record<string, unknown>, `${key}.${i}.`);
          if (r.ok) out.push(r.data);
          else Object.assign(errors, r.errors);
        });
        data[f.name] = out;
        break;
      }
      default: {
        const s = v === undefined || v === null ? '' : String(v).trim();
        if (!s) {
          if ('required' in f && f.required) errors[key] = 'Required';
          data[f.name] = '';
          break;
        }
        if ('max' in f && f.max && s.length > f.max) errors[key] = `At most ${f.max} characters`;
        else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) errors[key] = 'Invalid email';
        else if (f.type === 'url' && !/^https?:\/\/\S+$/i.test(s)) errors[key] = 'Must start with http:// or https://';
        else if (f.type === 'color' && !/^#[0-9a-f]{6}$/i.test(s)) errors[key] = 'Use a hex colour like #037B90';
        else if (f.type === 'date' && !/^\d{4}-\d{2}-\d{2}$/.test(s)) errors[key] = 'Use YYYY-MM-DD';
        else if (f.type === 'datetime' && Number.isNaN(Date.parse(s))) errors[key] = 'Invalid date';
        else if (f.type === 'select' && Array.isArray(f.options) && !f.options.includes(s)) errors[key] = 'Choose a valid option';
        else if ((f.type === 'image' || f.type === 'file') && !/^(\/(?!\/)|https?:\/\/)/.test(s)) errors[key] = 'Must be an uploaded file or URL';
        else if (f.type === 'link' && !/^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(s)) errors[key] = 'Use a path like /news/ or a full https:// link';
        else if (f.type === 'icon' && !/^[A-Za-z0-9]+$/.test(s)) errors[key] = 'Icon names contain letters and numbers only';
        else if ('pattern' in f && f.pattern && !f.pattern.re.test(s)) errors[key] = f.pattern.message;
        data[f.name] = s;
      }
    }
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
