// Local, per-day minutes spent on supported sites. Only recorded for sites where the user set a daily limit.
export interface Usage { date: string; minutes: Record<string, number> }

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function normalizeUsage(raw: unknown, today: string): Usage {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  if (r.date !== today) return { date: today, minutes: {} }; // a new day starts from zero
  const minutes: Record<string, number> = {};
  const m = (typeof r.minutes === 'object' && r.minutes !== null ? r.minutes : {}) as Record<string, unknown>;
  for (const [k, v] of Object.entries(m)) {
    if (/^[a-z]{1,20}$/.test(k) && typeof v === 'number' && Number.isFinite(v) && v >= 0) minutes[k] = Math.min(1440, Math.floor(v));
  }
  return { date: today, minutes };
}
