import { useCallback, useEffect, useState } from 'react';
import { KEYS } from '../shared/keys';
import { normalizeFocus, type AdapterId, type FocusConfig } from '../shared/focus';
import { loadFocus, saveFocus } from './focus';

export function useFocus() {
  const [focus, setFocus] = useState<FocusConfig>(() => normalizeFocus(null));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = () => loadFocus().then((f) => alive && setFocus(f));
    void refresh();
    const listener = (c: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && c[KEYS.focus]) void refresh();
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      alive = false;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const setFeature = useCallback(async (id: AdapterId, feature: string, value: boolean) => {
    const cur = await loadFocus();
    const next = { ...cur, [id]: { ...cur[id], [feature]: value } };
    setFocus(next);
    setError(await saveFocus(next));
  }, []);

  return { focus, error, setFeature };
}
