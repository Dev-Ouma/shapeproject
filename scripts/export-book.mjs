// Renders /project-book/ to an A4 PDF using the print stylesheet.
// Usage: start the site (npm run dev or npm run preview), then: npm run export:book [baseUrl]
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

const base = process.argv[2] ?? 'http://localhost:4321';
const out = 'public/downloads/SHAPE-Project-Book.pdf';

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
await page.goto(`${base}/project-book/`, { waitUntil: 'networkidle' });
// Make sure every lazy image is loaded before printing.
await page.evaluate(async () => {
  document.querySelectorAll('img').forEach((img) => (img.loading = 'eager'));
  await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => { img.onload = img.onerror = r; }))));
});
await page.emulateMedia({ media: 'print' });
await mkdir('public/downloads', { recursive: true });
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await browser.close();
console.log(`Wrote ${out}`);
