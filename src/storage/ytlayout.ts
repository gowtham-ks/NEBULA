import { KEYS } from '../shared/keys';
import { normalizeYtLayout, type YtLayout } from '../shared/ytlayout';

export async function loadYtLayout(): Promise<YtLayout> {
  try {
    const r = await chrome.storage.local.get(KEYS.ytLayout);
    return normalizeYtLayout(r[KEYS.ytLayout]);
  } catch {
    return normalizeYtLayout(null);
  }
}

export async function saveYtLayout(l: YtLayout): Promise<string | null> {
  try {
    await chrome.storage.local.set({ [KEYS.ytLayout]: l });
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : 'Could not save';
  }
}
