import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME, normalizeTheme, normalizeThemes, PRESETS } from '../src/shared/theme';
import { buildCss } from '../src/shared/css';

describe('normalizeTheme', () => {
  it('clamps numbers', () => {
    expect(normalizeTheme({ glass: { blur: 999 } }).glass.blur).toBe(40);
  });
  it('rejects colours that could break out of a rule', () => {
    const t = normalizeTheme({ appearance: { bgColor: 'red;}body{display:none' } });
    expect(t.appearance.bgColor).toBe(DEFAULT_THEME.appearance.bgColor);
  });
  it('rejects unsafe font families', () => {
    expect(normalizeTheme({ typography: { fontFamily: 'a;}body{x' } }).typography.fontFamily).toBeNull();
  });
  it('survives garbage input', () => {
    expect(normalizeTheme('nonsense').id).toBe(DEFAULT_THEME.id);
  });
});

describe('normalizeThemes', () => {
  it('drops duplicates of preset ids and never marks builtin', () => {
    const list = normalizeThemes([{ id: PRESETS[0].id, name: 'x' }, { id: 'mine', name: 'Mine', builtin: true }]);
    expect(list.length).toBe(1);
    expect(list[0].builtin).toBe(false);
  });
});

describe('buildCss', () => {
  it('emits no glass rules when glass is off', () => {
    expect(buildCss(DEFAULT_THEME, false).includes('backdrop-filter')).toBe(false);
  });
  it('emits glass rules when enabled', () => {
    const frosted = PRESETS.find((p) => p.id === 'frosted-glass')!;
    expect(buildCss(frosted, false).includes('backdrop-filter')).toBe(true);
  });
});

describe('presets', () => {
  it('include Dusk Glass with glass enabled', () => {
    const dusk = PRESETS.find((p) => p.id === 'dusk-glass');
    expect(dusk !== undefined && dusk.glass.enabled).toBe(true);
  });
});
