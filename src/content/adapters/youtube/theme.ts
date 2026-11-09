import type { Theme } from '../../../shared/theme';

// YouTube colours its UI through --yt-spec-* variables, so we override those
// instead of fighting individual elements. Variable names can change when YouTube updates.
export function youtubeCss(t: Theme, hasWallpaper: boolean): string {
  const { appearance: a, glass: g } = t;
  const vars: string[] = [];
  const bg = hasWallpaper ? 'transparent' : a.bgColor;

  if (bg) {
    for (const v of ['base-background', 'general-background-a', 'general-background-b', 'general-background-c', 'brand-background-solid']) {
      vars.push(`--yt-spec-${v}:${bg}`);
    }
  }
  const raised = g.enabled
    ? `rgba(${g.tint === 'light' ? '255,255,255' : '16,16,20'},${((100 - g.transparency) / 100).toFixed(2)})`
    : a.bgColor;
  if (raised) {
    for (const v of ['raised-background', 'menu-background', 'additive-background', 'badge-chip-background']) {
      vars.push(`--yt-spec-${v}:${raised}`);
    }
  }
  if (a.textColor) {
    vars.push(`--yt-spec-text-primary:${a.textColor}`);
    vars.push(`--yt-spec-text-secondary:color-mix(in srgb, ${a.textColor} 65%, transparent)`);
    vars.push(`--yt-spec-icon-active-other:${a.textColor}`);
  }
  if (!vars.length) return '';

  const decl = vars.map((v) => `${v} !important`).join(';');
  const out = [`html,html[dark],html:not([dark]){${decl}}`];
  if (hasWallpaper) out.push('ytd-app,ytd-page-manager,ytd-browse,ytd-watch-flexy{background:transparent !important}');
  if (g.enabled) {
    const f = `blur(${g.blur}px) saturate(${g.saturation}%)`;
    out.push(`ytd-popup-container tp-yt-paper-dialog,ytd-menu-popup-renderer,#guide-content,ytd-mini-guide-renderer{-webkit-backdrop-filter:${f};backdrop-filter:${f}}`);
  }
  return out.join('\n');
}
