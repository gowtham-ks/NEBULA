import { useEffect, useState, type ChangeEvent } from 'react';
import { Card } from '../components/Controls';
import { Switch } from '../components/Switch';
import { exportBackup, restoreBackup } from '../modules/backup';
import { downloadText } from '../modules/download';
import { resetEverything } from '../modules/maintenance';
import { parseBackup, type ParsedBackup } from '../shared/backup';
import { DEFAULT_SETTINGS, type Settings } from '../shared/schema';

interface Props {
  settings: Settings;
  update: (p: Partial<Settings>) => Promise<void>;
  error: string | null;
}

export function SettingsPanel({ settings, update, error }: Props) {
  const [bytes, setBytes] = useState<number | null>(null);
  const [withWp, setWithWp] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState<ParsedBackup | null>(null);

  useEffect(() => {
    chrome.storage.local.getBytesInUse(null).then(setBytes).catch(() => setBytes(null));
  }, [settings]);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const res = parseBackup(await f.text());
    if ('error' in res) { setPending(null); setMsg(res.error); return; }
    setPending(res.backup);
    setMsg(null);
  }

  async function restore() {
    if (!pending) return;
    // The first await inside restoreBackup is the permission prompt, so the click's user gesture is still valid.
    const err = await restoreBackup(pending, settings.sites);
    if (err) { setMsg(err); return; }
    location.reload();
  }

  const date = new Date().toISOString().slice(0, 10);
  const manifest = chrome.runtime.getManifest();

  return (
    <div className="max-w-xl space-y-4">
      <Card title="General">
        <div className="flex items-center justify-between">
          <p className="text-sm">Focus Mode (global)</p>
          <Switch label="Focus Mode" checked={settings.focusMode} onChange={(focusMode) => void update({ focusMode })} />
        </div>
        <button className="btn w-fit" onClick={() => void update({ ...DEFAULT_SETTINGS, sites: settings.sites, onboarded: true })}>Reset global settings</button>
      </Card>

      <Card title="Backup and restore">
        <p className="text-xs text-neutral-500">
          One file with your settings, themes, site profiles, Focus Mode choices, blocklist and layout. Stays on your device unless you move it.
        </p>
        <label className="flex items-center gap-2 text-xs text-neutral-400">
          <input type="checkbox" className="accent-nothing" checked={withWp} onChange={(e) => setWithWp(e.target.checked)} />
          Include wallpapers (larger file)
        </label>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" onClick={async () => downloadText(`nebula-backup-${date}.json`, await exportBackup(withWp), 'application/json')}>Export backup</button>
          <label className="btn cursor-pointer">
            Import backup
            <input type="file" accept=".json,application/json" className="hidden" onChange={onFile} />
          </label>
        </div>
        {pending && (
          <div className="rounded-card border border-white/15 p-3 text-sm">
            <p>
              Replace ALL current NEBULA data with this backup? It has {pending.themes.length} theme(s), {pending.settings.sites.length} site(s),
              {' '}{pending.wallpapers.index.length} wallpaper(s). Chrome will ask permission for the sites again.
            </p>
            <div className="mt-2 flex gap-2">
              <button className="btn btn-primary" onClick={() => void restore()}>Restore</button>
              <button className="btn" onClick={() => setPending(null)}>Cancel</button>
            </div>
          </div>
        )}
        {msg && <p className="text-xs text-nothing">{msg}</p>}
      </Card>

      <Card title="Storage">
        <p className="text-sm">{bytes === null ? 'Unavailable' : `${(bytes / 1048576).toFixed(1)} MB used of about 10 MB`}</p>
        <p className="text-xs text-neutral-500">Wallpapers use the most space.</p>
      </Card>

      <Card title="Danger zone">
        <p className="text-xs text-neutral-500">Removes every theme, wallpaper, rule, profile and site permission, then starts fresh.</p>
        <button
          className="btn w-fit border-nothing text-nothing"
          onClick={async () => {
            if (!confirm('Delete ALL NEBULA data and site permissions? This cannot be undone.')) return;
            await resetEverything(settings.sites);
            location.reload();
          }}
        >
          Delete everything
        </button>
      </Card>

      <Card title="About">
        <p className="text-sm">NEBULA {manifest.version}</p>
        <p className="text-xs text-neutral-500">
          Private by design: no analytics, no accounts, no tracking. The only optional network feature is the YouTube dislike count, which you must switch on yourself.
        </p>
      </Card>
      {error && <p className="text-xs text-nothing">Save failed: {error}</p>}
    </div>
  );
}
