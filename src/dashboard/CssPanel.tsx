import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { Download, Upload } from 'lucide-react';
import { CssEditor } from '../components/CssEditor';
import { Switch } from '../components/Switch';
import { downloadText } from '../modules/download';
import { hostOf } from '../modules/sites';
import { MAX_CSS, validateCss } from '../shared/csssafe';
import { EMPTY_PROFILE, type SiteProfile } from '../shared/profile';
import { clearCssPreview, setCssPreview } from '../storage/profiles';

interface Props {
  sites: string[];
  profiles: Record<string, SiteProfile>;
  selected: string | null;
  onSelect: (p: string) => void;
  patch: (pattern: string, fn: (p: SiteProfile) => SiteProfile) => Promise<void>;
}

function checkCss(css: string): string[] {
  const errors = validateCss(css);
  if (!errors.length && css.trim()) {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      if (sheet.cssRules.length === 0) errors.push('No valid CSS rules found.');
    } catch {
      errors.push('The browser could not parse this CSS.');
    }
  }
  return errors;
}

export function CssPanel({ sites, profiles, selected, onSelect, patch }: Props) {
  const site = selected && sites.includes(selected) ? selected : sites[0] ?? null;
  const profile = (site && profiles[site]) || EMPTY_PROFILE;
  const [text, setText] = useState(profile.css);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { setText(profile.css); }, [site, profile.css]);

  const errors = useMemo(() => checkCss(text), [text]);
  const dirty = text !== profile.css;

  // Live preview on the open tab for this site; stops when invalid, unchanged or when leaving.
  useEffect(() => {
    if (!site || !dirty || errors.length) { void clearCssPreview(); return; }
    const send = () => void setCssPreview(site, text);
    const h = setTimeout(send, 150);
    const keepAlive = setInterval(send, 30_000);
    return () => { clearTimeout(h); clearInterval(keepAlive); };
  }, [site, text, dirty, errors]);
  useEffect(() => () => { void clearCssPreview(); }, [site]);

  if (!site) {
    return <p className="glass max-w-md p-4 text-sm text-neutral-400">Enable NEBULA on a site from the popup first, then edit its CSS here.</p>;
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > MAX_CSS) return setMsg(`File is larger than ${MAX_CSS / 1000} KB.`);
    setText(await f.text());
    setMsg('Imported into the editor. Review it, then press Apply.');
  }

  return (
    <div className="max-w-2xl space-y-3">
      <div className="glass flex flex-wrap items-center gap-3 p-3 text-sm">
        <select value={site} onChange={(e) => onSelect(e.target.value)} className="rounded-card border border-white/15 bg-graphite px-2 py-1">
          {sites.map((s) => <option key={s} value={s}>{hostOf(s)}</option>)}
        </select>
        <span className="flex items-center gap-2 text-xs text-neutral-400">
          CSS enabled
          <Switch label="Enable custom CSS" checked={profile.cssEnabled} onChange={(v) => void patch(site, (p) => ({ ...p, cssEnabled: v }))} />
        </span>
        <span className="flex-1" />
        <label className="flex cursor-pointer items-center gap-1 text-xs text-neutral-400 hover:text-white">
          <Upload size={13} /> Import
          <input type="file" accept=".css,text/css" className="hidden" onChange={onFile} />
        </label>
        <button onClick={() => downloadText(`${hostOf(site)}.css`, text, 'text/css')} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white">
          <Download size={13} /> Export
        </button>
      </div>

      <CssEditor value={text} onChange={(v) => { setText(v); setMsg(null); }} />

      {errors.map((e) => <p key={e} className="text-xs text-nothing">{e}</p>)}
      {msg && <p className="text-xs text-neutral-400">{msg}</p>}
      <p className="text-xs text-neutral-500">
        {dirty ? 'Unsaved. Previewing live on the open tab for this site.' : 'Saved.'} CSS only: remote URLs,
        @import and script-like constructs are blocked.
      </p>

      <div className="flex gap-2">
        <button
          disabled={!dirty || errors.length > 0}
          onClick={() => void patch(site, (p) => ({ ...p, css: text }))}
          className="rounded-card bg-nothing px-3 py-1.5 text-sm text-white disabled:opacity-30"
        >
          Apply
        </button>
        <button disabled={!dirty} onClick={() => setText(profile.css)} className="rounded-card border border-white/15 px-3 py-1.5 text-sm disabled:opacity-30">
          Cancel
        </button>
        <button onClick={() => setText('')} className="rounded-card border border-white/15 px-3 py-1.5 text-sm">
          Reset
        </button>
      </div>
    </div>
  );
}
