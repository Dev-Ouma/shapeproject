// Project Book PDF: regenerated on demand from the live /project-book/ page.
import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { UPLOAD_DIR } from './media';

export const BOOK_PUBLIC_PATH = '/uploads/book/SHAPE-Project-Book.pdf';
const STATIC_FALLBACK = '/downloads/SHAPE-Project-Book.pdf';

export function bookPdfFile() {
  return join(UPLOAD_DIR(), 'book', 'SHAPE-Project-Book.pdf');
}

/** URL of the newest PDF: the regenerated one if present, else the one shipped with the build. */
export function bookPdfUrl(): string {
  return existsSync(bookPdfFile()) ? `${BOOK_PUBLIC_PATH}?v=${Math.round(statSync(bookPdfFile()).mtimeMs)}` : STATIC_FALLBACK;
}

export function bookPdfInfo() {
  const f = bookPdfFile();
  return existsSync(f) ? { updated: statSync(f).mtime, size: statSync(f).size } : undefined;
}

let running: Promise<{ ok: boolean; log: string }> | undefined;

export function regenerateBook(baseUrl: string): Promise<{ ok: boolean; log: string }> {
  if (running) return running;
  running = new Promise((res) => {
    const child = spawn(process.execPath, [resolve('scripts/export-book.mjs'), baseUrl, bookPdfFile()], { env: process.env });
    let log = '';
    child.stdout.on('data', (d) => (log += d));
    child.stderr.on('data', (d) => (log += d));
    const timer = setTimeout(() => child.kill('SIGKILL'), 120_000);
    child.on('close', (code) => { clearTimeout(timer); running = undefined; res({ ok: code === 0, log: log.slice(-2000) }); });
  });
  return running;
}
