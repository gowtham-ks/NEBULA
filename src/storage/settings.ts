import { DEFAULT_SETTINGS, normalizeSettings, type Settings } from '../shared/schema';

const KEY = 'nebula:settings';

export async function loadSettings(): Promise<Settings> {
  try {
    const res = await chrome.storage.local.get(KEY);
    return normalizeSettings(res[KEY]);
  } catch (err) {
    console.error('NEBULA: failed to load settings', err);
    return { ...DEFAULT_SETTINGS };
  }
}

/** Returns an error message on failure (e.g. quota), or null on success. */
export async function saveSettings(s: Settings): Promise<string | null> {
  try {
    await chrome.storage.local.set({ [KEY]: s });
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : 'Could not save settings';
  }
}

export function onSettingsChanged(cb: (s: Settings) => void): () => void {
  const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area === 'local' && changes[KEY]) cb(normalizeSettings(changes[KEY].newValue));
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
