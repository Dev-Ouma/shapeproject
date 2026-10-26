import sanitizeHtml from 'sanitize-html';

/** Allow-list for rich text written in the admin editor (and imported WordPress posts). */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'p', 'br', 'hr', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li',
      'blockquote', 'code', 'pre', 'figure', 'figcaption', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      '*': ['class'],
    },
    allowedClasses: {
      '*': [/^wp-block-[a-z-]+$/, /^is-[a-z-]+$/, /^has-[a-z-]+$/, /^columns-[a-z0-9-]+$/, /^size-[a-z-]+$/, /^wp-image-\d+$/, /^align[a-z]+$/],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const external = /^https?:\/\//i.test(attribs.href ?? '');
        return { tagName, attribs: external ? { ...attribs, target: '_blank', rel: 'noopener noreferrer' } : attribs };
      },
    },
  });
}

/** Plain text only (comments, contact messages). */
export function plainText(s: string, max = 5000): string {
  return sanitizeHtml(s, { allowedTags: [], allowedAttributes: {} }).trim().slice(0, max);
}
