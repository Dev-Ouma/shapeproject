// Time-based one-time passwords (RFC 6238, SHA-1, 6 digits, 30 s) for CMS sign-in,
// plus single-use recovery codes. Secrets are base32 so any authenticator app can import them.
import { createHmac, randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import QRCode from 'qrcode';
import { getDb } from './db';

const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const STEP = 30;

export function base32Encode(buf: Buffer): string {
  let bits = '';
  for (const b of buf) bits += b.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i < bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5).padEnd(5, '0'), 2)];
  return out;
}

export function base32Decode(s: string): Buffer {
  const clean = s.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  for (const c of clean) bits += B32.indexOf(c).toString(2).padStart(5, '0');
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(bytes);
}

export function generateSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpAt(secret: string, step: number): string {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const h = createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const off = h[h.length - 1] & 0xf;
  const code = ((h.readUInt32BE(off) & 0x7fffffff) % 1_000_000).toString().padStart(6, '0');
  return code;
}

export const currentStep = (now = Date.now()) => Math.floor(now / 1000 / STEP);

/** Returns the matching time step (±1 for clock drift) or null. */
export function verifyTotp(secret: string, code: string, now = Date.now()): number | null {
  const c = code.replace(/\s/g, '');
  if (!/^\d{6}$/.test(c)) return null;
  const s = currentStep(now);
  for (const step of [s - 1, s, s + 1]) {
    const expected = Buffer.from(totpAt(secret, step));
    if (timingSafeEqual(expected, Buffer.from(c))) return step;
  }
  return null;
}

export function otpauthUrl(secret: string, email: string): string {
  const issuer = 'SHAPE CMS';
  return `otpauth://totp/${encodeURIComponent(`${issuer}:${email}`)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=${STEP}`;
}

export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: 'svg', margin: 1, color: { dark: '#037b90', light: '#ffffff' }, errorCorrectionLevel: 'M' });
}

const sha = (s: string) => createHash('sha256').update(s).digest('hex');

/* ---------- per-user state ---------- */

type OtpRow = { totp_secret: string | null; totp_enabled: number; totp_last_step: number; recovery_codes: string };

function row(userId: number): OtpRow | undefined {
  return getDb().prepare('SELECT totp_secret, totp_enabled, totp_last_step, recovery_codes FROM users WHERE id = ?').get(userId) as any;
}

export function otpEnabled(userId: number): boolean {
  return !!row(userId)?.totp_enabled;
}

/** Start enrolment: store a fresh (not yet enabled) secret and return it. */
export function beginEnrolment(userId: number): string {
  const r = row(userId);
  if (r?.totp_secret && !r.totp_enabled) return r.totp_secret;
  const secret = generateSecret();
  getDb().prepare('UPDATE users SET totp_secret = ?, totp_enabled = 0 WHERE id = ?').run(secret, userId);
  return secret;
}

/** Confirm enrolment with a first code; returns plain recovery codes to show once. */
export function confirmEnrolment(userId: number, code: string): string[] | null {
  const r = row(userId);
  if (!r?.totp_secret) return null;
  const step = verifyTotp(r.totp_secret, code);
  if (step === null) return null;
  const codes = Array.from({ length: 8 }, () => randomBytes(5).toString('hex').replace(/(.{5})/, '$1-'));
  getDb().prepare('UPDATE users SET totp_enabled = 1, totp_last_step = ?, recovery_codes = ? WHERE id = ?').run(step, JSON.stringify(codes.map(sha)), userId);
  return codes;
}

/** Verify a sign-in code (TOTP, replay-protected) or a single-use recovery code. */
export function verifyLoginCode(userId: number, input: string): 'totp' | 'recovery' | null {
  const r = row(userId);
  if (!r?.totp_enabled || !r.totp_secret) return null;
  const step = verifyTotp(r.totp_secret, input);
  if (step !== null && step > r.totp_last_step) {
    getDb().prepare('UPDATE users SET totp_last_step = ? WHERE id = ?').run(step, userId);
    return 'totp';
  }
  const hashes: string[] = JSON.parse(r.recovery_codes);
  const h = sha(input.trim().toLowerCase());
  if (hashes.includes(h)) {
    getDb().prepare('UPDATE users SET recovery_codes = ? WHERE id = ?').run(JSON.stringify(hashes.filter((x) => x !== h)), userId);
    return 'recovery';
  }
  return null;
}

export function recoveryCodesLeft(userId: number): number {
  return JSON.parse(row(userId)?.recovery_codes ?? '[]').length;
}

export function resetOtp(userId: number) {
  getDb().prepare("UPDATE users SET totp_secret = NULL, totp_enabled = 0, totp_last_step = 0, recovery_codes = '[]' WHERE id = ?").run(userId);
}

/** OTP is required for every CMS account unless REQUIRE_OTP=false (e.g. automated tests). */
export const otpRequired = () => process.env.REQUIRE_OTP !== 'false';
