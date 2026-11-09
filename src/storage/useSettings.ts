import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, type Settings } from '../shared/schema';
import { loadSettings, onSettingsChanged, saveSettings } from './settings';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    loadSettings().then((s) => {
      if (alive) {
        setSettings(s);
        setReady(true);
      }
    });
    const off = onSettingsChanged((s) => alive && setSettings(s));
    return () => {
      alive = false;
      off();
    };
  }, []);

  const update = useCallback(
    async (patch: Partial<Settings>) => {
      const next = { ...settings, ...patch };
      setSettings(next);
      setError(await saveSettings(next));
    },
    [settings],
  );

  return { settings, ready, error, update };
}
