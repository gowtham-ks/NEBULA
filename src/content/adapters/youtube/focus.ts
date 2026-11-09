import type { AdapterRuntime } from '../types';
import { dislikeTick } from './dislikes';

// Skips a video ad only when YouTube shows its own Skip button. Never mutes, seeks or blocks requests.
function skipAd(): void {
  if (!document.querySelector('.ad-showing')) return;
  document.querySelector<HTMLElement>('.ytp-skip-ad-button, .ytp-ad-skip-button, .ytp-ad-skip-button-modern')?.click();
}

export const youtubeFocus: AdapterRuntime = {
  css: {
    shorts: [
      'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
      'ytd-rich-shelf-renderer[is-shorts]',
      'ytd-reel-shelf-renderer',
      'ytd-guide-entry-renderer:has(a[title="Shorts"])',
      'ytd-mini-guide-entry-renderer[aria-label="Shorts"]',
      'ytd-video-renderer:has(a[href^="/shorts/"])',
      'ytd-rich-item-renderer:has(a[href^="/shorts/"])',
      'ytd-grid-video-renderer:has(a[href^="/shorts/"])',
      'ytd-compact-video-renderer:has(a[href^="/shorts/"])',
      'ytm-shorts-lockup-view-model',
      'yt-tab-shape[tab-title="Shorts"]',
    ],
    homepage: ['ytd-browse[page-subtype="home"] ytd-rich-grid-renderer'],
    related: ['#related', 'ytd-watch-next-secondary-results-renderer'],
    recommended: ['ytd-search ytd-shelf-renderer', 'ytd-search ytd-horizontal-card-list-renderer'],
    comments: ['ytd-comments', '#comments'],
    endscreens: ['.ytp-ce-element', '.ytp-endscreen-content', '.videowall-endscreen', '.ytp-ce-covering-overlay'],
    // Known ad placements only (cosmetic hiding). Unskippable video ads still play.
    ads: [
      'ytd-ad-slot-renderer', 'ytd-display-ad-renderer', 'ytd-promoted-sparkles-web-renderer',
      'ytd-promoted-video-renderer', 'ytd-in-feed-ad-layout-renderer', 'ytd-banner-promo-renderer',
      'ytd-statement-banner-renderer', '#masthead-ad', '#player-ads', '.ytp-ad-overlay-container',
      'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-ads"]',
    ],
  },
  ticks: { ads: skipAd, dislikes: dislikeTick },
  actions: {
    autoplay: () => {
      const on = document.querySelector<HTMLElement>('.ytp-autonav-toggle-button[aria-checked="true"]');
      if (on) {
        on.click();
        return true;
      }
      return !!document.querySelector('.ytp-autonav-toggle-button[aria-checked="false"]');
    },
  },
};
