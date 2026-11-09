import { KEYS } from '../shared/keys';
import { normalizeBlocklist, type Blocklist } from '../shared/blocklist';

export async function loadBlocklist(): Promise<Blocklist> {
  try {
    const r = await chrome.storage.local.get(KEYS.blocklist);
    return normalizeBlocklist(r[KEYS.blocklist]);
  } catch {
    return { channels: [], words: [] };
  }
}

export async function saveBlocklist(b: Blocklist): Promise<string | null> {
  try {
    await chrome.storage.local.set({ [KEYS.blocklist]: b });
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : 'Could not save';
  }
}
