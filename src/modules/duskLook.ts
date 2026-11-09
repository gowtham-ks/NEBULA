import { newId, PRESETS, type Theme } from '../shared/theme';
import { loadSettings, saveSettings } from '../storage/settings';
import { loadThemes, saveThemes, saveWallpaper } from '../storage/themes';
import { loadYtLayout, saveYtLayout } from '../storage/ytlayout';
import { GALLERY } from './wallpapers/gallery';
import { imageUrlToDataUrl } from './wallpapers/process';

/** One click: Dusk Glass theme + Dusk Bay wallpaper + YouTube glass layout. Returns an error message or null. */
export async function applyDuskLook(): Promise<string | null> {
  try {
    const wp = await saveWallpaper('Dusk Bay', await imageUrlToDataUrl(GALLERY[0].url));
    if ('error' in wp) return wp.error;
    const base = PRESETS.find((p) => p.id === 'dusk-glass')!;
    const id = newId();
    const theme: Theme = { ...structuredClone(base), id, name: 'Dusk Glass', builtin: false, wallpaper: { ...base.wallpaper, assetId: wp.id, dim: 20 } };
    const err = await saveThemes([...(await loadThemes()), theme]);
    if (err) return err;
    const s = await saveSettings({ ...(await loadSettings()), activeThemeId: id });
    if (s) return s;
    return await saveYtLayout({ ...(await loadYtLayout()), enabled: true });
  } catch (e) {
    return e instanceof Error ? e.message : 'Could not apply the look.';
  }
}
