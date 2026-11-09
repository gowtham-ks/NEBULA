import { useCallback, useEffect, useState } from 'react';
import { KEYS } from '../shared/keys';
import { normalizeYtLayout, type YtLayout } from '../shared/ytlayout';
import { loadYtLayout, saveYtLayout } from './ytlayout';

export function useYtLayout() {
  const [layout, setLayout] = useState<YtLayout>(() => normalizeYtLayout(null));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const refresh = () => loadYtLayout().then((l) => alive && setLayout(l));
    void refresh();
    const listener = (c: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && c[KEYS.ytLayout]) void refresh();
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      alive = false;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const patch = useCallback(async (p: Partial<YtLayout>) => {
    const next = normalizeYtLayout({ ...(await loadYtLayout()), ...p });
    setLayout(next);
    setError(await saveYtLayout(next));
  }, []);

  return { layout, error, patch };
}
