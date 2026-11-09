import { describe, expect, it } from 'vitest';
import { adapterForHost, normalizeFocus } from '../src/shared/focus';

describe('focus config', () => {
  it('defaults every feature to off and drops unknown ones', () => {
    const f = normalizeFocus({ youtube: { shorts: true, bogus: true }, nope: { a: true } });
    expect(f.youtube.shorts).toBe(true);
    expect(f.youtube.comments).toBe(false);
    expect('bogus' in f.youtube).toBe(false);
  });
  it('maps hosts to adapters', () => {
    expect(adapterForHost('www.youtube.com')).toBe('youtube');
    expect(adapterForHost('x.com')).toBe('x');
    expect(adapterForHost('example.com')).toBeNull();
  });
});
