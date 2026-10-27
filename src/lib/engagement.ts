// Comments (moderated) and contact-form messages.
import { createHash } from 'node:crypto';
import { getDb } from './db';
import { plainText } from './sanitize';

export type Comment = { id: number; post_slug: string; author: string; email: string; url: string | null; body: string; status: 'pending' | 'approved' | 'spam'; created_at: string };

const ipHash = (ip: string) => createHash('sha256').update(`${process.env.SESSION_SECRET ?? 'shape'}|${ip}`).digest('hex').slice(0, 32);

// Simple per-IP throttle for public forms.
const recent = new Map<string, number[]>();
export function throttled(ip: string, max = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const list = (recent.get(ip) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  recent.set(ip, list);
  return list.length > max;
}
export function resetThrottle() {
  recent.clear();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function addComment(input: { post: string; author: string; email: string; url?: string; body: string; ip: string }): { ok: true; id: number } | { ok: false; error: string } {
  const author = plainText(input.author, 100);
  const email = input.email.trim().slice(0, 200);
  const body = plainText(input.body, 5000);
  let url = (input.url ?? '').trim().slice(0, 200);
  if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
  if (!author || !body || !EMAIL_RE.test(email)) return { ok: false, error: 'Name, a valid email and a comment are required.' };
  const r = getDb()
    .prepare('INSERT INTO comments (post_slug, author, email, url, body, ip_hash) VALUES (?, ?, ?, ?, ?, ?)')
    .run(input.post, author, email, url || null, body, ipHash(input.ip));
  return { ok: true, id: Number(r.lastInsertRowid) };
}

export function approvedComments(slug: string): Comment[] {
  return getDb().prepare("SELECT * FROM comments WHERE post_slug = ? AND status = 'approved' ORDER BY created_at").all(slug) as any;
}

export function listComments(status?: Comment['status']): Comment[] {
  return (status
    ? getDb().prepare('SELECT * FROM comments WHERE status = ? ORDER BY id DESC').all(status)
    : getDb().prepare('SELECT * FROM comments ORDER BY id DESC').all()) as any;
}

export function setCommentStatus(id: number, status: Comment['status']) {
  getDb().prepare('UPDATE comments SET status = ? WHERE id = ?').run(status, id);
}

export function deleteComment(id: number) {
  getDb().prepare('DELETE FROM comments WHERE id = ?').run(id);
}

export function countPendingComments(): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM comments WHERE status = 'pending'").get() as { n: number }).n;
}

/* ---------------- messages ---------------- */

export type Message = { id: number; name: string; email: string; subject: string; body: string; read: number; starred: number; archived: number; created_at: string };
export type MessageReply = { id: number; message_id: number; user_id: number | null; author: string | null; body: string; status: 'sent' | 'failed' | 'logged'; error: string | null; created_at: string };
export type InboxFolder = 'inbox' | 'unread' | 'starred' | 'archived' | 'all';
export const INBOX_FOLDERS: InboxFolder[] = ['inbox', 'unread', 'starred', 'archived', 'all'];

const FOLDER_WHERE: Record<InboxFolder, string> = {
  inbox: 'archived = 0',
  unread: 'read = 0 AND archived = 0',
  starred: 'starred = 1',
  archived: 'archived = 1',
  all: '1 = 1',
};

export function addMessage(input: { name: string; email: string; subject: string; body: string }): { ok: true; id: number } | { ok: false; error: string } {
  const name = plainText(input.name, 100);
  const email = input.email.trim().slice(0, 200);
  const subject = plainText(input.subject, 200);
  const body = plainText(input.body, 5000);
  if (!name || !subject || !body || !EMAIL_RE.test(email)) return { ok: false, error: 'All fields are required.' };
  const r = getDb().prepare('INSERT INTO messages (name, email, subject, body) VALUES (?, ?, ?, ?)').run(name, email, subject, body);
  return { ok: true, id: Number(r.lastInsertRowid) };
}

export function listMessages(folder: InboxFolder = 'all', q = ''): (Message & { replies: number })[] {
  const args: string[] = [];
  let where = FOLDER_WHERE[folder] ?? FOLDER_WHERE.all;
  if (q.trim()) {
    where += ' AND (name LIKE ? OR email LIKE ? OR subject LIKE ? OR body LIKE ?)';
    const like = `%${q.trim().slice(0, 100)}%`;
    args.push(like, like, like, like);
  }
  return getDb()
    .prepare(`SELECT m.*, (SELECT COUNT(*) FROM message_replies r WHERE r.message_id = m.id) AS replies FROM messages m WHERE ${where} ORDER BY m.id DESC LIMIT 500`)
    .all(...args) as any;
}

export function folderCounts(): Record<InboxFolder, number> {
  const out = {} as Record<InboxFolder, number>;
  for (const f of INBOX_FOLDERS) out[f] = (getDb().prepare(`SELECT COUNT(*) AS n FROM messages WHERE ${FOLDER_WHERE[f]}`).get() as { n: number }).n;
  return out;
}

export function setStarred(id: number, on: boolean) {
  getDb().prepare('UPDATE messages SET starred = ? WHERE id = ?').run(on ? 1 : 0, id);
}

export function setArchived(id: number, on: boolean) {
  getDb().prepare('UPDATE messages SET archived = ? WHERE id = ?').run(on ? 1 : 0, id);
}

export function markAllRead() {
  getDb().prepare('UPDATE messages SET read = 1 WHERE read = 0').run();
}

export function listReplies(messageId: number): MessageReply[] {
  return getDb()
    .prepare('SELECT r.*, u.name AS author FROM message_replies r LEFT JOIN users u ON u.id = r.user_id WHERE r.message_id = ? ORDER BY r.id')
    .all(messageId) as any;
}

/** Record a reply in the CMS; status says whether it was emailed, failed, or only logged (no SMTP). */
export function addReply(messageId: number, userId: number, body: string, status: MessageReply['status'], error?: string): number {
  const r = getDb()
    .prepare('INSERT INTO message_replies (message_id, user_id, body, status, error) VALUES (?, ?, ?, ?, ?)')
    .run(messageId, userId, body, status, error ?? null);
  return Number(r.lastInsertRowid);
}

export function getMessage(id: number): Message | undefined {
  return getDb().prepare('SELECT * FROM messages WHERE id = ?').get(id) as any;
}

export function markRead(id: number, read = true) {
  getDb().prepare('UPDATE messages SET read = ? WHERE id = ?').run(read ? 1 : 0, id);
}

export function deleteMessage(id: number) {
  getDb().prepare('DELETE FROM messages WHERE id = ?').run(id);
}

export function countUnreadMessages(): number {
  return (getDb().prepare('SELECT COUNT(*) AS n FROM messages WHERE read = 0 AND archived = 0').get() as { n: number }).n;
}
