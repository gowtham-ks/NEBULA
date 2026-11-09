import { describe, expect, it } from 'vitest';
import { normalizeUsage, todayKey } from '../src/shared/usage';

describe('normalizeUsage', () => {
  it('keeps today and drops junk', () => {
    const u = normalizeUsage({ date: '2026-01-02', minutes: { youtube: 12, x: -1, '../': 5, reddit: 'a' } }, '2026-01-02');
    expect(u.minutes).toEqual({ youtube: 12 });
  });
  it('resets on a new day', () => {
    expect(normalizeUsage({ date: '2026-01-01', minutes: { youtube: 99 } }, '2026-01-02').minutes).toEqual({});
  });
  it('formats the day key', () => {
    expect(todayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
