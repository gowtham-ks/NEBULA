import { describe, expect, it } from 'vitest';
import { parseBackup } from '../src/shared/backup';

const PNG = 'data:image/png;base64,AAAA';
const mk = (extra: Record<string, unknown> = {}) =>
  JSON.stringify({ format: 'nebula-backup', formatVersion: 1, settings: { enabled: false }, themes: [], ...extra });

describe('parseBackup', () => {
  it('rejects bad input', () => {
    expect('error' in parseBackup('nope')).toBe(true);
    expect('error' in parseBackup('{"format":"other"}')).toBe(true);
    expect('error' in parseBackup(JSON.stringify({ format: 'nebula-backup', formatVersion: 9 }))).toBe(true);
  });
  it('restores settings and fills defaults', () => {
    const r = parseBackup(mk());
    if ('error' in r) throw new Error(r.error);
    expect(r.backup.settings.enabled).toBe(false);
    expect(r.backup.settings.schedule.enabled).toBe(false);
    expect(r.backup.focus.youtube.shorts).toBe(false);
  });
  it('keeps only valid wallpapers and unlinks themes from missing ones', () => {
    const r = parseBackup(
      mk({
        themes: [{ id: 't1', name: 'T', wallpaper: { assetId: 'gone' } }, { id: 't2', name: 'T2', wallpaper: { assetId: 'w1' } }],
        wallpapers: { index: [{ id: 'w1', name: 'A' }, { id: 'bad', name: 'B' }], items: { w1: PNG, bad: 'javascript:alert(1)' } },
      }),
    );
    if ('error' in r) throw new Error(r.error);
    expect(r.backup.wallpapers.index.length).toBe(1);
    expect(r.backup.themes[0].wallpaper.assetId).toBeNull();
    expect(r.backup.themes[1].wallpaper.assetId).toBe('w1');
  });
});
