import type { Theme } from '../../../shared/theme';
import type { YtLayout } from '../../../shared/ytlayout';
import { youtubeLayoutCss } from './layout';

// YouTube Music (music.youtube.com) has its own element and variable names. Best effort, unverified.
export function musicThemeCss(t: Theme, hasWallpaper: boolean): string {
  const a = t.appearance;
  const bg = hasWallpaper ? 'transparent' : a.bgColor;
  const vars: string[] = [];
  if (bg) {
    for (const v of ['base-background', 'general-background-a', 'general-background-b', 'general-background-c', 'brand-background-solid']) vars.push(`--yt-spec-${v}:${bg}`);
    for (const v of ['general-background-a', 'general-background-b', 'general-background-c', 'background']) vars.push(`--ytmusic-${v}:${bg}`);
  }
  if (a.textColor) {
    vars.push(`--yt-spec-text-primary:${a.textColor}`, `--ytmusic-text-primary:${a.textColor}`);
    vars.push(`--yt-spec-text-secondary:color-mix(in srgb, ${a.textColor} 65%, transparent)`);
  }
  const out: string[] = [];
  if (vars.length) out.push(`html,html[dark],ytmusic-app{${vars.map((v) => `${v} !important`).join(';')}}`);
  if (hasWallpaper) out.push('html,body,ytmusic-app,ytmusic-app-layout,ytmusic-browse-response,ytmusic-section-list-renderer{background:transparent !important}');
  else if (a.bgColor) out.push(`html,body,ytmusic-app,ytmusic-app-layout{background:${a.bgColor} !important}`);
  return out.join('\n');
}

export function musicLayoutCss(t: Theme, l: YtLayout): string {
  const g = t.glass;
  const bg = `rgba(${g.tint === 'light' ? '255,255,255' : '16,16,20'},${((100 - g.transparency) / 100).toFixed(2)})`;
  const edge = g.tint === 'light' ? '0,0,0' : '255,255,255';
  const ring = `inset 0 0 0 1px rgba(${edge},${(g.borderOpacity / 100).toFixed(2)})`;
  const blur = `blur(${g.blur}px) saturate(${g.saturation}%)`;
  const glass = `background:${bg} !important;-webkit-backdrop-filter:${blur};backdrop-filter:${blur};box-shadow:${ring} !important`;
  const out = [
    'ytmusic-nav-bar,ytmusic-player-bar{background:transparent !important}',
    `#nav-bar-background.ytmusic-app-layout,#player-bar-background.ytmusic-app-layout{${glass}}`,
    `ytmusic-guide-renderer,ytmusic-chip-cloud-chip-renderer{${glass};border-radius:14px !important}`,
  ];
  if (l.cards) out.push(`ytmusic-two-row-item-renderer{${glass};border-radius:16px !important;padding:8px !important;box-sizing:border-box}`);
  return out.join('\n');
}

export { youtubeLayoutCss };
