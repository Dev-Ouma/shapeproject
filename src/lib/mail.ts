// Outgoing email via SMTP (OUK mail server, port 587 STARTTLS). Silently disabled when not configured.
import nodemailer from 'nodemailer';

let transport: nodemailer.Transporter | undefined;
function getTransport() {
  if (!process.env.SMTP_HOST) return undefined;
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    requireTLS: Number(process.env.SMTP_PORT ?? 587) === 587,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  return transport;
}

export function mailEnabled() {
  return !!process.env.SMTP_HOST;
}

/** Fire-and-forget notification to the site inbox (NOTIFY_EMAIL or the contact email). */
export function notify(to: string, subject: string, text: string, replyTo?: string) {
  const t = getTransport();
  if (!t) return;
  t.sendMail({ from: process.env.SMTP_FROM ?? process.env.SMTP_USER, to: process.env.NOTIFY_EMAIL ?? to, subject, text, replyTo }).catch((e) => {
    console.error('Mail send failed:', e?.message ?? e);
  });
}

/** Send an email and wait for the result (used for replies, where the CMS records success or failure). */
export async function sendMail(to: string, subject: string, text: string, replyTo?: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const t = getTransport();
  if (!t) return { ok: false, error: 'Email sending is not configured.' };
  try {
    await t.sendMail({ from: process.env.SMTP_FROM ?? process.env.SMTP_USER, to, subject, text, replyTo });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String((e as Error)?.message ?? e).slice(0, 300) };
  }
}
