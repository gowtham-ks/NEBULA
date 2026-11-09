import { KEYS } from '../shared/keys';
import { normalizeFocus, type FocusConfig } from '../shared/focus';

export async function loadFocus(): Promise<FocusConfig> {
  try {
    const r = await chrome.storage.local.get(KEYS.focus);
    return normalizeFocus(r[KEYS.focus]);
  } catch {
    return normalizeFocus(null);
  }
}

export async function saveFocus(f: FocusConfig): Promise<string | null> {
  try {
    await chrome.storage.local.set({ [KEYS.focus]: f });
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : 'Could not save';
  }
}
