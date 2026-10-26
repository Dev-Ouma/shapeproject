export type Status = 'done' | 'progress' | 'upcoming';

export const statusLabel: Record<Status, string> = {
  done: 'Completed',
  progress: 'In Progress',
  upcoming: 'Upcoming',
};

/** Project month for `date`, where Month 1 is the month of `start` (clamped to the project length). */
export function projectMonth(start: string, months: number, date: Date = new Date()): number {
  const s = new Date(start + 'T00:00:00Z');
  const m = (date.getUTCFullYear() - s.getUTCFullYear()) * 12 + (date.getUTCMonth() - s.getUTCMonth()) + 1;
  return Math.min(Math.max(m, 1), months);
}

export function wpStatus(wp: { start: number; end: number }, current: number): Status {
  if (wp.end < current) return 'done';
  if (wp.start > current) return 'upcoming';
  return 'progress';
}

export function wpProgress(wp: { start: number; end: number }, current: number): number {
  const s = wpStatus(wp, current);
  if (s === 'done') return 100;
  if (s === 'upcoming') return 0;
  const pct = Math.round(((current - wp.start) / (wp.end - wp.start)) * 100);
  return Math.max(4, Math.min(96, pct));
}
