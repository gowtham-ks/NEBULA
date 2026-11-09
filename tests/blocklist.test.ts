import { describe, expect, it } from 'vitest';
import { buildMatcher, normalizeBlocklist } from '../src/shared/blocklist';

describe('normalizeBlocklist', () => {
  it('trims, dedupes case-insensitively and drops junk', () => {
    const b = normalizeBlocklist({ channels: [' Foo ', 'foo', 3, ''], words: ['a  b'] });
    expect(b.channels).toEqual(['Foo']);
    expect(b.words).toEqual(['a b']);
  });
  it('survives garbage', () => {
    expect(normalizeBlocklist('x')).toEqual({ channels: [], words: [] });
  });
});

describe('buildMatcher', () => {
  it('returns null for an empty list', () => {
    expect(buildMatcher([])).toBeNull();
  });
  it('matches whole words only, ignoring case', () => {
    const re = buildMatcher(['war'])!;
    expect(re.test('The War Begins')).toBe(true);
    expect(re.test('a warm day')).toBe(false);
  });
  it('is Unicode aware and escapes regex characters', () => {
    expect(buildMatcher(['café'])!.test('Un café noir')).toBe(true);
    expect(buildMatcher(['c++'])!.test('learn c++ today')).toBe(true);
    expect(buildMatcher(['a.b'])!.test('axb')).toBe(false);
  });
});
