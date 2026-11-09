import type { AdapterRuntime } from '../types';

export const redditFocus: AdapterRuntime = {
  css: {
    promoted: ['shreddit-ad-post', 'shreddit-comments-page-ad', '.promotedlink'],
    sidebarRight: ['#right-sidebar-container', '.side'],
    sidebarLeft: ['#left-sidebar-container'],
    distractions: ['a[href="/r/popular/"]', 'a[href="/r/all/"]', 'a[href="/explore/"]'],
  },
  marks: {
    recommendations: [
      {
        scope: 'shreddit-post',
        texts: ['recommended for you', 'recommended community', 'because you visited this community'],
      },
    ],
  },
};
