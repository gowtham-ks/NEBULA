import { useEffect, useState } from 'react';
import { Check, Circle, Keyboard } from 'lucide-react';
import { Switch } from '../components/Switch';
import { DEFAULT_SETTINGS, type Settings } from '../shared/schema';
import { resolveTheme, type Theme } from '../shared/theme';
import { listWallpapers } from '../storage/themes';

interface Props {
  settings: Settings;
  update: (p: Partial<Settings>) => Promise<void>;
  custom: Theme[];
  ruleCount: number;
  onNavigate: (id: string) => void;
}

interface Cmd { name: string; shortcut: string; description: string }

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="glass p-3">
      <p className="label-dot">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}

export function Overview({ settings, update, custom, ruleCount, onNavigate }: Props) {
  const [wallpapers, setWallpapers] = useState(0);
  const [cmds, setCmds] = useState<Cmd[]>([]);

  useEffect(() => {
    void listWallpapers().then((l) => setWallpapers(l.length));
    chrome.commands
      .getAll()
      .then((all) => setCmds(all.filter((c) => c.name && !c.name.startsWith('_')).map((c) => ({ name: c.name!, shortcut: c.shortcut ?? '', description: c.description ?? '' }))))
      .catch(() => setCmds([]));
  }, []);

  const theme = resolveTheme(settings.activeThemeId, custom);
  const steps: { done: boolean; label: string; action?: [string, string] }[] = [
    { done: settings.sites.length > 0, label: 'Enable NEBULA on a website: open it, click the NEBULA icon, press “Enable on this site”.' },
    { done: settings.activeThemeId !== DEFAULT_SETTINGS.activeThemeId || custom.length > 0, label: 'Choose or create a theme.', action: ['themes', 'Open Themes'] },
    { done: settings.focusMode, label: 'Try Focus Mode on YouTube, X, Instagram, Facebook or Reddit.', action: ['focus', 'Open Focus Mode'] },
  ];

  return (
    <div className="max-w-3xl space-y-4">
      {!settings.onboarded && (
        <section className="glass border-nothing/40 p-4">
          <p className="font-display text-lg">Welcome to NEBULA</p>
          <p className="mt-1 text-sm text-neutral-400">
            Everything you set up stays on this device. NEBULA only touches websites you enable one by one.
          </p>
          <ul className="mt-3 space-y-2">
            {steps.map((s) => (
              <li key={s.label} className="flex items-start gap-2 text-sm">
                {s.done ? <Check size={16} className="mt-0.5 shrink-0 text-emerald-400" /> : <Circle size={16} className="mt-0.5 shrink-0 text-neutral-600" />}
                <span className="flex-1">{s.label}</span>
                {s.action && <button className="text-xs text-neutral-400 hover:text-white" onClick={() => onNavigate(s.action![0])}>{s.action[1]} →</button>}
              </li>
            ))}
          </ul>
          <button className="btn mt-3" onClick={() => void update({ onboarded: true })}>Got it</button>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass flex items-center justify-between p-4">
          <div>
            <p className="label-dot">NEBULA</p>
            <p className="mt-1 font-display text-xl">{settings.enabled ? 'Active' : 'Paused'}</p>
          </div>
          <Switch label="Enable NEBULA" checked={settings.enabled} onChange={(enabled) => void update({ enabled })} />
        </div>
        <div className="glass flex items-center justify-between p-4">
          <div>
            <p className="label-dot">Focus Mode</p>
            <p className="mt-1 font-display text-xl">{settings.focusMode ? 'On' : 'Off'}</p>
          </div>
          <Switch label="Focus Mode" checked={settings.focusMode} onChange={(focusMode) => void update({ focusMode })} />
        </div>
        <button className="glass p-4 text-left hover:bg-white/10" onClick={() => onNavigate('themes')}>
          <p className="label-dot">{settings.schedule.enabled ? 'Theme (scheduled)' : 'Active theme'}</p>
          <p className="mt-1 truncate font-display text-xl">{theme.name}</p>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Websites" value={settings.sites.length} />
        <Stat label="Custom themes" value={custom.length} />
        <Stat label="Hidden elements" value={ruleCount} />
        <Stat label="Wallpapers" value={wallpapers} />
      </div>

      <div className="grid gap-2 sm:grid-cols-4">
        {[['appearance', 'Customize'], ['websites', 'Websites'], ['automation', 'Automation'], ['settings', 'Backup']].map(([id, label]) => (
          <button key={id} className="btn" onClick={() => onNavigate(id)}>{label}</button>
        ))}
      </div>

      {cmds.length > 0 && (
        <section className="glass p-4">
          <p className="label-dot mb-2 flex items-center gap-2"><Keyboard size={13} /> Keyboard shortcuts</p>
          <ul className="space-y-1 text-sm">
            {cmds.map((c) => (
              <li key={c.name} className="flex justify-between gap-3">
                <span className="text-neutral-300">{c.description}</span>
                <kbd className="rounded border border-white/15 px-1.5 text-xs">{c.shortcut || 'not set'}</kbd>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
