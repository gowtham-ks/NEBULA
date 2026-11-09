import type { Theme } from '../../../shared/theme';
import type { YtLayout } from '../../../shared/ytlayout';

interface Tokens { bg: string; blur: string; cardBlur: string; ring: string; panel: string; card: string; text: string; accent: string }

function tokens(t: Theme, radius = 18): Tokens {
  const g = t.glass;
  const bg = `rgba(${g.tint === 'light' ? '255,255,255' : '16,16,20'},${((100 - g.transparency) / 100).toFixed(2)})`;
  const edge = g.tint === 'light' ? '0,0,0' : '255,255,255';
  const ring = `inset 0 0 0 1px rgba(${edge},${(g.borderOpacity / 100).toFixed(2)})`;
  const blur = `blur(${g.blur}px) saturate(${g.saturation}%)`;
  const cardBlur = `blur(${Math.min(g.blur, 12)}px) saturate(${g.saturation}%)`;
  const shadow = `0 8px 32px rgba(0,0,0,${((g.shadow / 100) * 0.5).toFixed(2)})`;
  return {
    bg, blur, cardBlur, ring,
    panel: `background:${bg} !important;-webkit-backdrop-filter:${blur};backdrop-filter:${blur};border-radius:${radius}px !important;box-shadow:${ring},${shadow} !important`,
    card: `background:${bg} !important;-webkit-backdrop-filter:${cardBlur};backdrop-filter:${cardBlur};border-radius:16px !important;box-shadow:${ring} !important;overflow:hidden;box-sizing:border-box`,
    text: t.appearance.textColor ?? '#ffffff',
    accent: t.appearance.accent ?? '#ff7a85',
  };
}

// Glass layout for www.youtube.com. Page-specific rules use html[data-nebula-page] set by the layout engine.
// Selectors follow YouTube's current custom elements and may need adjusting after a YouTube update.
export function youtubeLayoutCss(t: Theme, l: YtLayout): string {
  const k = tokens(t);
  const out: string[] = [
    // Transparent app shell so the wallpaper shows behind every page.
    'ytd-app,ytd-page-manager,ytd-browse,ytd-search,ytd-watch-flexy,ytd-two-column-browse-results-renderer,' +
      'ytd-two-column-search-results-renderer,ytd-playlist-sidebar-renderer,ytd-tabbed-page-header,#page-header,' +
      'tp-yt-paper-tabs,#page-manager{background:transparent !important}',
    // Top bar: a floating rounded pill.
    'ytd-masthead,ytd-masthead #background{background:transparent !important}',
    `ytd-masthead #container.ytd-masthead{${k.panel};margin:6px 12px !important;height:44px !important;width:auto !important}`,
    // Sidebar: glass everywhere; a floating inset panel only when it is the persistent sidebar.
    `ytd-guide-renderer,ytd-mini-guide-renderer{background:${k.bg} !important;-webkit-backdrop-filter:${k.blur};backdrop-filter:${k.blur};border-radius:18px !important}`,
    `ytd-app[guide-persistent-and-visible] ytd-guide-renderer{${k.panel};margin:8px 0 8px 8px !important}`,
    'ytd-guide-renderer #guide-content,ytd-guide-renderer #guide-inner-content{background:transparent !important}',
    // Filter chips.
    `yt-chip-cloud-chip-renderer{background:${k.bg} !important;-webkit-backdrop-filter:${k.cardBlur};backdrop-filter:${k.cardBlur};box-shadow:${k.ring} !important;border-radius:10px !important}`,
    'ytd-feed-filter-chip-bar-renderer #chips-wrapper{background:transparent !important}',
    // Panels that sit on watch pages.
    `ytd-watch-metadata #description.ytd-watch-metadata,ytd-playlist-panel-renderer,ytd-engagement-panel-section-list-renderer{background:${k.bg} !important;-webkit-backdrop-filter:${k.cardBlur};backdrop-filter:${k.cardBlur};border-radius:14px !important;box-shadow:${k.ring} !important}`,
  ];

  if (l.cards) {
    out.push(
      `ytd-rich-grid-media{${k.card}}`,
      'ytd-rich-grid-media #details{padding:0 12px 12px !important}',
      `yt-lockup-view-model,ytd-video-renderer,ytd-compact-video-renderer,ytd-playlist-video-renderer,ytd-grid-video-renderer{${k.card};padding:8px !important}`,
    );
  }

  if (l.hero > 0) {
    out.push(
      'ytd-browse[page-subtype="home"]{position:relative}',
      `ytd-browse[page-subtype="home"] ytd-rich-grid-renderer{margin-top:${l.hero}vh !important}`,
    );
  }

  out.push(
    `#nebula-greeting{position:absolute;top:24px;left:28px;right:28px;z-index:1;pointer-events:none;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:${k.text}}`,
    `#nebula-greeting .nebula-date{display:inline-block;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:600;letter-spacing:.12em;background:${k.bg};box-shadow:${k.ring};-webkit-backdrop-filter:${k.blur};backdrop-filter:${k.blur}}`,
    '#nebula-greeting .nebula-hello{margin:14px 0 0;font-size:clamp(34px,5vw,72px);line-height:1.05;font-weight:700;letter-spacing:-.02em}',
    `#nebula-greeting .nebula-name{display:block;color:${k.accent}}`,
  );
  return out.join('\n');
}
