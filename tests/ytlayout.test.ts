import { describe, expect, it } from 'vitest';
import { normalizeYtLayout } from '../src/shared/ytlayout';

describe('normalizeYtLayout', () => {
  it('defaults to off and clamps', () => {
    const l = normalizeYtLayout({ hero: 999, name: '  Alex\u0000  ' });
    expect(l.enabled).toBe(false);
    expect(l.hero).toBe(60);
    expect(l.name).toBe('Alex');
  });
  it('limits the name length and survives garbage', () => {
    expect(normalizeYtLayout({ name: 'x'.repeat(100) }).name.length).toBe(30);
    expect(normalizeYtLayout(5).hero).toBe(32);
  });
});
