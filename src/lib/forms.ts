// Parse bracketed form names (e.g. `data[deliverables][0][code]`) into nested objects.

export function parseNested(form: FormData, root = 'data'): Record<string, unknown> {
  const out: Record<string, any> = {};
  for (const [name, value] of form.entries()) {
    if (typeof value !== 'string') continue;
    if (!name.startsWith(root + '[')) continue;
    const keys = [...name.slice(root.length).matchAll(/\[([^\]]*)\]/g)].map((m) => m[1]);
    let node = out;
    keys.forEach((k, i) => {
      const last = i === keys.length - 1;
      if (last) {
        if (k === '') {
          (node as any[]).push?.(value);
        } else if (k in node) {
          node[k] = Array.isArray(node[k]) ? [...node[k], value] : [node[k], value];
        } else {
          node[k] = value;
        }
      } else {
        const nextIsArrayPush = keys[i + 1] === '';
        node[k] ??= nextIsArrayPush ? [] : {};
        node = node[k];
      }
    });
  }
  return normaliseLists(out);
}

// `{ "0": {...}, "3": {...} }` → `[{...}, {...}]` (keeps order of the numeric keys).
function normaliseLists(v: any): any {
  if (Array.isArray(v)) return v.map(normaliseLists);
  if (v && typeof v === 'object') {
    const keys = Object.keys(v);
    if (keys.length && keys.every((k) => /^\d+$/.test(k))) return keys.sort((a, b) => +a - +b).map((k) => normaliseLists(v[k]));
    return Object.fromEntries(keys.map((k) => [k, normaliseLists(v[k])]));
  }
  return v;
}
