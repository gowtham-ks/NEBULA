import { KEYS } from '../shared/keys';
import { DEFAULT_SETTINGS } from '../shared/schema';
import { disableSite } from './sites';

/** Remove every NEBULA setting, wallpaper and site permission, then restore defaults. */
export async function resetEverything(sites: string[]): Promise<void> {
  for (const s of sites) await disableSite(s);
  await chrome.storage.local.clear();
  await chrome.storage.local.set({ [KEYS.settings]: DEFAULT_SETTINGS });
}
