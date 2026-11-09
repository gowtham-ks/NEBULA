import { normalizeBlocklist, type Blocklist } from './blocklist';
import { normalizeFocus, type FocusConfig } from './focus';
import { normalizeProfiles, type SiteProfile } from './profile';
import { normalizeSettings, type Settings } from './schema';
import { normalizeThemes, type Theme } from './theme';
import { normalizeYtLayout, type YtLayout } from './ytlayout';

export const BACKUP_FORMAT = 'nebula-backup';
export const BACKUP_VERSION = 1;
const DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const ID_RE = /^[\w-]{1,64}$/;
const obj = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {});

export interface ParsedBackup {
  settings: Settings;
  themes: Theme[];
  profiles: Record<string, SiteProfile>;
  focus: FocusConfig;
  blocklist: Blocklist;
  ytLayout: YtLayout;
  wallpapers: { index: { id: string; name: string }[]; items: Record<string, string> };
}

/** Validates a backup file. Everything is normalised exactly like live storage; nothing is executed. */
export function parseBackup(text: string): { backup: ParsedBackup } | { error: string } {
  if (text.length > 60_000_000) return { error: 'The file is too large.' };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { error: 'This file is not valid JSON.' };
  }
  const r = obj(raw);
  if (r.format !== BACKUP_FORMAT) return { error: 'This is not a NEBULA backup file.' };
  if (r.formatVersion !== BACKUP_VERSION) return { error: 'Unsupported backup version.' };

  const wp = obj(r.wallpapers);
  const items: Record<string, string> = {};
  const index: { id: string; name: string }[] = [];
  const rawItems = obj(wp.items);
  for (const e of (Array.isArray(wp.index) ? wp.index : []).slice(0, 12)) {
    const o = obj(e);
    const data = typeof o.id === 'string' ? rawItems[o.id] : undefined;
    if (typeof o.id === 'string' && ID_RE.test(o.id) && typeof data === 'string' && data.length <= 2_500_000 && DATA_URL.test(data)) {
      items[o.id] = data;
      index.push({ id: o.id, name: typeof o.name === 'string' ? o.name.slice(0, 60) : 'Wallpaper' });
    }
  }
  const themes = normalizeThemes(r.themes).map((t) => ({
    ...t,
    wallpaper: { ...t.wallpaper, assetId: t.wallpaper.assetId && items[t.wallpaper.assetId] ? t.wallpaper.assetId : null },
  }));
  return {
    backup: {
      settings: normalizeSettings(r.settings),
      themes,
      profiles: normalizeProfiles(r.profiles),
      focus: normalizeFocus(r.focus),
      blocklist: normalizeBlocklist(r.blocklist),
      ytLayout: normalizeYtLayout(r.ytLayout),
      wallpapers: { index, items },
    },
  };
}
