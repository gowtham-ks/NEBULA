import { KEYS, wpKey } from '../shared/keys';
import { normalizeThemes, type Theme } from '../shared/theme';

export interface WallpaperMeta { id: string; name: string }
const MAX_WALLPAPERS = 12;

function friendly(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err);
  return /quota/i.test(m) ? 'Storage is full. Delete a wallpaper or theme and try again.' : m;
}

export async function loadThemes(): Promise<Theme[]> {
  try {
    const r = await chrome.storage.local.get(KEYS.themes);
    return normalizeThemes(r[KEYS.themes]);
  } catch {
    return [];
  }
}

export async function saveThemes(list: Theme[]): Promise<string | null> {
  try {
    await chrome.storage.local.set({ [KEYS.themes]: list });
    return null;
  } catch (e) {
    return friendly(e);
  }
}

export async function setPreview(theme: Theme): Promise<void> {
  try {
    await chrome.storage.local.set({ [KEYS.preview]: { theme, ts: Date.now() } });
  } catch { /* preview is best effort */ }
}

export async function clearPreview(): Promise<void> {
  try {
    await chrome.storage.local.remove(KEYS.preview);
  } catch { /* ignore */ }
}

export async function listWallpapers(): Promise<WallpaperMeta[]> {
  try {
    const r = await chrome.storage.local.get(KEYS.wpIndex);
    const v = r[KEYS.wpIndex];
    return Array.isArray(v)
      ? v.filter((i): i is WallpaperMeta => typeof i?.id === 'string' && typeof i?.name === 'string')
      : [];
  } catch {
    return [];
  }
}

export async function loadWallpaper(id: string): Promise<string | null> {
  try {
    const r = await chrome.storage.local.get(wpKey(id));
    const v = r[wpKey(id)];
    return typeof v === 'string' ? v : null;
  } catch {
    return null;
  }
}

export async function saveWallpaper(name: string, dataUrl: string): Promise<{ id: string } | { error: string }> {
  const list = await listWallpapers();
  if (list.length >= MAX_WALLPAPERS) return { error: `Wallpaper library is full (${MAX_WALLPAPERS}). Delete one first.` };
  const id = `w_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  try {
    await chrome.storage.local.set({
      [wpKey(id)]: dataUrl,
      [KEYS.wpIndex]: [...list, { id, name: name.slice(0, 60) }],
    });
    return { id };
  } catch (e) {
    return { error: friendly(e) };
  }
}

export async function deleteWallpaper(id: string): Promise<void> {
  const list = await listWallpapers();
  try {
    await chrome.storage.local.remove(wpKey(id));
    await chrome.storage.local.set({ [KEYS.wpIndex]: list.filter((i) => i.id !== id) });
  } catch { /* ignore */ }
}
