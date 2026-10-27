// Branded 503 page shown to visitors while maintenance mode is on (styles inline: the CSP forbids <style> blocks).
import type { Maintenance } from './system';

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function maintenancePage(m: Maintenance): string {
  const until = m.until && Number.isFinite(Date.parse(m.until))
    ? new Date(m.until).toLocaleString('en-GB', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi' }) + ' (EAT)'
    : '';
  const msg = m.message.trim() || 'We are making some improvements to the SHAPE project website.';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Down for maintenance · SHAPE Project</title>
<link rel="icon" href="/images/cropped-SHAPE-final-Logo-32x32.jpeg" />
</head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(160deg,#e6f4f6 0%,#ffffff 55%,#fff1ea 100%);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#13303a">
<main style="max-width:520px;margin:24px;padding:40px 32px;background:#fff;border:1px solid #d9e6ea;border-radius:18px;box-shadow:0 18px 50px -24px rgba(3,123,144,.35);text-align:center">
<img src="/images/cropped-SHAPE-final-Logo-192x192.jpeg" alt="SHAPE Project" width="72" height="72" style="border-radius:16px" />
<p style="margin:22px 0 6px;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:#037b90;font-weight:700">Scheduled maintenance</p>
<h1 style="margin:0 0 14px;font-size:1.7rem;line-height:1.25">We’ll be back shortly</h1>
<p style="margin:0 0 18px;line-height:1.6;color:#4a6470">${esc(msg)}</p>
${until ? `<p style="margin:0 0 18px;display:inline-block;padding:8px 14px;border-radius:999px;background:#fff1ea;color:#b4461f;font-weight:600;font-size:.9rem">Expected back by ${esc(until)}</p>` : ''}
<p style="margin:0;font-size:.85rem;color:#6b818b">Smart City Higher Education Advancement Program in East Africa</p>
</main>
</body>
</html>`;
}
