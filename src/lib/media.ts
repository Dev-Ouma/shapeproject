// Media uploads: validated by magic bytes, images resized to WebP variants with sharp.
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';
import { getDb } from './db';

export const UPLOAD_DIR = () => resolve(process.env.UPLOAD_DIR ?? 'var/uploads');
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

const SIGNATURES: { mime: string; ext: string; test: (b: Buffer) => boolean }[] = [
  { mime: 'image/jpeg', ext: 'jpg', test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png', ext: 'png', test: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/webp', ext: 'webp', test: (b) => b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP' },
  { mime: 'image/gif', ext: 'gif', test: (b) => b.subarray(0, 4).toString() === 'GIF8' },
  { mime: 'application/pdf', ext: 'pdf', test: (b) => b.subarray(0, 5).toString() === '%PDF-' },
  { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx', test: (b) => b[0] === 0x50 && b[1] === 0x4b },
  { mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: 'pptx', test: (b) => b[0] === 0x50 && b[1] === 0x4b },
];

export type MediaRow = { id: number; path: string; original_name: string; mime: string; size: number; width: number | null; height: number | null; alt: string; variants: string; created_at: string };

export function detectType(buf: Buffer, filename: string) {
  const ext = extname(filename).slice(1).toLowerCase();
  const matches = SIGNATURES.filter((s) => s.test(buf));
  // Office files are ZIPs: disambiguate by extension.
  return matches.find((s) => s.ext === ext) ?? matches.find((s) => !['docx', 'pptx'].includes(s.ext));
}

export async function saveUpload(file: File, userId: number, alt = ''): Promise<{ ok: true; media: MediaRow } | { ok: false; error: string }> {
  if (file.size === 0) return { ok: false, error: 'Empty file.' };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: 'File is larger than 20 MB.' };
  const buf = Buffer.from(await file.arrayBuffer());
  const type = detectType(buf, file.name);
  if (!type) return { ok: false, error: 'Unsupported file type. Use JPG, PNG, WebP, GIF, PDF, DOCX or PPTX.' };

  const now = new Date();
  const sub = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const dir = join(UPLOAD_DIR(), sub);
  mkdirSync(dir, { recursive: true });
  const base = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'file';
  const name = `${base}-${randomBytes(3).toString('hex')}`;

  let width: number | null = null;
  let height: number | null = null;
  const variants: Record<string, string> = {};
  let storedExt = type.ext;
  let storedBuf = buf;

  if (type.mime.startsWith('image/')) {
    const img = sharp(buf, { animated: type.ext === 'gif' }).rotate();
    const meta = await img.metadata();
    width = meta.width ?? null;
    height = meta.pageHeight ?? meta.height ?? null;
    // Re-encode the original (strips metadata such as GPS) unless it is an animated GIF.
    if (type.ext !== 'gif') {
      storedBuf = await img.clone().resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true }).toFormat(type.ext === 'png' ? 'png' : type.ext === 'webp' ? 'webp' : 'jpeg', { quality: 85 }).toBuffer();
      storedExt = type.ext === 'png' ? 'png' : type.ext === 'webp' ? 'webp' : 'jpg';
      for (const [key, w] of [['thumb', 400], ['medium', 1024], ['large', 1600]] as const) {
        if (!width || width > w) {
          const vname = `${name}-${key}.webp`;
          await img.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toFile(join(dir, vname));
          variants[key] = `/uploads/${sub}/${vname}`;
        }
      }
    }
  }

  const fname = `${name}.${storedExt}`;
  writeFileSync(join(dir, fname), storedBuf);
  const path = `/uploads/${sub}/${fname}`;
  const r = getDb()
    .prepare('INSERT INTO media (path, original_name, mime, size, width, height, alt, variants, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(path, file.name.slice(0, 200), type.mime, storedBuf.length, width, height, alt.slice(0, 300), JSON.stringify(variants), userId);
  return { ok: true, media: getMedia(Number(r.lastInsertRowid))! };
}

export function getMedia(id: number): MediaRow | undefined {
  return getDb().prepare('SELECT * FROM media WHERE id = ?').get(id) as any;
}

export function listMedia(opts: { q?: string; images?: boolean; limit?: number; offset?: number } = {}): MediaRow[] {
  const where: string[] = [];
  const args: (string | number)[] = [];
  if (opts.q) { where.push('(original_name LIKE ? OR alt LIKE ?)'); args.push(`%${opts.q}%`, `%${opts.q}%`); }
  if (opts.images) where.push("mime LIKE 'image/%'");
  const sql = `SELECT * FROM media ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT ? OFFSET ?`;
  return getDb().prepare(sql).all(...args, opts.limit ?? 60, opts.offset ?? 0) as any;
}

export function updateAlt(id: number, alt: string) {
  getDb().prepare('UPDATE media SET alt = ? WHERE id = ?').run(alt.slice(0, 300), id);
}

/** Where is this file referenced? (entries JSON contains the path) */
export function mediaUsage(path: string): { id: number; collection: string }[] {
  return getDb().prepare('SELECT id, collection FROM entries WHERE instr(data, ?) > 0').all(path) as any;
}

export function deleteMedia(id: number): { ok: boolean; usedBy?: { id: number; collection: string }[] } {
  const m = getMedia(id);
  if (!m) return { ok: false };
  const usedBy = mediaUsage(m.path);
  if (usedBy.length) return { ok: false, usedBy };
  const root = UPLOAD_DIR();
  for (const p of [m.path, ...Object.values(JSON.parse(m.variants) as Record<string, string>)]) {
    const abs = join(root, p.replace(/^\/uploads\//, ''));
    if (abs.startsWith(root) && existsSync(abs)) unlinkSync(abs);
  }
  getDb().prepare('DELETE FROM media WHERE id = ?').run(id);
  return { ok: true };
}
