import { LABELS } from '../../../shared/labels';
import type { AdapterRuntime } from '../types';

export const xFocus: AdapterRuntime = {
  css: {
    trends: [
      'section[aria-labelledby]:has([data-testid="trend"])',
      '[aria-label="Timeline: Trending now"]',
      '[aria-label="Trending"]',
    ],
    suggestions: ['aside[aria-label="Who to follow"]', '[aria-label="Who to follow"]', 'aside[aria-label="Relevant people"]'],
    sidebar: [
      '[data-testid="sidebarColumn"] aside[aria-label="Subscribe to Premium"]',
      '[data-testid="sidebarColumn"] [aria-label="Subscribe to Premium"]',
      '[data-testid="sidebarColumn"] nav[aria-label="Footer"]',
    ],
    ads: ['[data-testid="placementTracking"]'],
  },
  marks: {
    recommended: [{ scope: '[role="tablist"]', texts: LABELS.forYou, hide: '[role="tab"]' }],
    ads: [{ scope: 'article[data-testid="tweet"]', texts: [...LABELS.ad, ...LABELS.sponsored], hide: '[data-testid="cellInnerDiv"]' }],
  },
  actions: {
    following: () => {
      if (location.pathname !== '/home') return true;
      const tab = [...document.querySelectorAll<HTMLElement>('main [role="tab"]')].find((t) =>
        LABELS.following.includes((t.textContent ?? '').trim().toLowerCase()),
      );
      if (!tab) return false;
      if (tab.getAttribute('aria-selected') !== 'true') tab.click();
      return true;
    },
  },
};
