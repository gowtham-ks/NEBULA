import { KEYS } from '../shared/keys';
import { normalizeProfiles, type SiteProfile } from '../shared/profile';

export async function loadProfiles(): Promise<Record<string, SiteProfile>> {
  try {
    const r = await chrome.storage.local.get(KEYS.profiles);
    return normalizeProfiles(r[KEYS.profiles]);
  } catch {
    return {};
  }
}

export async function saveProfiles(p: Record<string, SiteProfile>): Promise<string | null> {
  try {
    await chrome.storage.local.set({ [KEYS.profiles]: p });
    return null;
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    return /quota/i.test(m) ? 'Storage is full.' : m;
  }
}

export async function setCssPreview(pattern: string, css: string): Promise<void> {
  try {
    await chrome.storage.local.set({ [KEYS.cssPreview]: { pattern, css, ts: Date.now() } });
  } catch { /* best effort */ }
}

export async function clearCssPreview(): Promise<void> {
  try {
    await chrome.storage.local.remove(KEYS.cssPreview);
  } catch { /* ignore */ }
}
