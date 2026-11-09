import { useCallback, useEffect, useState } from 'react';
import type { Settings } from '../shared/schema';
import { DEFAULT_THEME, newId, normalizeTheme, PRESETS, resolveTheme, type Theme } from '../shared/theme';
import { clearPreview, saveThemes, setPreview } from '../storage/themes';

export function useThemeEditor(
  settings: Settings,
  custom: Theme[],
  update: (p: Partial<Settings>) => Promise<void>,
) {
  const saved = resolveTheme(settings.activeThemeId, custom);
  const [draft, setDraft] = useState<Theme | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = draft ?? saved;

  const edit = useCallback(
    (fn: (t: Theme) => void) => {
      const t = structuredClone(theme);
      fn(t);
      setDraft(normalizeTheme(t, theme));
    },
    [theme],
  );

  // Live preview: pushed to storage so enabled tabs re-render immediately.
  useEffect(() => {
    if (!draft) {
      void clearPreview();
      return;
    }
    const send = () => void setPreview(draft);
    const h = setTimeout(send, 120);
    const keepAlive = setInterval(send, 30_000);
    return () => {
      clearTimeout(h);
      clearInterval(keepAlive);
    };
  }, [draft]);

  useEffect(() => {
    const clear = () => void clearPreview();
    window.addEventListener('beforeunload', clear);
    return () => {
      window.removeEventListener('beforeunload', clear);
      clear();
    };
  }, []);

  const apply = async () => {
    if (!draft) return;
    let id = draft.id;
    let list: Theme[];
    if (draft.builtin) {
      id = newId();
      list = [...custom, { ...draft, id, name: `${draft.name} (custom)`, builtin: false }];
    } else {
      list = custom.some((t) => t.id === id) ? custom.map((t) => (t.id === id ? draft : t)) : [...custom, draft];
    }
    const err = await saveThemes(list);
    if (err) return setError(err);
    await update({ activeThemeId: id });
    setDraft(null);
    setError(null);
  };

  const cancel = () => { setDraft(null); setError(null); };

  const reset = () => {
    const src = PRESETS.find((p) => p.id === theme.id) ?? DEFAULT_THEME;
    setDraft(normalizeTheme({ ...src, id: theme.id, name: theme.name, builtin: theme.builtin }, DEFAULT_THEME));
  };

  const activate = async (id: string) => { setDraft(null); await update({ activeThemeId: id }); };

  const duplicate = async (t: Theme) => {
    const copy = { ...structuredClone(t), id: newId(), name: `${t.name} copy`, builtin: false };
    setError(await saveThemes([...custom, copy]));
  };

  const create = async () => {
    const copy = { ...structuredClone(saved), id: newId(), name: 'New theme', builtin: false };
    const err = await saveThemes([...custom, copy]);
    if (err) return setError(err);
    await activate(copy.id);
  };

  const rename = async (id: string, name: string) => {
    const n = name.trim().slice(0, 60);
    if (!n) return;
    setError(await saveThemes(custom.map((t) => (t.id === id ? { ...t, name: n } : t))));
  };

  const importThemes = async (list: Theme[]) => { setError(await saveThemes([...custom, ...list])); };

  const remove = async (id: string) => {
    const err = await saveThemes(custom.filter((t) => t.id !== id));
    if (err) return setError(err);
    if (settings.activeThemeId === id) await activate(DEFAULT_THEME.id);
  };

  return { saved, theme, dirty: draft !== null, error, edit, apply, cancel, reset, activate, duplicate, create, rename, remove, importThemes };
}
