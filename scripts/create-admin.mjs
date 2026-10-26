// Create (or reset the password of) an admin account from the server shell.
// Usage: npm run create-admin -- --email you@example.org --name "Your Name"
// The password is read interactively or from ADMIN_PASSWORD (never passed as an argument).
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, scryptSync } from 'node:crypto';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const args = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean).map((p) => { const [k, ...v] = p.trim().split(' '); return [k, v.join(' ').replace(/^"|"$/g, '')]; }));
const email = (args.email ?? '').toLowerCase();
const name = args.name || 'Administrator';
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { console.error('Usage: npm run create-admin -- --email you@example.org --name "Your Name"'); process.exit(1); }

const dbPath = resolve(process.env.DB_PATH ?? 'var/shape.db');
if (!existsSync(dbPath)) { console.error(`Database not found at ${dbPath}. Start the site once so it can create and seed the database.`); process.exit(1); }

function ask(q) {
  return new Promise((res) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(q)) rl.output.write(s); };
    rl.question(q, (a) => { rl.close(); process.stdout.write('\n'); res(a); });
  });
}
const pw = process.env.ADMIN_PASSWORD ?? (await ask('Password (min 12 chars, letters + numbers): '));
if (pw.length < 8) { console.error('Password must be at least 8 characters.'); process.exit(1); }
if (pw.length < 12 || !/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) console.warn('Warning: this password is weaker than the CMS policy (12+ characters, letters and numbers). Change it from My account after signing in.');

const salt = randomBytes(16);
const hash = `scrypt$${salt.toString('base64')}$${scryptSync(pw, salt, 64, { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }).toString('base64')}`;
const db = new DatabaseSync(dbPath);
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
if (existing) {
  db.prepare("UPDATE users SET password_hash = ?, role = 'admin', disabled = 0 WHERE id = ?").run(hash, existing.id);
  console.log(`Updated ${email}: password reset, role admin.`);
} else {
  db.prepare("INSERT INTO users (email, name, role, password_hash) VALUES (?, ?, 'admin', ?)").run(email, name, hash);
  console.log(`Created admin ${email}.`);
}
