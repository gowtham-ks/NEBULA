import { useState, type ChangeEvent } from 'react';
import { Check, Copy, Download, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { downloadText } from '../modules/download';
import { buildExport, importThemeFile } from '../modules/themes/io';
import { PRESETS, type Theme } from '../shared/theme';

interface Props {
  custom: Theme[];
  activeId: string;
  onActivate: (id: string) => void;
  onDuplicate: (t: Theme) => void;
  onCreate: () => void;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
  onImport: (themes: Theme[]) => Promise<void>;
}

export function ThemesPanel(p: Props) {
  const [renaming, setRenaming] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [withWp, setWithWp] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  async function exportThemes(list: Theme[], file: string) {
    downloadText(file, await buildExport(list, withWp), 'application/json');
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const res = await importThemeFile(await f.text());
    if ('error' in res) return setMsg(res.error);
    await p.onImport(res.themes);
    setMsg(`Imported ${res.themes.length} theme${res.themes.length === 1 ? '' : 's'}.${res.skipped ? ` ${res.skipped} wallpaper(s) could not be imported.` : ''}`);
  }

  const row = (t: Theme) => (
    <li key={t.id} className="glass flex items-center gap-3 p-3">
      <span className="h-4 w-4 shrink-0 rounded-full border border-white/20" style={{ background: t.appearance.bgColor ?? '#111', boxShadow: `inset 0 0 0 4px ${t.appearance.accent ?? 'transparent'}` }} />
      {renaming === t.id ? (
        <input
          autoFocus value={name} onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { p.onRename(t.id, name); setRenaming(null); }
            if (e.key === 'Escape') setRenaming(null);
          }}
          className="min-w-0 flex-1 rounded border border-white/20 bg-graphite px-2 py-1 text-sm"
        />
      ) : (
        <span className="min-w-0 flex-1 truncate text-sm">{t.name}</span>
      )}
      {p.activeId === t.id ? (
        <span className="flex items-center gap-1 text-xs text-nothing"><Check size={12} /> Active</span>
      ) : (
        <button onClick={() => p.onActivate(t.id)} className="text-xs text-neutral-400 hover:text-white">Apply</button>
      )}
      <button aria-label="Export" onClick={() => void exportThemes([t], `nebula-${t.name}.json`)} className="text-neutral-500 hover:text-white"><Download size={14} /></button>
      <button aria-label="Duplicate" onClick={() => p.onDuplicate(t)} className="text-neutral-500 hover:text-white"><Copy size={14} /></button>
      {!t.builtin && (
        <>
          <button aria-label="Rename" onClick={() => { setRenaming(t.id); setName(t.name); }} className="text-neutral-500 hover:text-white"><Pencil size={14} /></button>
          <button aria-label="Delete" onClick={() => p.onRemove(t.id)} className="text-neutral-500 hover:text-nothing"><Trash2 size={14} /></button>
        </>
      )}
    </li>
  );

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={p.onCreate} className="flex items-center gap-2 rounded-card border border-white/15 px-3 py-2 text-sm hover:bg-white/10">
          <Plus size={14} /> New theme from active
        </button>
        <label className="flex cursor-pointer items-center gap-2 rounded-card border border-white/15 px-3 py-2 text-sm hover:bg-white/10">
          <Upload size={14} /> Import
          <input type="file" accept=".json,application/json" className="hidden" onChange={onFile} />
        </label>
        <button
          disabled={p.custom.length === 0}
          onClick={() => void exportThemes(p.custom, 'nebula-themes.json')}
          className="flex items-center gap-2 rounded-card border border-white/15 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-30"
        >
          <Download size={14} /> Export mine
        </button>
      </div>
      <label className="flex items-center gap-2 text-xs text-neutral-400">
        <input type="checkbox" checked={withWp} onChange={(e) => setWithWp(e.target.checked)} className="accent-nothing" />
        Include wallpapers in exports (larger files)
      </label>
      {msg && <p className="text-xs text-neutral-300">{msg}</p>}
      {p.custom.length > 0 && (
        <div>
          <p className="label-dot mb-2">Your themes</p>
          <ul className="space-y-2">{p.custom.map(row)}</ul>
        </div>
      )}
      <div>
        <p className="label-dot mb-2">Presets</p>
        <ul className="space-y-2">{PRESETS.map(row)}</ul>
      </div>
      <p className="text-xs text-neutral-500">Theme files are plain data. Imports are validated and never executed.</p>
    </div>
  );
}
