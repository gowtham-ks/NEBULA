import { useEffect, useState } from 'react';
import { History, LayoutDashboard, MousePointerClick, SlidersHorizontal } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Switch } from '../components/Switch';
import { disableSite, enableSite, originPattern } from '../modules/sites';
import { PRESETS } from '../shared/theme';
import { useProfiles } from '../storage/useProfiles';
import { useSettings } from '../storage/useSettings';
import { useCustomThemes } from '../storage/useThemes';

interface ActiveTab { id?: number; host: string | null; pattern: string | null }

function useActiveTab(): ActiveTab | null {
  const [tab, setTab] = useState<ActiveTab | null>(null);
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([t]) => {
      const pattern = originPattern(t?.url);
      setTab({ id: t?.id, pattern, host: pattern ? new URL(t!.url!).hostname : null });
    });
  }, []);
  return tab;
}

export function Popup() {
  const { settings, ready, error, update } = useSettings();
  const custom = useCustomThemes();
  const { profiles, patch } = useProfiles();
  const tab = useActiveTab();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  if (!ready || !tab) return <div className="h-48 w-[340px]" />;

  const pattern = tab.pattern;
  const enabledHere = !!pattern && settings.sites.includes(pattern);
  const themes = [...custom, ...PRESETS];
  const override = pattern ? profiles[pattern]?.themeId ?? '' : '';
  const sel = 'mt-1 w-full rounded-card border border-white/15 bg-graphite px-2 py-1.5 text-sm';

  async function enableHere() {
    if (!pattern || tab?.id === undefined) return;
    setBusy(true);
    setMsg(null);
    const err = await enableSite(pattern, tab.id);
    if (err) setMsg(err);
    else await update({ sites: [...settings.sites, pattern] });
    setBusy(false);
  }

  async function disableHere() {
    if (!pattern) return;
    await update({ sites: settings.sites.filter((s) => s !== pattern) });
    await disableSite(pattern);
  }

  async function pick() {
    if (tab?.id === undefined) return;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: 'nebula:pick' });
      window.close();
    } catch {
      setMsg('Reload this page, then try again.');
    }
  }

  function customize() {
    if (!pattern) return;
    void chrome.tabs.create({ url: chrome.runtime.getURL(`dashboard.html#site=${encodeURIComponent(pattern)}`) });
    window.close();
  }

  return (
    <main className="w-[340px] space-y-3 p-4">
      <header className="flex items-center justify-between">
        <Logo />
        <Switch label="Enable NEBULA" checked={settings.enabled} onChange={(enabled) => void update({ enabled })} />
      </header>

      <section className="glass space-y-2 p-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 shrink-0 rounded-full ${enabledHere && settings.enabled ? 'bg-emerald-400' : 'bg-neutral-600'}`} />
          <p className="min-w-0 flex-1 truncate font-display text-base">{tab.host ?? 'Not a web page'}</p>
          <span className="text-[11px] text-neutral-500">{enabledHere ? 'Active' : pattern ? 'Not enabled' : ''}</span>
        </div>
        {pattern && !enabledHere && (
          <button onClick={() => void enableHere()} disabled={busy} className="btn btn-primary w-full">Enable on this site</button>
        )}
        {enabledHere && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => void pick()} className="btn !text-xs"><MousePointerClick size={13} /> Pick element</button>
            <button onClick={customize} className="btn !text-xs"><SlidersHorizontal size={13} /> Customize</button>
          </div>
        )}
        {enabledHere && (
          <label className="block text-xs text-neutral-500">
            Theme for this site
            <select className={sel} value={override} onChange={(e) => void patch(pattern!, (p) => ({ ...p, themeId: e.target.value || null }))}>
              <option value="">Same as global</option>
              {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </label>
        )}
        {enabledHere && (
          <button onClick={() => void disableHere()} className="text-xs text-neutral-500 hover:text-white">Turn off for this site</button>
        )}
        {tab.host?.endsWith('youtube.com') && (
          <button onClick={() => void chrome.tabs.create({ url: 'https://www.youtube.com/feed/history' })} className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white">
            <History size={12} /> YouTube History
          </button>
        )}
        {msg && <p className="text-xs text-nothing">{msg}</p>}
      </section>

      <section className="glass p-3">
        <label className="block text-xs text-neutral-500">
          Global theme
          <select className={sel} value={settings.activeThemeId} onChange={(e) => void update({ activeThemeId: e.target.value })}>
            {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        {settings.schedule.enabled && <p className="mt-1 text-[11px] text-neutral-500">Automatic schedule is on (Dashboard › Automation).</p>}
      </section>

      <section className="glass flex items-center justify-between p-3">
        <div>
          <p className="text-sm">Focus Mode</p>
          <p className="text-xs text-neutral-500">Hide distractions on supported sites</p>
        </div>
        <Switch label="Focus Mode" checked={settings.focusMode} onChange={(focusMode) => void update({ focusMode })} />
      </section>

      {error && <p className="text-xs text-nothing">Save failed: {error}</p>}

      <button onClick={() => chrome.runtime.openOptionsPage()} className="btn w-full"><LayoutDashboard size={14} /> Open Dashboard</button>
      <p className="text-center text-[11px] text-neutral-600">Alt+Shift+N on/off · F focus · P pick element</p>
    </main>
  );
}
