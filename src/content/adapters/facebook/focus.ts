import { LABELS } from '../../../shared/labels';
import type { AdapterRuntime } from '../types';

const FEED = '[data-pagelet^="FeedUnit"], [role="article"]';

export const facebookFocus: AdapterRuntime = {
  css: {
    reels: ['a[href^="/reel/?s=tab"]', 'a[href="/reel/"]'],
    sidebar: ['div[role="complementary"]'],
  },
  marks: {
    suggested: [{ scope: FEED, texts: LABELS.suggestedForYou }],
    reels: [{ scope: '[data-pagelet^="FeedUnit"]', texts: LABELS.reelsShort }],
    ads: [{ scope: FEED, texts: LABELS.sponsored }],
  },
};
