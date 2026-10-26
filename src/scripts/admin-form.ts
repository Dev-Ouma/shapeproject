// Client behaviour for CMS edit forms: repeaters, media picker, rich text, small field helpers.
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';

let uid = 0;

/* ---------------- repeaters ---------------- */
function renumber(form: HTMLFormElement) {
  // Rewrite names so list indexes follow the on-screen order.
  const walk = (repeater: HTMLElement) => {
    const base = repeater.dataset.name!;
    const items = [...repeater.querySelectorAll<HTMLElement>(':scope > .a-repeater > [data-item]')];
    items.forEach((item, i) => {
      item.querySelectorAll<HTMLElement>('[name]').forEach((el) => {
        const n = el.getAttribute('name')!;
        if (!n.startsWith(base + '[')) return;
        const rest = n.slice(base.length).replace(/^\[[^\]]*\]/, `[${i}]`);
        el.setAttribute('name', base + rest);
      });
      item.querySelectorAll<HTMLElement>('[data-repeater]').forEach((inner) => {
        const n = inner.dataset.name!;
        if (n.startsWith(base + '[')) inner.dataset.name = base + n.slice(base.length).replace(/^\[[^\]]*\]/, `[${i}]`);
      });
    });
    items.forEach((item) => item.querySelectorAll<HTMLElement>(':scope [data-repeater]').forEach(walk));
  };
  form.querySelectorAll<HTMLElement>('[data-repeater]').forEach((r) => {
    if (!r.parentElement?.closest('[data-repeater]')) walk(r);
  });
}

function bindItem(item: HTMLElement) {
  item.querySelector('[data-remove]')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirmRemove()) item.remove();
  });
  item.querySelectorAll<HTMLButtonElement>(':scope > summary [data-move]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.preventDefault();
      const dir = Number(b.dataset.move);
      const sib = dir < 0 ? item.previousElementSibling : item.nextElementSibling;
      if (sib) dir < 0 ? sib.before(item) : sib.after(item);
    }),
  );
  const title = item.querySelector<HTMLElement>(':scope > summary [data-item-title]');
  const src = item.querySelector<HTMLInputElement | HTMLTextAreaElement>(':scope > .a-item__body [data-title-source]');
  src?.addEventListener('input', () => { if (title) title.textContent = (src.value || 'New item').replace(/^\/.*\//, '').slice(0, 80); });
}
const confirmRemove = () => window.confirm('Remove this item?');

function initRepeater(r: HTMLElement) {
  r.querySelectorAll<HTMLElement>(':scope > .a-repeater > [data-item]').forEach(bindItem);
  const tpl = r.querySelector<HTMLTemplateElement>(':scope > template[data-template]')!;
  r.querySelector(':scope > div > [data-add]')?.addEventListener('click', () => {
    const html = tpl.innerHTML.replaceAll('__i__', `n${++uid}`);
    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const item = wrap.firstElementChild as HTMLElement;
    r.querySelector(':scope > .a-repeater')!.append(item);
    bindItem(item);
    initFields(item);
    item.querySelectorAll<HTMLElement>('[data-repeater]').forEach(initRepeater);
    item.querySelector<HTMLElement>('input, textarea, select')?.focus();
  });
}

/* ---------------- field helpers ---------------- */
function initFields(root: ParentNode) {
  root.querySelectorAll<HTMLInputElement>('[data-datetime]').forEach((el) => {
    const iso = el.parentElement!.querySelector<HTMLInputElement>('[data-datetime-iso]')!;
    el.addEventListener('change', () => { iso.value = el.value ? new Date(el.value).toISOString() : ''; });
  });
  root.querySelectorAll<HTMLElement>('.a-color').forEach((w) => {
    const pick = w.querySelector<HTMLInputElement>('[data-color-picker]')!;
    const text = w.querySelector<HTMLInputElement>('[data-color-text]')!;
    pick.addEventListener('input', () => { text.value = pick.value.toUpperCase(); });
    text.addEventListener('input', () => { if (/^#[0-9a-f]{6}$/i.test(text.value)) pick.value = text.value; });
  });
  root.querySelectorAll<HTMLElement>('[data-media-field]').forEach((w) => {
    const input = w.querySelector<HTMLInputElement>('[data-media-input]')!;
    const thumb = w.querySelector<HTMLElement>('[data-thumb]')!;
    const paint = () => {
      const v = input.value;
      thumb.innerHTML = '';
      if (/\.(png|jpe?g|webp|gif|svg)$/i.test(v)) { const img = document.createElement('img'); img.src = v; img.alt = ''; thumb.append(img); }
      else thumb.textContent = v ? 'FILE' : 'None';
    };
    input.addEventListener('input', paint);
    w.querySelector('[data-media-pick]')?.addEventListener('click', () => openPicker(w.dataset.kind === 'image', (path) => { input.value = path; input.dispatchEvent(new Event('input', { bubbles: true })); }));
  });
  root.querySelectorAll<HTMLElement>('[data-rte]').forEach(initEditor);
}

/* ---------------- media picker ---------------- */
type Media = { id: number; path: string; original_name: string; mime: string; alt: string; variants: string };
let pickerDialog: HTMLDialogElement | undefined;

async function openPicker(imagesOnly: boolean, onPick: (path: string) => void) {
  pickerDialog?.remove();
  const d = document.createElement('dialog');
  d.className = 'a-dialog';
  d.innerHTML = `
    <div class="a-dialog__head"><strong>Choose ${imagesOnly ? 'an image' : 'a file'}</strong><button type="button" class="a-iconbtn" data-close aria-label="Close">✕</button></div>
    <div class="a-dialog__body">
      <label class="a-drop" data-drop>Drop a file here or <u>browse</u><input type="file" hidden data-file ${imagesOnly ? 'accept="image/*"' : ''} /></label>
      <p class="a-error" data-err hidden></p>
      <input class="a-input" type="search" placeholder="Search library…" data-q />
      <div class="a-media-grid" data-grid><p class="a-help">Loading…</p></div>
    </div>`;
  document.body.append(d);
  pickerDialog = d;
  d.showModal();
  d.querySelector('[data-close]')!.addEventListener('click', () => d.close());
  d.addEventListener('close', () => d.remove());
  const grid = d.querySelector<HTMLElement>('[data-grid]')!;
  const load = async (q = '') => {
    const res = await fetch(`/admin/api/media?${new URLSearchParams({ q, images: imagesOnly ? '1' : '' })}`);
    const items: Media[] = await res.json();
    grid.innerHTML = '';
    if (!items.length) grid.innerHTML = '<p class="a-help">No files yet — upload one above.</p>';
    items.forEach((m) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'a-media-tile';
      const v = JSON.parse(m.variants || '{}');
      b.innerHTML = m.mime.startsWith('image/') ? `<img src="${v.thumb ?? m.path}" alt="" loading="lazy" />` : `<div class="a-file">${m.path.split('.').pop()!.toUpperCase()}</div>`;
      const s = document.createElement('span');
      s.textContent = m.original_name;
      b.append(s);
      b.addEventListener('click', () => { onPick(m.path); d.close(); });
      grid.append(b);
    });
  };
  let t: number | undefined;
  d.querySelector<HTMLInputElement>('[data-q]')!.addEventListener('input', (e) => { clearTimeout(t); t = window.setTimeout(() => load((e.target as HTMLInputElement).value), 250); });
  const drop = d.querySelector<HTMLElement>('[data-drop]')!;
  const fileInput = d.querySelector<HTMLInputElement>('[data-file]')!;
  const err = d.querySelector<HTMLElement>('[data-err]')!;
  const upload = async (file: File) => {
    err.hidden = true;
    drop.textContent = `Uploading ${file.name}…`;
    const r = await uploadFile(file);
    if ('error' in r) { err.textContent = r.error; err.hidden = false; drop.textContent = 'Drop a file here or browse'; return; }
    onPick(r.path);
    d.close();
  };
  fileInput.addEventListener('change', () => fileInput.files?.[0] && upload(fileInput.files[0]));
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('is-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('is-over'); const f = e.dataTransfer?.files[0]; if (f) upload(f); });
  load();
}

export async function uploadFile(file: File): Promise<{ path: string } | { error: string }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/admin/api/media', { method: 'POST', body: fd });
  const j = await res.json().catch(() => ({ error: 'Upload failed.' }));
  return res.ok ? j : { error: j.error ?? 'Upload failed.' };
}

/* ---------------- rich text ---------------- */
function initEditor(wrap: HTMLElement) {
  if (wrap.dataset.ready) return;
  wrap.dataset.ready = '1';
  const input = wrap.querySelector<HTMLTextAreaElement>('[data-rte-input]')!;
  const bar = wrap.querySelector<HTMLElement>('[data-rte-bar]')!;
  const editor = new Editor({
    element: wrap.querySelector<HTMLElement>('[data-rte-body]')!,
    injectCSS: false, // CSP forbids injected <style> elements; editor styles live in admin.css
    extensions: [StarterKit.configure({ link: false }), Link.configure({ openOnClick: false }), Image],
    content: input.value,
    onUpdate: ({ editor }) => { input.value = editor.getHTML(); },
  });
  const buttons: [string, string, () => void, () => boolean][] = [
    ['B', 'Bold', () => editor.chain().focus().toggleBold().run(), () => editor.isActive('bold')],
    ['I', 'Italic', () => editor.chain().focus().toggleItalic().run(), () => editor.isActive('italic')],
    ['H2', 'Heading', () => editor.chain().focus().toggleHeading({ level: 2 }).run(), () => editor.isActive('heading', { level: 2 })],
    ['H3', 'Subheading', () => editor.chain().focus().toggleHeading({ level: 3 }).run(), () => editor.isActive('heading', { level: 3 })],
    ['• List', 'Bullet list', () => editor.chain().focus().toggleBulletList().run(), () => editor.isActive('bulletList')],
    ['1. List', 'Numbered list', () => editor.chain().focus().toggleOrderedList().run(), () => editor.isActive('orderedList')],
    ['❝', 'Quote', () => editor.chain().focus().toggleBlockquote().run(), () => editor.isActive('blockquote')],
    ['Link', 'Add link', () => {
      const prev = editor.getAttributes('link').href ?? '';
      const url = window.prompt('Link URL (leave empty to remove)', prev);
      if (url === null) return;
      if (!url) editor.chain().focus().unsetLink().run();
      else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, () => editor.isActive('link')],
    ['Image', 'Insert image', () => openPicker(true, (src) => editor.chain().focus().setImage({ src }).run()), () => false],
    ['↶', 'Undo', () => editor.chain().focus().undo().run(), () => false],
    ['↷', 'Redo', () => editor.chain().focus().redo().run(), () => false],
  ];
  const els = buttons.map(([label, title, run]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.title = title;
    b.setAttribute('aria-label', title);
    b.addEventListener('click', run);
    bar.append(b);
    return b;
  });
  const sync = () => els.forEach((b, i) => b.classList.toggle('is-on', buttons[i][3]()));
  editor.on('selectionUpdate', sync);
  editor.on('transaction', sync);
}

/* ---------------- boot ---------------- */
document.querySelectorAll<HTMLFormElement>('form[data-entry-form]').forEach((form) => {
  form.querySelectorAll<HTMLElement>('[data-repeater]').forEach((r) => { if (!r.closest('template')) initRepeater(r); });
  initFields(form);
  let dirty = false;
  form.addEventListener('input', () => { dirty = true; });
  form.addEventListener('submit', () => { renumber(form); dirty = false; });
  window.addEventListener('beforeunload', (e) => { if (dirty) e.preventDefault(); });
});
