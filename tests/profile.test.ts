import { describe, expect, it } from 'vitest';
import { normalizeProfile, normalizeProfiles, selectorOk } from '../src/shared/profile';

describe('selectorOk', () => {
  it('accepts normal selectors', () => {
    expect(selectorOk('div.card > a[href="/x"]')).toBe(true);
  });
  it('rejects selectors that could escape a CSS rule', () => {
    expect(selectorOk('a{color:red}')).toBe(false);
    expect(selectorOk('a;b')).toBe(false);
    expect(selectorOk('a/*x*/')).toBe(false);
  });
});

describe('normalizeProfile(s)', () => {
  it('drops invalid rules and keeps valid ones', () => {
    const p = normalizeProfile({ rules: [{ selector: 'a{}' }, { selector: '.ok', label: 'Ok' }] });
    expect(p.rules.length).toBe(1);
    expect(p.rules[0].selector).toBe('.ok');
  });
  it('ignores keys that are not origin patterns', () => {
    const out = normalizeProfiles({ '__proto__': {}, 'https://example.com/*': {} });
    expect(Object.keys(out)).toEqual(['https://example.com/*']);
  });
});
