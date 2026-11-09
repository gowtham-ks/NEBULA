import { useEffect, useState } from 'react';
import { Card } from '../components/Controls';
import { Switch } from '../components/Switch';
import { ADAPTER_IDS, FOCUS_ADAPTERS } from '../shared/focus';
import { KEYS } from '../shared/keys';
import { fromTime, toTime } from '../shared/schedule';
import type { Settings } from '../shared/schema';
import { PRESETS, type Theme } from '../shared/theme';
import { normalizeUsage, todayKey, type Usage } from '../shared/usage';

interface Props {
  settings: Settings;
  update: (p: Partial<Settings>) => Promise<void>;
  custom: Theme[];
}

function useUsage(): Usage {
  const [usage, setUsage] = useState<Usage>({ date: todayKey(), minutes: {} });
  useEffect(() => {
    let alive = true;
    const load = () => chrome.storage.local.get(KEYS.usage).then((r) => alive && setUsage(normalizeUsage(r[KEYS.usage], todayKey()))).catch(() => undefined);
    void load();
    const l = (c: Record<string, chrome.storage.StorageChange>, a: string) => { if (a === 'local' && c[KEYS.usage]) void load(); };
    chrome.storage.onChanged.addListener(l);
    return () => { alive = false; chrome.storage.onChanged.removeListener(l); };
  }, []);
  return usage;
}

export function AutomationPanel({ settings, update, custom }: Props) {
  const sc = settings.schedule;
  const usage = useUsage();
  const themes = [...custom, ...PRESETS];
  const setSchedule = (p: Partial<typeof sc>) => void update({ schedule: { ...sc, ...p } });
  const sel = 'rounded-card border border-white/15 bg-graphite px-2 py-1 text-sm';

  return (
    <div className="max-w-xl space-y-4">
      <Card title="Automatic theme">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm">Switch theme automatically</p>
            <p className="text-xs text-neutral-500">Overrides the global theme; a site’s own theme override still wins.</p>
          </div>
          <Switch label="Automatic theme" checked={sc.enabled} onChange={(enabled) => setSchedule({ enabled })} />
        </div>
        <label className="flex items-center justify-between gap-3 text-sm">
          Based on
          <select className={sel} value={sc.mode} onChange={(e) => setSchedule({ mode: e.target.value === 'system' ? 'system' : 'time' })}>
            <option value="time">Time of day</option>
            <option value="system">System light/dark</option>
          </select>
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          Day theme
          <select className={sel} value={sc.dayThemeId} onChange={(e) => setSchedule({ dayThemeId: e.target.value })}>
            {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        <label className="flex items-center justify-between gap-3 text-sm">
          Night theme
          <select className={sel} value={sc.nightThemeId} onChange={(e) => setSchedule({ nightThemeId: e.target.value })}>
            {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
        {sc.mode === 'time' && (
          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex items-center gap-2">Day starts <input type="time" className={sel} value={toTime(sc.dayStart)} onChange={(e) => setSchedule({ dayStart: fromTime(e.target.value, sc.dayStart) })} /></label>
            <label className="flex items-center gap-2">Night starts <input type="time" className={sel} value={toTime(sc.nightStart)} onChange={(e) => setSchedule({ nightStart: fromTime(e.target.value, sc.nightStart) })} /></label>
          </div>
        )}
      </Card>

      <Card title="Daily time limits">
        <p className="text-xs text-neutral-500">
          Optional. When you pass the limit, a full-page reminder appears (you can snooze it for 5 minutes). Time counts only while the
          tab is visible and focused, on sites where NEBULA is enabled. Minutes are stored on this device per day; no URLs or history.
        </p>
        {ADAPTER_IDS.map((id) => (
          <label key={id} className="flex items-center justify-between gap-3 text-sm">
            <span>
              {FOCUS_ADAPTERS[id].name}
              {settings.limits[id] > 0 && <span className="ml-2 text-xs text-neutral-500">{usage.minutes[id] ?? 0} / {settings.limits[id]} min today</span>}
            </span>
            <span className="flex items-center gap-2">
              <input
                type="number" min={0} max={600} className={`${sel} w-20`} value={settings.limits[id] ?? 0}
                onChange={(e) => void update({ limits: { ...settings.limits, [id]: Math.max(0, Math.min(600, Math.round(Number(e.target.value) || 0))) } })}
              />
              <span className="text-xs text-neutral-500">min (0 = off)</span>
            </span>
          </label>
        ))}
      </Card>

      <Card title="Keyboard shortcuts">
        <p className="text-sm text-neutral-300">Alt+Shift+N turn NEBULA on/off · Alt+Shift+F Focus Mode · Alt+Shift+P pick an element.</p>
        <button className="btn w-fit" onClick={() => void chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })}>Change shortcuts</button>
      </Card>
    </div>
  );
}
