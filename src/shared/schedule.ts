import type { Settings } from './schema';

/** The theme id to use right now, honouring the automatic day/night schedule. */
export function pickThemeId(s: Settings, now: Date, prefersDark: boolean): string {
  const sc = s.schedule;
  if (!sc.enabled) return s.activeThemeId;
  if (sc.mode === 'system') return prefersDark ? sc.nightThemeId : sc.dayThemeId;
  const m = now.getHours() * 60 + now.getMinutes();
  const day = sc.dayStart < sc.nightStart ? m >= sc.dayStart && m < sc.nightStart : m >= sc.dayStart || m < sc.nightStart;
  return day ? sc.dayThemeId : sc.nightThemeId;
}

export const toTime = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export function fromTime(v: string, fb: number): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(v);
  return m ? Math.min(1439, Number(m[1]) * 60 + Number(m[2])) : fb;
}
