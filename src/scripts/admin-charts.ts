// Hover crosshair + tooltip for TrendChart; keyboard users can step through days with the arrow keys.
type Data = { labels: string[]; x: number[]; w: number; series: { name: string; color: string; values: number[]; y: number[] }[] };

for (const fig of document.querySelectorAll<HTMLElement>('[data-trend]')) {
  const data: Data = JSON.parse(fig.dataset.trend!);
  const svg = fig.querySelector('svg')!;
  const hover = fig.querySelector<SVGGElement>('[data-hover]')!;
  const cross = fig.querySelector<SVGLineElement>('[data-cross]')!;
  const dots = [...fig.querySelectorAll<SVGCircleElement>('[data-dot]')];
  const tip = fig.querySelector<HTMLElement>('[data-tip]')!;
  const hit = fig.querySelector<SVGRectElement>('[data-hit]')!;
  let current = -1;

  const show = (i: number) => {
    current = i;
    const x = data.x[i]!;
    cross.setAttribute('x1', String(x));
    cross.setAttribute('x2', String(x));
    dots.forEach((d, k) => { d.setAttribute('cx', String(x)); d.setAttribute('cy', String(data.series[k]!.y[i])); });
    hover.removeAttribute('hidden');
    tip.replaceChildren();
    const h = document.createElement('strong');
    h.textContent = data.labels[i]!;
    tip.append(h);
    for (const s of data.series) {
      const row = document.createElement('span');
      const sw = document.createElement('i');
      sw.style.setProperty('--c', s.color);
      row.append(sw, `${s.name} `);
      const b = document.createElement('b');
      b.textContent = s.values[i]!.toLocaleString();
      row.append(b);
      tip.append(row);
    }
    tip.hidden = false;
    const box = svg.getBoundingClientRect();
    const px = (x / data.w) * box.width;
    tip.style.left = `${Math.min(Math.max(px, 70), box.width - 70)}px`;
  };
  const hide = () => { hover.setAttribute('hidden', ''); tip.hidden = true; current = -1; };

  const nearest = (clientX: number) => {
    const box = svg.getBoundingClientRect();
    const vx = ((clientX - box.left) / box.width) * data.w;
    let best = 0;
    data.x.forEach((x, i) => { if (Math.abs(x - vx) < Math.abs(data.x[best]! - vx)) best = i; });
    return best;
  };
  hit.addEventListener('pointermove', (e) => show(nearest(e.clientX)));
  hit.addEventListener('pointerdown', (e) => show(nearest(e.clientX)));
  svg.addEventListener('pointerleave', hide);

  svg.setAttribute('tabindex', '0');
  svg.addEventListener('keydown', (e) => {
    const last = data.x.length - 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      show(Math.min(last, Math.max(0, (current < 0 ? last : current) + (e.key === 'ArrowRight' ? 1 : -1))));
    } else if (e.key === 'Escape') hide();
  });
  svg.addEventListener('blur', hide);
}
