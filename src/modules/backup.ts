import { BACKUP_FORMAT, BACKUP_VERSION, type ParsedBackup } from '../shared/backup';
import { normalizeBlocklist } from '../shared/blocklist';
import { normalizeFocus } from '../shared/focus';
import { KEYS, wpKey } from '../shared/keys';
import { normalizeProfiles } from '../shared/profile';
import { normalizeSettings } from '../shared/schema';
import { normalizeThemes } from '../shared/theme';
import { normalizeYtLayout } from '../shared/ytlayout';
import { disableSite, enableSites } from './sites';

/** Everything the user configured, as one JSON file. Nothing is sent anywhere. */
export async function exportBackup(includeWallpapers: boolean): Promise<string> {
  const all = await chrome.storage.local.get(null);
  const index: { id: string; name: string }[] = [];
  const items: Record<string, string> = {};
  if (includeWallpapers && Array.isArray(all[KEYS.wpIndex])) {
    for (const e of all[KEYS.wpIndex] as { id?: unknown; name?: unknown }[]) {
      const data = typeof e?.id === 'string' ? all[wpKey(e.id)] : undefined;
      if (typeof e?.id === 'string' && typeof data === 'string') {
        items[e.id] = data;
        index.push({ id: e.id, name: typeof e.name === 'string' ? e.name : 'Wallpaper' });
      }
    }
  }
  return JSON.stringify(
    {
      format: BACKUP_FORMAT,
      formatVersion: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      settings: normalizeSettings(all[KEYS.settings]),
      themes: normalizeThemes(all[KEYS.themes]),
      profiles: normalizeProfiles(all[KEYS.profiles]),
      focus: normalizeFocus(all[KEYS.focus]),
      blocklist: normalizeBlocklist(all[KEYS.blocklist]),
      ytLayout: normalizeYtLayout(all[KEYS.ytLayout]),
      wallpapers: { index, items },
    },
    null,
    2,
  );
}

/** Replaces all NEBULA data with the backup. Call directly from a click (site permissions need a user gesture). */
export async function restoreBackup(b: ParsedBackup, currentSites: string[]): Promise<string | null> {
  const granted = await enableSites(b.settings.sites);
  for (const s of currentSites) if (!granted.includes(s)) await disableSite(s);
  const payload: Record<string, unknown> = {
    [KEYS.settings]: { ...b.settings, sites: granted },
    [KEYS.themes]: b.themes,
    [KEYS.profiles]: b.profiles,
    [KEYS.focus]: b.focus,
    [KEYS.blocklist]: b.blocklist,
    [KEYS.ytLayout]: b.ytLayout,
    [KEYS.wpIndex]: b.wallpapers.index,
  };
  for (const [id, data] of Object.entries(b.wallpapers.items)) payload[wpKey(id)] = data;
  try {
    const all = await chrome.storage.local.get(null);
    const stale = Object.keys(all).filter((k) => k.startsWith('nebula:') && !(k in payload) && k !== KEYS.usage);
    await chrome.storage.local.set(payload); // write first, so a quota failure leaves the old data intact
    if (stale.length) await chrome.storage.local.remove(stale);
    return null;
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    return /quota/i.test(m) ? 'Storage is full. Restore without wallpapers or free some space.' : m;
  }
}
