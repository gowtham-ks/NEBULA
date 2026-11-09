// Per-site activation. Host access is optional: the user grants it for one site at a time.
export function originPattern(url: string | undefined): string | null {
  try {
    const u = new URL(url ?? '');
    return u.protocol === 'http:' || u.protocol === 'https:' ? `${u.protocol}//${u.hostname}/*` : null;
  } catch {
    return null;
  }
}

export const hostOf = (pattern: string) => pattern.replace(/^https?:\/\//, '').replace(/\/\*$/, '');

const scriptId = (pattern: string) => `nebula-${pattern.replace(/[^a-z0-9]/gi, '_')}`;

/** Must be called directly from a click handler (the permission prompt needs a user gesture). */
export async function enableSite(pattern: string, tabId?: number): Promise<string | null> {
  try {
    const granted = await chrome.permissions.request({ origins: [pattern] });
    if (!granted) return 'Permission was not granted.';
    try {
      await chrome.scripting.registerContentScripts([
        { id: scriptId(pattern), matches: [pattern], js: ['content.js'], runAt: 'document_start', persistAcrossSessions: true },
      ]);
    } catch { /* already registered */ }
    if (tabId !== undefined) await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : 'Could not enable NEBULA on this site.';
  }
}

export async function disableSite(pattern: string): Promise<void> {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [scriptId(pattern)] });
  } catch { /* not registered */ }
  try {
    await chrome.permissions.remove({ origins: [pattern] });
  } catch { /* ignore */ }
}

/** Enable several sites at once (one permission prompt). Returns the patterns that ended up granted and registered. */
export async function enableSites(patterns: string[]): Promise<string[]> {
  if (!patterns.length) return [];
  try {
    await chrome.permissions.request({ origins: patterns });
  } catch { /* no user gesture or denied: fall through and keep what is already granted */ }
  const granted: string[] = [];
  for (const p of patterns) {
    try {
      if (!(await chrome.permissions.contains({ origins: [p] }))) continue;
      try {
        await chrome.scripting.registerContentScripts([
          { id: scriptId(p), matches: [p], js: ['content.js'], runAt: 'document_start', persistAcrossSessions: true },
        ]);
      } catch { /* already registered */ }
      granted.push(p);
    } catch { /* skip */ }
  }
  return granted;
}
