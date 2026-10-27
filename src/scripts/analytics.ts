// First-party page analytics: page views, engaged time, scroll depth, clicks, downloads, outbound links and
// searches. No cookies or device storage; beacons go only to this site's /api/collect.
type Ev = { type: string; path?: string; title?: string; target?: string; label?: string; ref?: string; utm?: string; value?: number };

const path = location.pathname;
const queue: Ev[] = [];
let timer: number | undefined;

function flush() {
  if (!queue.length) return;
  const body = JSON.stringify(queue.splice(0, 20));
  const blob = new Blob([body], { type: 'application/json' });
  if (!navigator.sendBeacon?.('/api/collect', blob)) {
    fetch('/api/collect', { method: 'POST', body, keepalive: true, credentials: 'same-origin', headers: { 'Content-Type': 'application/json' } }).catch(() => {});
  }
}

function send(e: Ev, now = false) {
  queue.push({ path, title: document.title, ...e });
  clearTimeout(timer);
  if (now || queue.length >= 10) flush();
  else timer = window.setTimeout(flush, 1500);
}

// Page view (404 pages are reported separately so broken links show up in the CMS).
const params = new URLSearchParams(location.search);
const utm = ['utm_source', 'utm_medium', 'utm_campaign'].map((k) => params.get(k)).filter(Boolean).join(' / ');
send({ type: document.querySelector('[data-not-found]') ? 'notfound' : 'pageview', ref: document.referrer, utm: utm || undefined }, true);

// Engaged time (only while the tab is visible) and how far down the page the visitor scrolled.
let visibleSince = document.visibilityState === 'visible' ? performance.now() : 0;
let engaged = 0;
let depth = 0;
const measureDepth = () => {
  const h = document.documentElement.scrollHeight - innerHeight;
  depth = Math.max(depth, h > 0 ? Math.round((scrollY / h) * 100) : 100);
};
addEventListener('scroll', measureDepth, { passive: true });
measureDepth();
let left = false;
function leave() {
  if (visibleSince) engaged += performance.now() - visibleSince;
  visibleSince = 0;
  if (left || engaged < 500) return flush();
  left = true;
  send({ type: 'leave', value: Math.round(engaged), label: `${Math.min(depth, 100)}%` }, true);
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') leave();
  else if (!left) visibleSince = performance.now();
});
addEventListener('pagehide', leave);

// Clicks on links and buttons.
const DOWNLOAD = /\.(pdf|docx?|pptx?|xlsx?|zip|csv)(\?|#|$)/i;
document.addEventListener('click', (e) => {
  const el = (e.target as Element | null)?.closest<HTMLElement>('a[href], button, [role="button"], summary');
  if (!el || el.closest('[data-no-track]')) return;
  const label = (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100) || undefined;
  if (el instanceof HTMLAnchorElement) {
    const href = el.getAttribute('href')!;
    if (href.startsWith('#')) return send({ type: 'click', target: path + href, label });
    if (/^(mailto|tel):/i.test(href)) return send({ type: 'contact', target: href, label }, true);
    const url = new URL(el.href, location.href);
    if (DOWNLOAD.test(url.pathname) || el.hasAttribute('download')) return send({ type: 'download', target: url.origin === location.origin ? url.pathname : url.href, label }, true);
    if (url.origin !== location.origin) return send({ type: 'outbound', target: url.href, label }, true);
    return send({ type: 'click', target: url.pathname, label }, true);
  }
  send({ type: 'click', target: el.dataset.track || undefined, label });
}, { capture: true });

// Searches: pages dispatch `shape:search` with the term and how many results it found.
addEventListener('shape:search', ((e: CustomEvent<{ q: string; results: number }>) => {
  const q = e.detail.q.trim();
  if (q.length >= 2) send({ type: 'search', label: q, value: e.detail.results });
}) as EventListener);
