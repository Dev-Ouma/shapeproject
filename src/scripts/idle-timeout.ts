// CMS idle timeout. The server signs a session out after 60 minutes without activity; this script keeps the
// browser in step with it: it reports real activity (at most every 5 minutes), warns 5 minutes before the
// deadline with a countdown, and moves to the sign-in page when the session has ended. Tabs share state
// through BroadcastChannel so activity in one tab keeps the others alive.
const WARN_MS = 5 * 60_000;
const PING_EVERY_MS = 5 * 60_000;

const body = document.body;
const dialog = document.querySelector<HTMLDialogElement>('[data-idle]');
const count = document.querySelector<HTMLElement>('[data-idle-count]');
let endsAt = Number(body.dataset.idleEnds) || 0;
let skew = 0; // server clock minus browser clock
let lastPing = Date.now();
let pending = false;
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('shape-session') : null;

const signedOut = (why = 'idle') => {
  location.href = `/admin/login?ended=${why}&next=${encodeURIComponent(location.pathname + location.search)}`;
};

async function sync(method: 'GET' | 'POST') {
  try {
    const r = await fetch('/admin/api/session', { method, credentials: 'same-origin', headers: { Accept: 'application/json' } });
    const j = await r.json();
    if (!j.signedIn) return signedOut(j.ended ?? 'idle');
    skew = j.now - Date.now();
    endsAt = j.idleEndsAt;
    channel?.postMessage({ endsAt });
  } catch {
    // Offline: keep the last known deadline; the server still enforces it.
  }
}

async function activity() {
  if (pending || Date.now() - lastPing < PING_EVERY_MS || dialog?.open) return;
  pending = true;
  lastPing = Date.now();
  await sync('POST');
  pending = false;
}

for (const ev of ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const) addEventListener(ev, activity, { passive: true });
channel?.addEventListener('message', (e) => {
  if (typeof e.data?.endsAt === 'number' && e.data.endsAt > endsAt) {
    endsAt = e.data.endsAt;
    if (dialog?.open) dialog.close();
  }
});

document.querySelector('[data-idle-stay]')?.addEventListener('click', async () => {
  lastPing = Date.now();
  await sync('POST');
  dialog?.close();
});

function tick() {
  if (!endsAt) return;
  const left = endsAt - (Date.now() + skew);
  if (left <= 0) {
    // Confirm with the server before leaving: another tab may have extended the session.
    sync('GET').then(() => { if (endsAt - (Date.now() + skew) <= 0) signedOut('idle'); });
    return;
  }
  if (left <= WARN_MS) {
    if (dialog && !dialog.open) dialog.showModal();
    const s = Math.ceil(left / 1000);
    if (count) count.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  } else if (dialog?.open) dialog.close();
}
setInterval(tick, 1000);
// Re-check after the device wakes or the tab becomes visible (timers pause while asleep).
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync('GET'); });
