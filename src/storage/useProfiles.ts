import { useCallback, useEffect, useState } from 'react';
import { KEYS } from '../shared/keys';
import { EMPTY_PROFILE, type SiteProfile } from '../shared/profile';
import { loadProfiles, saveProfiles } from './profiles';

export function useProfiles() {
  const [profiles, setProfiles] = useState<Record<string, SiteProfile>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = () => loadProfiles().then((p) => alive && setProfiles(p));
    void refresh();
    const listener = (c: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && c[KEYS.profiles]) void refresh();
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      alive = false;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  /** Read-modify-write against fresh storage so edits from the page picker are not overwritten. */
  const patch = useCallback(async (pattern: string, fn: (p: SiteProfile) => SiteProfile) => {
    const cur = await loadProfiles();
    const next = { ...cur, [pattern]: fn(cur[pattern] ?? EMPTY_PROFILE) };
    setProfiles(next);
    setError(await saveProfiles(next));
  }, []);

  const drop = useCallback(async (pattern: string) => {
    const cur = await loadProfiles();
    delete cur[pattern];
    setProfiles(cur);
    setError(await saveProfiles(cur));
  }, []);

  return { profiles, error, patch, drop };
}
