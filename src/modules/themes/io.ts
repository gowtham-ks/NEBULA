import { newId, normalizeTheme, type Theme } from '../../shared/theme';
import { loadWallpaper, saveWallpaper } from '../../storage/themes';

const DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const FORMAT = 'nebula-theme';
const FORMAT_VERSION = 1;
const obj = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {});

/** Themes are plain data. Imported files are never executed, only validated and clamped. */
export async function buildExport(themes: Theme[], includeWallpapers: boolean): Promise<string> {
  const assets: Record<string, string> = {};
  const out: Theme[] = [];
  for (const t of themes) {
    const id = t.wallpaper.assetId;
    if (id && includeWallpapers) {
      const url = await loadWallpaper(id);
      if (url) assets[id] = url;
      out.push({ ...t, builtin: false });
    } else {
      out.push({ ...t, builtin: false, wallpaper: { ...t.wallpaper, assetId: null } });
    }
  }
  return JSON.stringify({ format: FORMAT, formatVersion: FORMAT_VERSION, exportedAt: new Date().toISOString(), themes: out, assets }, null, 2);
}

export async function importThemeFile(text: string): Promise<{ themes: Theme[]; skipped: number } | { error: string }> {
  if (text.length > 30_000_000) return { error: 'File is too large.' };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { error: 'This file is not valid JSON.' };
  }
  const r = obj(raw);
  if (r.format !== FORMAT) return { error: 'This is not a NEBULA theme file.' };
  if (r.formatVersion !== FORMAT_VERSION) return { error: 'Unsupported theme file version.' };
  const list = Array.isArray(r.themes) ? r.themes.slice(0, 50) : [];
  if (!list.length) return { error: 'The file contains no themes.' };

  const assets = obj(r.assets);
  const remap = new Map<string, string | null>();
  const used = new Set<string>();
  const themes: Theme[] = [];
  let skipped = 0;

  for (const item of list) {
    const t = normalizeTheme(item);
    const old = t.wallpaper.assetId;
    let asset: string | null = null;
    if (old) {
      if (remap.has(old)) asset = remap.get(old) ?? null;
      else {
        const data = assets[old];
        if (typeof data === 'string' && data.length <= 2_500_000 && DATA_URL.test(data)) {
          const res = await saveWallpaper(`Imported: ${t.name}`, data);
          if ('id' in res) asset = res.id;
          else skipped++;
        } else skipped++;
        remap.set(old, asset);
      }
    }
    let id = newId();
    while (used.has(id)) id = newId();
    used.add(id);
    themes.push({ ...t, id, builtin: false, wallpaper: { ...t.wallpaper, assetId: asset } });
  }
  return { themes, skipped };
}
