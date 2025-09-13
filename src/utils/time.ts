import dayjs from 'dayjs';

export function fmtDate(ts?: number) {
  return ts ? dayjs(ts).format('YYYY-MM-DD HH:mm:ss') : '-';
}

export function durationMs(start?: number, end?: number) {
  if (!start) return 0;
  const e = end ?? Date.now();
  return Math.max(0, e - start);
}

export function fmtDuration(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

