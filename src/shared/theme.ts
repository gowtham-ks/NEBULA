export interface Appearance {
  bgColor: string | null;
  textColor: string | null;
  accent: string | null;
}
export interface Glass {
  enabled: boolean;
  tint: 'dark' | 'light';
  blur: number; // px
  transparency: number; // % (0 = opaque)
  saturation: number; // %
  borderOpacity: number; // %
  brightness: number; // %
  shadow: number; // %
}
export interface Typography {
  fontFamily: string | null;
  headingFamily: string | null;
  fontSize: number | null; // % of page default
  fontWeight: number | null;
  headingWeight: number | null;
  lineHeight: number | null;
  letterSpacing: number | null; // px
  linkColor: string | null;
}
export type WallpaperSize = 'cover' | 'contain' | 'auto';
export interface Wallpaper {
  assetId: string | null;
  position: string;
  size: WallpaperSize;
  opacity: number; // %
  blur: number; // px
  dim: number; // %
}
export interface Theme {
  id: string;
  name: string;
  builtin: boolean;
  appearance: Appearance;
  glass: Glass;
  typography: Typography;
  wallpaper: Wallpaper;
}

export const POSITIONS = [
  'center', 'top', 'bottom', 'left', 'right',
  'top left', 'top right', 'bottom left', 'bottom right',
];

const ID_RE = /^[\w-]{1,64}$/;
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;
const FAMILY_RE = /^[\w\s,'"-]{1,120}$/;

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (typeof v === 'object' && v !== null ? (v as Obj) : {});

export function clamp(v: unknown, min: number, max: number, fb: number): number {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : fb;
  return Math.min(max, Math.max(min, n));
}
const optNum = (v: unknown, min: number, max: number, fb: number | null) =>
  v === null ? null : typeof v === 'number' && Number.isFinite(v) ? clamp(v, min, max, min) : fb;
const optColor = (v: unknown, fb: string | null) =>
  v === null ? null : typeof v === 'string' && COLOR_RE.test(v) ? v : fb;
const optFamily = (v: unknown, fb: string | null) =>
  v === null ? null : typeof v === 'string' && FAMILY_RE.test(v.trim()) ? v.trim() : fb;

function mk(id: string, name: string, a: Partial<Appearance>, g: Partial<Glass> = {}, ty: Partial<Typography> = {}): Theme {
  return {
    id,
    name,
    builtin: true,
    appearance: { bgColor: null, textColor: null, accent: null, ...a },
    glass: {
      enabled: false, tint: 'dark', blur: 16, transparency: 60, saturation: 130,
      borderOpacity: 15, brightness: 100, shadow: 30, ...g,
    },
    typography: {
      fontFamily: null, headingFamily: null, fontSize: null, fontWeight: null,
      headingWeight: null, lineHeight: null, letterSpacing: null, linkColor: null, ...ty,
    },
    wallpaper: { assetId: null, position: 'center', size: 'cover', opacity: 100, blur: 0, dim: 30 },
  };
}

export const PRESETS: Theme[] = [
  mk('nothing-dark', 'Nothing Dark', { bgColor: '#0a0a0b', textColor: '#e8e8ea', accent: '#d71921' }),
  mk('pure-black', 'Pure Black', { bgColor: '#000000', textColor: '#ffffff', accent: '#ffffff' }),
  mk('frosted-glass', 'Frosted Glass', { bgColor: '#0b0d12', textColor: '#f2f4f8', accent: '#d71921' },
    { enabled: true, blur: 18, transparency: 60, saturation: 140, borderOpacity: 18, shadow: 35 }),
  mk('midnight', 'Midnight', { bgColor: '#0b1020', textColor: '#dbe4ff', accent: '#5b7cfa' }),
  mk('cyberpunk', 'Cyberpunk', { bgColor: '#0d0221', textColor: '#f5e9ff', accent: '#ff2a6d' }),
  mk('amoled', 'AMOLED', { bgColor: '#000000', textColor: '#cfcfcf', accent: '#d71921' }),
  mk('dusk-glass', 'Dusk Glass', { bgColor: '#1a0b1d', textColor: '#f6eef7', accent: '#ff7a85' },
    { enabled: true, blur: 18, transparency: 58, saturation: 130, borderOpacity: 18, shadow: 35 }),
  mk('aurora', 'Aurora', { bgColor: '#07121a', textColor: '#e6fff7', accent: '#3ef0b0' },
    { enabled: true, blur: 20, transparency: 60, saturation: 140, borderOpacity: 16, shadow: 35 }),
  mk('rose-quartz', 'Rose Quartz', { bgColor: '#1b0f14', textColor: '#ffeef3', accent: '#ff6b9a' },
    { enabled: true, blur: 18, transparency: 60, saturation: 130, borderOpacity: 18, shadow: 30 }),
  mk('sunset', 'Sunset', { bgColor: '#1c0d12', textColor: '#fff0e6', accent: '#ff8a4c' },
    { enabled: true, blur: 16, transparency: 62, saturation: 125, borderOpacity: 16, shadow: 30 }),
  mk('terminal', 'Terminal', { bgColor: '#020a04', textColor: '#b8ffcb', accent: '#2bff6a' },
    {}, { fontFamily: '"Courier New", monospace', linkColor: '#7dffa6' }),
  mk('mono-paper', 'Mono Paper', { bgColor: '#fafafa', textColor: '#111111', accent: '#111111' },
    { tint: 'light', transparency: 20, borderOpacity: 10, shadow: 10 }),
  mk('minimal-light', 'Minimal Light', { bgColor: '#f5f5f4', textColor: '#1a1a1a', accent: '#d71921' },
    { tint: 'light', transparency: 30, borderOpacity: 12, shadow: 15 }),
];

export const DEFAULT_THEME: Theme = PRESETS[0];

/** Coerce unknown data into a fully valid, clamped theme. Missing fields fall back to `fb`. */
export function normalizeTheme(raw: unknown, fb: Theme = DEFAULT_THEME): Theme {
  const r = obj(raw), a = obj(r.appearance), g = obj(r.glass), t = obj(r.typography), w = obj(r.wallpaper);
  return {
    id: typeof r.id === 'string' && ID_RE.test(r.id) ? r.id : fb.id,
    name: typeof r.name === 'string' && r.name.trim() ? r.name.trim().slice(0, 60) : fb.name,
    builtin: r.builtin === true,
    appearance: {
      bgColor: optColor(a.bgColor, fb.appearance.bgColor),
      textColor: optColor(a.textColor, fb.appearance.textColor),
      accent: optColor(a.accent, fb.appearance.accent),
    },
    glass: {
      enabled: typeof g.enabled === 'boolean' ? g.enabled : fb.glass.enabled,
      tint: g.tint === 'light' || g.tint === 'dark' ? g.tint : fb.glass.tint,
      blur: clamp(g.blur, 0, 40, fb.glass.blur),
      transparency: clamp(g.transparency, 0, 95, fb.glass.transparency),
      saturation: clamp(g.saturation, 50, 200, fb.glass.saturation),
      borderOpacity: clamp(g.borderOpacity, 0, 60, fb.glass.borderOpacity),
      brightness: clamp(g.brightness, 50, 150, fb.glass.brightness),
      shadow: clamp(g.shadow, 0, 100, fb.glass.shadow),
    },
    typography: {
      fontFamily: optFamily(t.fontFamily, fb.typography.fontFamily),
      headingFamily: optFamily(t.headingFamily, fb.typography.headingFamily),
      fontSize: optNum(t.fontSize, 80, 140, fb.typography.fontSize),
      fontWeight: optNum(t.fontWeight, 100, 900, fb.typography.fontWeight),
      headingWeight: optNum(t.headingWeight, 100, 900, fb.typography.headingWeight),
      lineHeight: optNum(t.lineHeight, 1, 2.6, fb.typography.lineHeight),
      letterSpacing: optNum(t.letterSpacing, -1, 4, fb.typography.letterSpacing),
      linkColor: optColor(t.linkColor, fb.typography.linkColor),
    },
    wallpaper: {
      assetId: w.assetId === null ? null : typeof w.assetId === 'string' && ID_RE.test(w.assetId) ? w.assetId : fb.wallpaper.assetId,
      position: typeof w.position === 'string' && POSITIONS.includes(w.position) ? w.position : fb.wallpaper.position,
      size: w.size === 'cover' || w.size === 'contain' || w.size === 'auto' ? w.size : fb.wallpaper.size,
      opacity: clamp(w.opacity, 0, 100, fb.wallpaper.opacity),
      blur: clamp(w.blur, 0, 40, fb.wallpaper.blur),
      dim: clamp(w.dim, 0, 90, fb.wallpaper.dim),
    },
  };
}

/** Validate a stored list of custom themes: drops junk, dedupes ids, never marks builtin. */
export function normalizeThemes(raw: unknown): Theme[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>(PRESETS.map((p) => p.id));
  const out: Theme[] = [];
  for (const item of raw.slice(0, 100)) {
    const t = normalizeTheme(item);
    if (seen.has(t.id)) continue;
    seen.add(t.id);
    out.push({ ...t, builtin: false });
  }
  return out;
}

export function resolveTheme(activeId: string, custom: Theme[]): Theme {
  return custom.find((t) => t.id === activeId) ?? PRESETS.find((p) => p.id === activeId) ?? DEFAULT_THEME;
}

export const newId = () => `t_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
