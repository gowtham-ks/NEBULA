import { LABELS } from '../../../shared/labels';
import type { AdapterRuntime } from '../types';

export const instagramFocus: AdapterRuntime = {
  pathAttr: true,
  css: {
    reels: ['a[href="/reels/"]', 'a[href="/reels"]'],
    explore: ['a[href="/explore/"]', 'a[href="/explore"]', 'html[data-nebula-path="explore"] main'],
    // Experimental: action bar (like/comment/share) and the comment box of feed posts.
    gallery: ['article section', 'article form'],
  },
  marks: {
    suggested: [{ scope: 'article', texts: [...LABELS.suggestedForYou, ...LABELS.suggestedPosts] }],
    ads: [{ scope: 'article', texts: LABELS.sponsored }],
  },
};
