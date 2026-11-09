import './dislikes';
import { KEYS } from '../shared/keys';
import { DEFAULT_SETTINGS, normalizeSettings, type Settings } from '../shared/schema';

async function getSettings(): Promise<Settings> {
  const r = await chrome.storage.local.get(KEYS.settings);
  return normalizeSettings(r[KEYS.settings]);
}

async function patchSettings(p: Partial<Settings>): Promise<void> {
  await chrome.storage.local.set({ [KEYS.settings]: { ...(await getSettings()), ...p } });
}

function badge(enabled: boolean): void {
  void chrome.action.setBadgeText({ text: enabled ? '' : 'OFF' });
  void chrome.action.setBadgeBackgroundColor({ color: '#d71921' });
}

// No network access, no analytics. First install: seed defaults and open the welcome page.
chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    const existing = await chrome.storage.local.get(KEYS.settings);
    if (!existing[KEYS.settings]) await chrome.storage.local.set({ [KEYS.settings]: DEFAULT_SETTINGS });
    await chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html#welcome') });
  }
  badge((await getSettings()).enabled);
});

// A dashboard preview must never outlive the browser session.
chrome.runtime.onStartup.addListener(async () => {
  await chrome.storage.local.remove([KEYS.preview, KEYS.cssPreview]);
  badge((await getSettings()).enabled);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[KEYS.settings]) badge(normalizeSettings(changes[KEYS.settings].newValue).enabled);
});

chrome.commands.onCommand.addListener(async (command) => {
  const s = await getSettings();
  if (command === 'toggle-nebula') await patchSettings({ enabled: !s.enabled });
  else if (command === 'toggle-focus') await patchSettings({ focusMode: !s.focusMode });
  else if (command === 'pick-element') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id !== undefined) {
      try {
        await chrome.tabs.sendMessage(tab.id, { type: 'nebula:pick' });
      } catch { /* the page has no NEBULA script (site not enabled) */ }
    }
  }
});
