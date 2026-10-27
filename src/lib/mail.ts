// Outgoing email via SMTP (OUK mail server, port 587 STARTTLS). Silently disabled when not configured.
// MAIL_CAPTURE=<file> (tests) records every message as a JSON line instead of sending it.
import nodemailer from 'nodemailer';
import { appendFileSync } from 'node:fs';

let transport: nodemailer.Transporter | undefined;
function getTransport() {
  if (process.env.MAIL_CAPTURE) return (transport ??= nodemailer.createTransport({ jsonTransport: true }));
  if (!process.env.SMTP_HOST) return undefined;
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    requireTLS: Number(process.env.SMTP_PORT ?? 587) === 587,
    // Google's SMTP relay checks the EHLO name; announce the site's host rather than the machine name.
    name: process.env.SMTP_HELO ?? (process.env.SITE_URL ? new URL(process.env.SITE_URL).hostname : undefined),
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transport;
}

export function mailEnabled() {
  return !!(process.env.SMTP_HOST || process.env.MAIL_CAPTURE);
}

function capture(info: { message?: unknown }) {
  if (process.env.MAIL_CAPTURE && typeof info.message === 'string') appendFileSync(process.env.MAIL_CAPTURE, info.message.replace(/\n/g, ' ') + '\n');
}

/** Fire-and-forget notification to the site inbox (NOTIFY_EMAIL or the contact email). */
export function notify(to: string, subject: string, text: string, replyTo?: string) {
  const t = getTransport();
  if (!t) return;
  t.sendMail({ from: process.env.SMTP_FROM ?? process.env.SMTP_USER, to: process.env.NOTIFY_EMAIL ?? to, subject, text, replyTo }).catch((e) => {
    console.error('Mail send failed:', e?.message ?? e);
  });
}

/** Send an email and wait for the result (replies, account emails), so the CMS can report success or failure. */
export async function sendMail(to: string, subject: string, text: string, replyTo?: string, html?: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const t = getTransport();
  if (!t) return { ok: false, error: 'Email sending is not configured.' };
  try {
    capture(await t.sendMail({ from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'SHAPE Project <shape@ouk.ac.ke>', to, subject, text, html, replyTo }));
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String((e as Error)?.message ?? e).slice(0, 300) };
  }
}
