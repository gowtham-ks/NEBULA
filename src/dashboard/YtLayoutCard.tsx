import { Card, Slider } from '../components/Controls';
import { Switch } from '../components/Switch';
import { useState } from 'react';
import { applyDuskLook } from '../modules/duskLook';
import { useYtLayout } from '../storage/useYtLayout';

/** YouTube glass layout. Saves immediately; the open YouTube tab updates live. */
export function YtLayoutCard() {
  const { layout, error, patch } = useYtLayout();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function dusk() {
    setBusy(true);
    setMsg(null);
    const err = await applyDuskLook();
    setMsg(err ?? 'Applied: Dusk Glass theme, Dusk Bay wallpaper and the glass layout.');
    setBusy(false);
  }

  return (
    <Card title="YouTube and YouTube Music glass layout">
      <button
        onClick={() => void dusk()} disabled={busy}
        className="w-full rounded-card bg-nothing py-2 text-sm text-white disabled:opacity-50"
      >
        {busy ? 'Applying…' : 'Apply the Dusk look (theme + wallpaper + layout)'}
      </button>
      {msg && <p className="text-xs text-neutral-300">{msg}</p>}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm">Enable glass layout</p>
          <p className="text-xs text-neutral-500">
            Floating rounded top bar and sidebar, glass cards and chips. Uses this theme’s glass settings and wallpaper.
          </p>
        </div>
        <Switch label="Enable YouTube glass layout" checked={layout.enabled} onChange={(enabled) => void patch({ enabled })} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">Glass video cards</p>
        <Switch label="Glass video cards" checked={layout.cards} onChange={(cards) => void patch({ cards })} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm">Greeting banner on the home page</p>
        <Switch label="Greeting banner" checked={layout.greeting} onChange={(greeting) => void patch({ greeting })} />
      </div>
      <label className="flex items-center justify-between gap-3">
        <span className="text-sm">Your name</span>
        <input
          value={layout.name} maxLength={30} placeholder="Optional"
          onChange={(e) => void patch({ name: e.target.value })}
          className="w-48 rounded-card border border-white/15 bg-graphite px-2 py-1 text-sm"
        />
      </label>
      <Slider label="Open space above the home grid" unit="vh" min={0} max={60} value={layout.hero} onChange={(hero) => void patch({ hero })} />
      <p className="text-xs text-neutral-500">
        Your name is stored only on this device. The greeting is English. Enable NEBULA on www.youtube.com and on music.youtube.com separately (the greeting is YouTube home only).
        Glass cards on busy pages cost extra GPU: turn them off if scrolling feels slow.
      </p>
      {error && <p className="text-xs text-nothing">Save failed: {error}</p>}
    </Card>
  );
}
