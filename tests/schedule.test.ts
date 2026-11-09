import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, normalizeSettings } from '../src/shared/schema';
import { fromTime, pickThemeId, toTime } from '../src/shared/schedule';

const on = normalizeSettings({ activeThemeId: 'mine', schedule: { enabled: true, dayThemeId: 'day', nightThemeId: 'night', dayStart: 420, nightStart: 1140 } });
const at = (h: number, m = 0) => new Date(2026, 0, 1, h, m);

describe('pickThemeId', () => {
  it('uses the active theme when the schedule is off', () => {
    expect(pickThemeId({ ...DEFAULT_SETTINGS, activeThemeId: 'x' }, at(12), true)).toBe('x');
  });
  it('switches by time of day', () => {
    expect(pickThemeId(on, at(12), false)).toBe('day');
    expect(pickThemeId(on, at(7, 0), false)).toBe('day');
    expect(pickThemeId(on, at(19, 0), false)).toBe('night');
    expect(pickThemeId(on, at(3), false)).toBe('night');
  });
  it('handles a day that wraps past midnight', () => {
    const w = normalizeSettings({ schedule: { enabled: true, dayThemeId: 'day', nightThemeId: 'night', dayStart: 1320, nightStart: 360 } });
    expect(pickThemeId(w, at(23), false)).toBe('day');
    expect(pickThemeId(w, at(12), false)).toBe('night');
  });
  it('follows the system preference in system mode', () => {
    const s = normalizeSettings({ schedule: { enabled: true, mode: 'system', dayThemeId: 'day', nightThemeId: 'night' } });
    expect(pickThemeId(s, at(12), true)).toBe('night');
    expect(pickThemeId(s, at(12), false)).toBe('day');
  });
});

describe('time helpers and settings v2', () => {
  it('round-trips times', () => {
    expect(toTime(425)).toBe('07:05');
    expect(fromTime('07:05', 0)).toBe(425);
    expect(fromTime('bad', 9)).toBe(9);
  });
  it('clamps limits and upgrades old settings', () => {
    const s = normalizeSettings({ enabled: false, limits: { youtube: 9999, x: -5 }, sites: ['https://a.com/*', 'junk'] });
    expect(s.limits.youtube).toBe(600);
    expect(s.limits.x).toBe(0);
    expect(s.sites).toEqual(['https://a.com/*']);
    expect(s.schedule.enabled).toBe(false);
    expect(s.onboarded).toBe(false);
  });
});
