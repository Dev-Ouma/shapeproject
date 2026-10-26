import postsJson from '../../data/posts.json';
import mediaJson from '../../data/media.json';
import categoriesJson from '../../data/categories.json';
import tagsJson from '../../data/tags.json';

type WpPost = (typeof postsJson)[number];

const UPLOAD_RE = /https:\/\/shapeproject\.org\/wp-content\/uploads\/[^"\s']+?\/([^/"\s']+?)(?:-\d+x\d+)?\.(jpe?g|png|webp)/g;

const tagById = new Map(tagsJson.map((t) => [t.id, { name: t.name, slug: t.slug }]));
export const categories = categoriesJson.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
const categoryById = new Map(categories.map((c) => [c.id, c]));
const mediaById = new Map(mediaJson.map((m) => [m.id, m.source_url]));

function localImage(url: string): string {
  return url.replace(UPLOAD_RE, '/images/news/$1.$2');
}

function cleanHtml(html: string): string {
  return localImage(
    html
      .replace(/\s(srcset|sizes)="[^"]*"/g, '')
      .replace(/\sloading="lazy"/g, '')
      .replace(/<img /g, '<img loading="lazy" '),
  );
}

function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&#8217;/g, '’')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&hellip;|\[&hellip;\]/g, '…')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export type NewsPost = {
  id: number;
  slug: string;
  title: string;
  date: Date;
  excerpt: string;
  image?: string;
  category: string;
  categories: { name: string; slug: string }[];
  modified: Date;
  readingMinutes: number;
  tags: { name: string; slug: string }[];
  commentsOpen: boolean;
  html: string;
};

export const news: NewsPost[] = (postsJson as WpPost[])
  .filter((p) => p.slug !== 'hello-world')
  .map((p) => {
    const featured = mediaById.get(p.featured_media);
    return {
      id: p.id,
      slug: p.slug,
      title: stripTags(p.title.rendered),
      date: new Date(p.date),
      excerpt: stripTags(p.excerpt.rendered),
      category: categoryById.get(p.categories[0])?.name ?? 'News',
      categories: p.categories.map((id) => categoryById.get(id)).filter((c) => c !== undefined),
      modified: new Date(p.modified),
      readingMinutes: Math.max(1, Math.round(stripTags(p.content.rendered).split(/\s+/).length / 200)),
      image: featured ? localImage(featured) : undefined,
      tags: p.tags.map((id) => tagById.get(id)).filter((t) => t !== undefined),
      commentsOpen: p.comment_status === 'open',
      html: cleanHtml(p.content.rendered),
    };
  })
  .sort((a, b) => b.date.getTime() - a.date.getTime());

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
