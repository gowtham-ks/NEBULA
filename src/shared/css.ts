import type { Theme } from './theme';

// Every interpolated value is a clamped number, a #rrggbb colour, an enum, or a
// font string restricted to [\w\s,'"-] by normalizeTheme. No user text reaches CSS unchecked.

const ICONLESS_SPAN =
  'span:not([class*="icon" i]):not([class*="material" i]):not([class*="fa-" i]):not([class*="glyph" i])';
const HEADINGS = 'h1,h2,h3,h4,h5,h6';
const TEXT = `p,li,td,th,label,blockquote,figcaption,dd,dt,${HEADINGS},${ICONLESS_SPAN}`;
const GLASS_TARGETS =
  'article,aside,nav,[role="dialog"],[role="menu"],[role="listbox"],[role="complementary"],' +
  '[class*="card" i],[class*="panel" i],[class*="modal" i],[class*="popup" i]';

export function buildCss(t: Theme, hasWallpaper: boolean): string {
  const { appearance: a, glass: g, typography: ty, wallpaper: w } = t;
  const out: string[] = [];

  if (a.accent) {
    out.push(`html{accent-color:${a.accent} !important}::selection{background:${a.accent};color:#fff}input,textarea{caret-color:${a.accent}}`);
  }

  if (hasWallpaper) {
    out.push(`html{background:${a.bgColor ?? '#000000'} !important}body{background:transparent !important}`);
    out.push(
      `#nebula-wallpaper{position:fixed;inset:0;z-index:-2147483647;pointer-events:none;` +
        `background-repeat:no-repeat;background-position:${w.position};background-size:${w.size};` +
        `opacity:${(w.opacity / 100).toFixed(2)};filter:blur(${w.blur}px);` +
        `transform:scale(${w.blur > 0 ? 1.08 : 1})}`,
    );
    out.push(`#nebula-wallpaper::after{content:"";position:absolute;inset:0;background:rgba(0,0,0,${(w.dim / 100).toFixed(2)})}`);
  } else if (a.bgColor) {
    out.push(`html,body{background:${a.bgColor} !important}`);
  }

  if (a.textColor) out.push(`body,body :where(${TEXT}){color:${a.textColor} !important}`);

  if (ty.fontSize !== null) out.push(`html{font-size:${ty.fontSize}% !important}`);
  const body: string[] = [];
  if (ty.fontFamily) body.push(`font-family:${ty.fontFamily} !important`);
  if (ty.fontWeight !== null) body.push(`font-weight:${Math.round(ty.fontWeight)} !important`);
  if (ty.lineHeight !== null) body.push(`line-height:${ty.lineHeight} !important`);
  if (ty.letterSpacing !== null) body.push(`letter-spacing:${ty.letterSpacing}px !important`);
  if (body.length) out.push(`body,body :where(${TEXT},a){${body.join(';')}}`);

  const head: string[] = [];
  if (ty.headingFamily) head.push(`font-family:${ty.headingFamily} !important`);
  if (ty.headingWeight !== null) head.push(`font-weight:${Math.round(ty.headingWeight)} !important`);
  if (head.length) out.push(`body :where(${HEADINGS}){${head.join(';')}}`);

  if (ty.linkColor) out.push(`body :where(a){color:${ty.linkColor} !important}`);

  if (g.enabled) {
    const alpha = ((100 - g.transparency) / 100).toFixed(2);
    const base = g.tint === 'light' ? '255,255,255' : '16,16,20';
    const edge = g.tint === 'light' ? '0,0,0' : '255,255,255';
    const border = (g.borderOpacity / 100).toFixed(2);
    const shadow = ((g.shadow / 100) * 0.6).toFixed(2);
    const filter = `blur(${g.blur}px) saturate(${g.saturation}%) brightness(${g.brightness}%)`;
    out.push(
      `${GLASS_TARGETS}{background-color:rgba(${base},${alpha}) !important;` +
        `-webkit-backdrop-filter:${filter} !important;backdrop-filter:${filter} !important;` +
        `box-shadow:0 8px 32px rgba(0,0,0,${shadow}),inset 0 0 0 1px rgba(${edge},${border}) !important}`,
    );
  }

  return out.join('\n');
}
