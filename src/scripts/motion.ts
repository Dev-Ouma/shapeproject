// Site-wide motion: word-by-word heading reveals, staggered scroll reveals,
// count-up numbers, and a top progress bar for navigations and form posts.
// Everything is skipped when the visitor prefers reduced motion.

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- page progress bar ---------- */
const bar = document.createElement('div');
bar.className = 'progress-bar';
bar.setAttribute('aria-hidden', 'true');
document.body.append(bar);
let timer: number | undefined;
function startProgress() {
  clearInterval(timer);
  let p = 8;
  bar.style.opacity = '1';
  bar.style.transform = `scaleX(${p / 100})`;
  timer = window.setInterval(() => {
    p += (92 - p) * 0.08;
    bar.style.transform = `scaleX(${p / 100})`;
  }, 120);
}
function doneProgress() {
  clearInterval(timer);
  bar.style.transform = 'scaleX(1)';
  setTimeout(() => { bar.style.opacity = '0'; bar.style.transform = 'scaleX(0)'; }, 250);
}
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement).closest('a');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank' || a.hasAttribute('download')) return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
  startProgress();
});
document.addEventListener('submit', (e) => { if (!e.defaultPrevented && (e.target as HTMLFormElement).method !== 'dialog') startProgress(); });
addEventListener('pageshow', doneProgress);

/* ---------- preloader (first visit per session) ---------- */
const pre = document.querySelector<HTMLElement>('[data-preloader]');
if (pre) {
  const hide = () => { pre.classList.add('is-done'); setTimeout(() => pre.remove(), 600); };
  if (document.readyState === 'complete') setTimeout(hide, 250);
  else addEventListener('load', () => setTimeout(hide, 250), { once: true });
  setTimeout(hide, 2200); // never hold the page longer than this
}

if (!reduce) {
  /* ---------- split headings into words ---------- */
  const HEADINGS = '.section-head h2, .section-head h1, .h-xl, .about-intro__title, .site-main .page-header .entry-title, .hero__content h2, .team-photo__caption h2, .coord h2';
  document.querySelectorAll<HTMLElement>(HEADINGS).forEach((h) => {
    if (h.dataset.split || h.children.length > 1) return;
    h.dataset.split = '1';
    h.setAttribute('aria-label', h.textContent!.trim());
    const words = h.textContent!.trim().split(/\s+/);
    h.textContent = '';
    words.forEach((w, i) => {
      const outer = document.createElement('span');
      outer.className = 'w';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = w;
      inner.style.setProperty('--i', String(i));
      outer.append(inner);
      h.append(outer, ' ');
    });
    h.classList.add('split');
  });

  /* ---------- reveal on scroll with sibling stagger ---------- */
  const TARGETS = [
    '.section-head > p', '.section-head > small', '.section-head .eyebrow', '.split',
    '.flip', '.news-card', '.partner', '.theme-card', '.targets li', '.timeline__item', '.wp', '.dl__group',
    '.team-card', '.org__root', '.org__node', '.assoc li', '.ev-card', '.ev-stat', '.ev-ring', '.brand-card', '.doc-card',
    '.album__head', '.masonry__item', '.about-intro p', '.gm__card', '.gm .btn', '.blob', '.coord', '.mat-count',
    '.gantt-scroll', '.gantt-legend', '.archive-post', '.page-content > *', '.contact__item', '.contact__form', '.pills li',
    '.footer__grid > *', '.dl__controls', '.mat-search',
  ].join(',');
  const els = [...document.querySelectorAll<HTMLElement>(TARGETS)].filter((el) => !el.closest('.book, .hero, [data-no-reveal]'));
  els.forEach((el) => {
    el.classList.add('reveal');
    const sibs = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains('reveal')) : [];
    el.style.setProperty('--d', `${Math.min(sibs.indexOf(el), 8) * 70}ms`);
  });
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  els.forEach((el) => io.observe(el));
  document.querySelectorAll<HTMLElement>('.split').forEach((el) => io.observe(el));

  /* ---------- count-up numbers ---------- */
  const counters = document.querySelectorAll<HTMLElement>('.flip__value, .ev-stat strong, .mat-count strong, .ev-ring strong');
  const cio = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const el = e.target as HTMLElement;
    const node = [...el.childNodes].find((n) => n.nodeType === 3 && /\d/.test(n.textContent ?? ''));
    if (!node) return;
    const m = node.textContent!.match(/^(\D*)(\d+)(.*)$/s);
    if (!m) return;
    const [, pre, num, post] = m;
    const target = Number(num);
    const t0 = performance.now();
    const dur = 1100;
    const step = (t: number) => {
      const k = Math.min((t - t0) / dur, 1);
      node.textContent = `${pre}${Math.round(target * (1 - Math.pow(1 - k, 3)))}${post}`;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.4 });
  counters.forEach((c) => cio.observe(c));
}
