import { useEffect, useState, type ChangeEvent } from 'react';
import { Trash2, Upload } from 'lucide-react';
import { Card, ColorField, SelectField, Slider } from '../components/Controls';
import { Switch } from '../components/Switch';
import { GALLERY } from '../modules/wallpapers/gallery';
import { fileToDataUrl, imageUrlToDataUrl } from '../modules/wallpapers/process';
import { POSITIONS, type Theme } from '../shared/theme';
import { deleteWallpaper, listWallpapers, loadWallpaper, saveWallpaper, type WallpaperMeta } from '../storage/themes';

export interface EditorProps {
  theme: Theme;
  edit: (fn: (t: Theme) => void) => void;
}

export function AppearancePanel({ theme, edit }: EditorProps) {
  const a = theme.appearance;
  return (
    <Card title="Colours">
      <ColorField label="Background" value={a.bgColor} onChange={(v) => edit((t) => { t.appearance.bgColor = v; })} />
      <ColorField label="Text" value={a.textColor} onChange={(v) => edit((t) => { t.appearance.textColor = v; })} />
      <ColorField label="Accent" value={a.accent} onChange={(v) => edit((t) => { t.appearance.accent = v; })} />
    </Card>
  );
}

export function GlassPanel({ theme, edit }: EditorProps) {
  const g = theme.glass;
  return (
    <Card title="Glass effect">
      <div className="flex items-center justify-between">
        <span className="text-sm">Enable glass</span>
        <Switch label="Enable glass" checked={g.enabled} onChange={(v) => edit((t) => { t.glass.enabled = v; })} />
      </div>
      <SelectField
        label="Tint" value={g.tint} onChange={(v) => edit((t) => { t.glass.tint = v === 'light' ? 'light' : 'dark'; })}
        options={[['Dark', 'dark'], ['Light', 'light']]}
      />
      <Slider label="Backdrop blur" unit="px" min={0} max={40} value={g.blur} onChange={(v) => edit((t) => { t.glass.blur = v; })} />
      <Slider label="Transparency" unit="%" min={0} max={95} value={g.transparency} onChange={(v) => edit((t) => { t.glass.transparency = v; })} />
      <Slider label="Saturation" unit="%" min={50} max={200} value={g.saturation} onChange={(v) => edit((t) => { t.glass.saturation = v; })} />
      <Slider label="Brightness" unit="%" min={50} max={150} value={g.brightness} onChange={(v) => edit((t) => { t.glass.brightness = v; })} />
      <Slider label="Border opacity" unit="%" min={0} max={60} value={g.borderOpacity} onChange={(v) => edit((t) => { t.glass.borderOpacity = v; })} />
      <Slider label="Shadow strength" unit="%" min={0} max={100} value={g.shadow} onChange={(v) => edit((t) => { t.glass.shadow = v; })} />
      <p className="text-xs text-neutral-500">
        Glass is applied to cards, panels, dialogs, menus and sidebars it can detect. Heavy blur on
        busy pages can reduce performance.
      </p>
    </Card>
  );
}

const FAMILIES: [string, string][] = [
  ['Site default', ''],
  ['System UI', 'system-ui, sans-serif'],
  ['Verdana', 'Verdana, sans-serif'],
  ['Trebuchet MS', '"Trebuchet MS", sans-serif'],
  ['Georgia (serif)', 'Georgia, serif'],
  ['Courier New (mono)', '"Courier New", monospace'],
];
const WEIGHTS: [string, string][] = [['Site default', ''], ['300', '300'], ['400', '400'], ['500', '500'], ['600', '600'], ['700', '700']];

export function TypographyPanel({ theme, edit }: EditorProps) {
  const ty = theme.typography;
  const known = (v: string | null) => FAMILIES.some(([, f]) => f === (v ?? ''));
  return (
    <div className="space-y-4">
      <Card title="Body">
        <SelectField
          label="Font" value={known(ty.fontFamily) ? ty.fontFamily ?? '' : '__custom'}
          options={[...FAMILIES, ...(known(ty.fontFamily) ? [] : ([['Custom', '__custom']] as [string, string][]))]}
          onChange={(v) => edit((t) => { t.typography.fontFamily = v === '__custom' ? t.typography.fontFamily : v || null; })}
        />
        <label className="flex items-center justify-between gap-3">
          <span className="text-sm">Installed font name</span>
          <input
            placeholder="e.g. Fira Sans, sans-serif" value={ty.fontFamily ?? ''}
            onChange={(e) => edit((t) => { t.typography.fontFamily = e.target.value.trim() || null; })}
            className="w-48 rounded-card border border-white/15 bg-graphite px-2 py-1 text-sm"
          />
        </label>
        <Slider label="Font size" unit="%" min={80} max={140} value={ty.fontSize ?? 100} isDefault={ty.fontSize === null}
          onChange={(v) => edit((t) => { t.typography.fontSize = v; })} onClear={() => edit((t) => { t.typography.fontSize = null; })} />
        <SelectField label="Weight" value={String(ty.fontWeight ?? '')} options={WEIGHTS}
          onChange={(v) => edit((t) => { t.typography.fontWeight = v ? Number(v) : null; })} />
        <Slider label="Line height" min={1} max={2.6} step={0.05} value={ty.lineHeight ?? 1.5} isDefault={ty.lineHeight === null}
          onChange={(v) => edit((t) => { t.typography.lineHeight = v; })} onClear={() => edit((t) => { t.typography.lineHeight = null; })} />
        <Slider label="Letter spacing" unit="px" min={-1} max={4} step={0.1} value={ty.letterSpacing ?? 0} isDefault={ty.letterSpacing === null}
          onChange={(v) => edit((t) => { t.typography.letterSpacing = Math.round(v * 10) / 10; })} onClear={() => edit((t) => { t.typography.letterSpacing = null; })} />
      </Card>
      <Card title="Headings and links">
        <SelectField label="Heading font" value={FAMILIES.some(([, f]) => f === (ty.headingFamily ?? '')) ? ty.headingFamily ?? '' : ''}
          options={FAMILIES} onChange={(v) => edit((t) => { t.typography.headingFamily = v || null; })} />
        <SelectField label="Heading weight" value={String(ty.headingWeight ?? '')} options={WEIGHTS}
          onChange={(v) => edit((t) => { t.typography.headingWeight = v ? Number(v) : null; })} />
        <ColorField label="Link colour" value={ty.linkColor} onChange={(v) => edit((t) => { t.typography.linkColor = v; })} />
      </Card>
      <p className="max-w-xl text-xs text-neutral-500">
        Only fonts installed on your computer can be used. Icon fonts are left untouched.
      </p>
    </div>
  );
}

export function WallpaperPanel({ theme, edit }: EditorProps) {
  const [items, setItems] = useState<WallpaperMeta[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const w = theme.wallpaper;

  async function refresh() {
    const list = await listWallpapers();
    const next: Record<string, string> = {};
    for (const it of list) {
      const u = await loadWallpaper(it.id);
      if (u) next[it.id] = u;
    }
    setItems(list);
    setThumbs(next);
  }
  useEffect(() => { void refresh(); }, []);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setBusy(true);
    setMsg(null);
    try {
      const url = await fileToDataUrl(f);
      const res = await saveWallpaper(f.name, url);
      if ('error' in res) setMsg(res.error);
      else {
        await refresh();
        edit((t) => { t.wallpaper.assetId = res.id; });
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Upload failed.');
    }
    setBusy(false);
  }

  async function addBuiltIn(name: string, url: string) {
    setBusy(true);
    setMsg(null);
    try {
      const res = await saveWallpaper(`${name} (built-in)`, await imageUrlToDataUrl(url));
      if ('error' in res) setMsg(res.error);
      else {
        await refresh();
        edit((t) => { t.wallpaper.assetId = res.id; });
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Could not add the wallpaper.');
    }
    setBusy(false);
  }

  async function remove(id: string) {
    await deleteWallpaper(id);
    if (w.assetId === id) edit((t) => { t.wallpaper.assetId = null; });
    await refresh();
  }

  return (
    <div className="space-y-4">
      <Card title="Library">
        <label className="flex w-fit cursor-pointer items-center gap-2 rounded-card border border-white/15 px-3 py-2 text-sm hover:bg-white/10">
          <Upload size={14} /> {busy ? 'Processing…' : 'Upload image'}
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={onFile} />
        </label>
        <p className="label-dot pt-1">Built-in gallery</p>
        <div className="grid grid-cols-4 gap-2">
          {GALLERY.map((g) => (
            <button
              key={g.id} disabled={busy} title={`Add ${g.name}`} onClick={() => void addBuiltIn(g.name, g.url)}
              className="overflow-hidden rounded-card border border-white/10 text-left hover:border-nothing disabled:opacity-50"
            >
              <img src={g.url} alt={g.name} className="h-14 w-full object-cover" />
              <span className="block truncate px-1 py-0.5 text-[10px] text-neutral-400">{g.name}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-neutral-500">Images are resized to 1920 px and stored locally. Nothing is uploaded anywhere.</p>
        {msg && <p className="text-xs text-nothing">{msg}</p>}
        <div className="grid grid-cols-3 gap-2">
          {items.map((it) => (
            <div key={it.id} className={`group relative overflow-hidden rounded-card border ${w.assetId === it.id ? 'border-nothing' : 'border-white/10'}`}>
              <button className="block h-20 w-full" onClick={() => edit((t) => { t.wallpaper.assetId = it.id; })} title={it.name}>
                {thumbs[it.id] && <img src={thumbs[it.id]} alt={it.name} className="h-full w-full object-cover" />}
              </button>
              <button
                onClick={() => void remove(it.id)} aria-label={`Delete ${it.name}`}
                className="absolute right-1 top-1 rounded bg-black/70 p-1 text-neutral-300 hover:text-nothing"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
        {w.assetId && (
          <button onClick={() => edit((t) => { t.wallpaper.assetId = null; })} className="text-xs text-neutral-400 hover:text-white">
            Remove wallpaper from this theme
          </button>
        )}
      </Card>
      <Card title="Display">
        <SelectField label="Position" value={w.position} options={POSITIONS.map((p) => [p, p] as [string, string])}
          onChange={(v) => edit((t) => { t.wallpaper.position = v; })} />
        <SelectField label="Scaling" value={w.size} options={[['Cover', 'cover'], ['Contain', 'contain'], ['Original', 'auto']]}
          onChange={(v) => edit((t) => { t.wallpaper.size = v === 'contain' || v === 'auto' ? v : 'cover'; })} />
        <Slider label="Opacity" unit="%" min={0} max={100} value={w.opacity} onChange={(v) => edit((t) => { t.wallpaper.opacity = v; })} />
        <Slider label="Blur" unit="px" min={0} max={40} value={w.blur} onChange={(v) => edit((t) => { t.wallpaper.blur = v; })} />
        <Slider label="Dimming" unit="%" min={0} max={90} value={w.dim} onChange={(v) => edit((t) => { t.wallpaper.dim = v; })} />
        <p className="text-xs text-neutral-500">
          Wallpapers show behind page content on sites that allow it. Sites with a strict content
          security policy may block the image.
        </p>
      </Card>
    </div>
  );
}
