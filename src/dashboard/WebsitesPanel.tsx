import { useState } from 'react';
import { Copy, RotateCcw, Trash2, X } from 'lucide-react';
import { Switch } from '../components/Switch';
import { disableSite, enableSite, hostOf } from '../modules/sites';
import { EMPTY_PROFILE, type SiteProfile } from '../shared/profile';
import type { Settings } from '../shared/schema';
import { PRESETS, resolveTheme, type Theme } from '../shared/theme';

const HOST_RE = /^(localhost|([a-z0-9-]+\.)+[a-z]{2,})$/;

interface Props {
  settings: Settings;
  update: (p: Partial<Settings>) => Promise<void>;
  profiles: Record<string, SiteProfile>;
  patch: (pattern: string, fn: (p: SiteProfile) => SiteProfile) => Promise<void>;
  drop: (pattern: string) => Promise<void>;
  customThemes: Theme[];
  selected: string | null;
  onSelect: (p: string | null) => void;
  onEditCss: (p: string) => void;
}

export function WebsitesPanel(p: Props) {
  const [host, setHost] = useState('');
  const [copyFrom, setCopyFrom] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const allThemes = [...p.customThemes, ...PRESETS];
  const globalName = resolveTheme(p.settings.activeThemeId, p.customThemes).name;
  const prof = (s: string) => p.profiles[s] ?? EMPTY_PROFILE;

  async function addSite() {
    const h = host.trim().toLowerCase();
    if (!HOST_RE.test(h)) return setMsg('Enter a hostname such as example.com');
    const pattern = `https://${h}/*`;
    if (p.settings.sites.includes(pattern)) return setMsg('That site is already added.');
    setBusy(true);
    setMsg(null);
    const err = await enableSite(pattern); // first await: keeps the click's user gesture for the permission prompt
    if (err) {
      setMsg(err);
    } else {
      await p.update({ sites: [...p.settings.sites, pattern] });
      const src = copyFrom ? p.profiles[copyFrom] : undefined;
      await p.patch(pattern, () => (src ? structuredClone(src) : EMPTY_PROFILE));
      setHost('');
      setCopyFrom(null);
      p.onSelect(pattern);
      setMsg('Added. Reload open tabs of that site to apply.');
    }
    setBusy(false);
  }

  async function removeSite(s: string) {
    if (!confirm(`Remove ${hostOf(s)}? Its NEBULA settings and site permission will be deleted.`)) return;
    await p.update({ sites: p.settings.sites.filter((x) => x !== s) });
    await disableSite(s);
    await p.drop(s);
    if (p.selected === s) p.onSelect(null);
  }

  const sel = p.selected && p.settings.sites.includes(p.selected) ? p.selected : null;

  return (
    <div className="max-w-2xl space-y-4">
      <div className="glass space-y-2 p-3">
        <p className="label-dot">{copyFrom ? `Duplicate ${hostOf(copyFrom)} to` : 'Add a website'}</p>
        <div className="flex gap-2">
          <input
            value={host} onChange={(e) => setHost(e.target.value)} placeholder="example.com"
            className="min-w-0 flex-1 rounded-card border border-white/15 bg-graphite px-2 py-1.5 text-sm"
          />
          <button disabled={busy} onClick={() => void addSite()} className="rounded-card bg-nothing px-3 text-sm text-white disabled:opacity-50">
            {copyFrom ? 'Duplicate' : 'Add'}
          </button>
          {copyFrom && <button onClick={() => setCopyFrom(null)} aria-label="Cancel duplicate" className="text-neutral-400 hover:text-white"><X size={16} /></button>}
        </div>
        <p className="text-xs text-neutral-500">Chrome will ask for permission to that one site. Only https hostnames can be added here.</p>
        {msg && <p className="text-xs text-neutral-300">{msg}</p>}
      </div>

      {p.settings.sites.length === 0 && (
        <p className="text-sm text-neutral-500">No websites yet. Use “Enable on this site” in the popup, or add one above.</p>
      )}

      <ul className="space-y-2">
        {p.settings.sites.map((s) => {
          const pr = prof(s);
          const themeLabel = pr.themeId ? allThemes.find((t) => t.id === pr.themeId)?.name ?? 'Missing theme' : `Global: ${globalName}`;
          const hidden = pr.rules.filter((r) => r.enabled).length;
          return (
            <li key={s} className={`glass flex items-center gap-3 p-3 ${sel === s ? 'border-nothing/60' : ''}`}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-card border border-white/15 font-display uppercase">
                {hostOf(s).replace(/^www\./, '')[0]}
              </span>
              <button className="min-w-0 flex-1 text-left" onClick={() => p.onSelect(s)}>
                <p className="truncate text-sm">{hostOf(s)}</p>
                <p className="truncate text-xs text-neutral-500">
                  {themeLabel}
                  {pr.css && pr.cssEnabled ? ' · CSS' : ''}
                  {hidden ? ` · ${hidden} hidden` : ''}
                </p>
              </button>
              <Switch label={`Enable on ${hostOf(s)}`} checked={pr.enabled} onChange={(v) => void p.patch(s, (x) => ({ ...x, enabled: v }))} />
              <button aria-label="Duplicate settings" title="Duplicate to another site" onClick={() => { setCopyFrom(s); setMsg(null); }} className="text-neutral-500 hover:text-white"><Copy size={14} /></button>
              <button aria-label="Reset site" title="Reset this site" onClick={() => confirm(`Reset all NEBULA settings for ${hostOf(s)}?`) && void p.patch(s, () => EMPTY_PROFILE)} className="text-neutral-500 hover:text-white"><RotateCcw size={14} /></button>
              <button aria-label="Remove site" title="Remove site" onClick={() => void removeSite(s)} className="text-neutral-500 hover:text-nothing"><Trash2 size={14} /></button>
            </li>
          );
        })}
      </ul>

      {sel && (
        <section className="glass space-y-3 p-4">
          <p className="label-dot">{hostOf(sel)}</p>
          <label className="flex items-center justify-between gap-3 text-sm">
            Theme for this site
            <select
              value={prof(sel).themeId ?? ''}
              onChange={(e) => void p.patch(sel, (x) => ({ ...x, themeId: e.target.value || null }))}
              className="rounded-card border border-white/15 bg-graphite px-2 py-1"
            >
              <option value="">Global theme ({globalName})</option>
              {allThemes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
          <button onClick={() => p.onEditCss(sel)} className="text-xs text-neutral-400 hover:text-white">Edit custom CSS for this site →</button>

          <div>
            <p className="label-dot mb-2">Hidden elements</p>
            {prof(sel).rules.length === 0 ? (
              <p className="text-xs text-neutral-500">None. Open the site, click NEBULA, then “Pick element to hide”.</p>
            ) : (
              <ul className="space-y-2">
                {prof(sel).rules.map((r) => (
                  <li key={r.id} className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{r.label}</p>
                      <p className="truncate font-mono text-[11px] text-neutral-500">{r.selector}</p>
                    </div>
                    <Switch label={`Hide ${r.label}`} checked={r.enabled} onChange={(v) => void p.patch(sel, (x) => ({ ...x, rules: x.rules.map((y) => (y.id === r.id ? { ...y, enabled: v } : y)) }))} />
                    <button aria-label="Delete rule" onClick={() => void p.patch(sel, (x) => ({ ...x, rules: x.rules.filter((y) => y.id !== r.id) }))} className="text-neutral-500 hover:text-nothing"><Trash2 size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
