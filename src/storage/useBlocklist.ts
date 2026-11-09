import { useCallback, useEffect, useState } from 'react';
import { KEYS } from '../shared/keys';
import { normalizeBlocklist, type Blocklist } from '../shared/blocklist';
import { loadBlocklist, saveBlocklist } from './blocklist';

export function useBlocklist() {
  const [list, setList] = useState<Blocklist>(() => normalizeBlocklist(null));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = () => loadBlocklist().then((b) => alive && setList(b));
    void refresh();
    const listener = (c: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && c[KEYS.blocklist]) void refresh();
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      alive = false;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const change = useCallback(async (kind: keyof Blocklist, fn: (items: string[]) => string[]) => {
    const cur = await loadBlocklist();
    const next = normalizeBlocklist({ ...cur, [kind]: fn(cur[kind]) });
    setList(next);
    setError(await saveBlocklist(next));
  }, []);

  return { list, error, change };
}
