import { useState } from 'react';
import { X } from 'lucide-react';
import { Card } from '../components/Controls';
import { Switch } from '../components/Switch';
import { disableDislikes, enableDislikes } from '../modules/dislikes';
import { hostOf } from '../modules/sites';
import type { Blocklist } from '../shared/blocklist';
import { ADAPTER_IDS, FOCUS_ADAPTERS, type AdapterId, type FocusConfig } from '../shared/focus';
import type { Settings } from '../shared/schema';

interface Props {
  settings: Settings;
  update: (p: Partial<Settings>) => Promise<void>;
  focus: FocusConfig;
  setFeature: (id: AdapterId, feature: string, value: boolean) => Promise<void>;
  error: string | null;
  blocklist: Blocklist;
  changeBlocklist: (kind: keyof Blocklist, fn: (items: string[]) => string[]) => Promise<void>;
}

function ListEditor(p: { title: string; placeholder: string; items: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void }) {
  const [v, setV] = useState('');
  const add = () => {
    if (v.trim()) p.onAdd(v.trim());
    setV('');
  };
  return (
    <div className="space-y-2">
      <p className="text-sm">{p.title}</p>
      <div className="flex gap-2">
        <input
          value={v} onChange={(e) => setV(e.target.value)} placeholder={p.placeholder} maxLength={60}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          className="min-w-0 flex-1 rounded-card border border-white/15 bg-graphite px-2 py-1.5 text-sm"
        />
        <button onClick={add} className="rounded-card border border-white/15 px-3 text-sm hover:bg-white/10">Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {p.items.map((i) => (
          <span key={i} className="flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-xs">
            {i}
            <button aria-label={`Remove ${i}`} onClick={() => p.onRemove(i)} className="text-neutral-500 hover:text-nothing"><X size={11} /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function FocusPanel({ settings, update, focus, setFeature, error, blocklist, changeBlocklist }: Props) {
  async function toggle(id: AdapterId, feature: string, value: boolean) {
    // The permission prompt needs the click's user gesture, so ask before any other await.
    if (id === 'youtube' && feature === 'dislikes') {
      if (value) {
        if (!(await enableDislikes())) return;
      } else {
        await disableDislikes();
      }
    }
    await setFeature(id, feature, value);
  }

  return (
    <div className="max-w-xl space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm">Focus Mode</p>
            <p className="text-xs text-neutral-500">Master switch for the site features below</p>
          </div>
          <Switch label="Focus Mode" checked={settings.focusMode} onChange={(focusMode) => void update({ focusMode })} />
        </div>
      </Card>

      {ADAPTER_IDS.map((id) => {
        const def = FOCUS_ADAPTERS[id];
        const enabled = settings.sites.filter((s) => def.hosts.includes(hostOf(s)));
        return (
          <Card key={id} title={def.name}>
            {enabled.length === 0 && (
              <p className="text-xs text-neutral-500">
                NEBULA isn’t enabled on {def.name} yet. Open {def.hosts[0]}, click NEBULA, then “Enable on this site”.
              </p>
            )}
            {def.features.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm">{f.label}</p>
                  {f.hint && <p className="text-xs text-neutral-500">{f.hint}</p>}
                </div>
                <Switch label={f.label} checked={focus[id][f.id] === true} onChange={(v) => void toggle(id, f.id, v)} />
              </div>
            ))}
            {id === 'youtube' && (
              <button
                onClick={() => void chrome.tabs.create({ url: 'https://www.youtube.com/feed/history' })}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Open YouTube History (it has its own search) →
              </button>
            )}
          </Card>
        );
      })}

      <Card title="YouTube blocklist">
        <ListEditor
          title="Hide channels" placeholder="Channel name" items={blocklist.channels}
          onAdd={(v) => void changeBlocklist('channels', (l) => [...l, v])}
          onRemove={(v) => void changeBlocklist('channels', (l) => l.filter((x) => x !== v))}
        />
        <ListEditor
          title="Hide words" placeholder="Word or phrase in a title" items={blocklist.words}
          onAdd={(v) => void changeBlocklist('words', (l) => [...l, v])}
          onRemove={(v) => void changeBlocklist('words', (l) => l.filter((x) => x !== v))}
        />
        <p className="text-xs text-neutral-500">
          Matches whole words, ignoring case, on videos in feeds, search and the sidebar. Works even when Focus Mode is off,
          on YouTube sites where NEBULA is enabled.
        </p>
      </Card>

      {error && <p className="text-xs text-nothing">Save failed: {error}</p>}
      <p className="text-xs text-neutral-500">
        Sites change their markup without notice, so some rules may stop matching; a rule that matches nothing is harmless.
        NEBULA is not an ad blocker: it hides the ad placements listed above and does not block ad requests.
      </p>
    </div>
  );
}
