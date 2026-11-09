import { useEffect, useState } from 'react';
import { KEYS } from '../shared/keys';
import type { Theme } from '../shared/theme';
import { loadThemes } from './themes';

export function useCustomThemes(): Theme[] {
  const [themes, setThemes] = useState<Theme[]>([]);
  useEffect(() => {
    let alive = true;
    const refresh = () => loadThemes().then((t) => alive && setThemes(t));
    void refresh();
    const listener = (c: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area === 'local' && c[KEYS.themes]) void refresh();
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      alive = false;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);
  return themes;
}
