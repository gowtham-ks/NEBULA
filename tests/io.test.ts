import { describe, expect, it } from 'vitest';
import { importThemeFile } from '../src/modules/themes/io';

describe('importThemeFile', () => {
  it('rejects invalid JSON and foreign files', async () => {
    expect('error' in (await importThemeFile('not json'))).toBe(true);
    expect('error' in (await importThemeFile('{"hello":1}'))).toBe(true);
  });
  it('rejects unsupported versions', async () => {
    expect('error' in (await importThemeFile('{"format":"nebula-theme","formatVersion":99,"themes":[{}]}'))).toBe(true);
  });
  it('imports, clamps and regenerates ids', async () => {
    const res = await importThemeFile(
      JSON.stringify({ format: 'nebula-theme', formatVersion: 1, themes: [{ id: 'amoled', name: 'X', builtin: true, glass: { blur: 999 } }], assets: {} }),
    );
    if ('error' in res) throw new Error(res.error);
    expect(res.themes[0].glass.blur).toBe(40);
    expect(res.themes[0].builtin).toBe(false);
    expect(res.themes[0].id === 'amoled').toBe(false);
  });
});
