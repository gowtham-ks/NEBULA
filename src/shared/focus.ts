// Focus Mode definitions shared by the dashboard (labels) and the content script (ids).
export type AdapterId = 'youtube' | 'x' | 'instagram' | 'facebook' | 'reddit';
export interface FeatureDef { id: string; label: string; hint?: string }
export interface AdapterDef { name: string; hosts: string[]; features: FeatureDef[] }
export type FocusConfig = Record<AdapterId, Record<string, boolean>>;

export const ADAPTER_IDS: AdapterId[] = ['youtube', 'x', 'instagram', 'facebook', 'reddit'];

export const FOCUS_ADAPTERS: Record<AdapterId, AdapterDef> = {
  youtube: {
    name: 'YouTube',
    hosts: ['www.youtube.com', 'youtube.com', 'm.youtube.com'],
    features: [
      { id: 'shorts', label: 'Hide Shorts', hint: 'Shelves, menu entries and Shorts in results' },
      { id: 'homepage', label: 'Hide homepage recommendations' },
      { id: 'related', label: 'Hide related videos', hint: 'Watch-page sidebar' },
      { id: 'recommended', label: 'Hide recommended shelves', hint: 'Extra shelves in search results' },
      { id: 'comments', label: 'Hide comments' },
      { id: 'endscreens', label: 'Hide end screens', hint: 'Video end cards and overlays' },
      { id: 'autoplay', label: 'Turn autoplay off', hint: 'Best effort, once per video' },
      { id: 'ads', label: 'Hide ads', hint: 'Known ad placements; clicks Skip when offered. Not an ad blocker' },
      { id: 'dislikes', label: 'Show dislike count', hint: 'Opt-in. Sends the video id to returnyoutubedislikeapi.com' },
    ],
  },
  x: {
    name: 'X',
    hosts: ['x.com', 'twitter.com', 'mobile.twitter.com'],
    features: [
      { id: 'trends', label: 'Hide trends' },
      { id: 'suggestions', label: 'Hide suggested accounts' },
      { id: 'sidebar', label: 'Hide distracting sidebar elements', hint: 'Premium promo and footer links' },
      { id: 'recommended', label: 'Hide the “For you” tab', hint: 'Label based; 11 languages, best effort' },
      { id: 'following', label: 'Prefer Following timeline', hint: 'Opens Following on /home' },
      { id: 'ads', label: 'Hide promoted posts', hint: 'Posts with an Ad/Promoted label; best effort' },
    ],
  },
  instagram: {
    name: 'Instagram',
    hosts: ['www.instagram.com', 'instagram.com'],
    features: [
      { id: 'reels', label: 'Hide Reels entry points' },
      { id: 'suggested', label: 'Hide suggested posts', hint: 'Label based; 11 languages, best effort' },
      { id: 'explore', label: 'Hide Explore', hint: 'Menu link and the Explore page' },
      { id: 'ads', label: 'Hide sponsored posts', hint: 'Posts with a Sponsored label; best effort' },
      { id: 'gallery', label: 'Gallery mode (experimental)', hint: 'Hides like/comment bars and comment boxes in the feed' },
    ],
  },
  facebook: {
    name: 'Facebook',
    hosts: ['www.facebook.com', 'facebook.com', 'm.facebook.com', 'web.facebook.com'],
    features: [
      { id: 'suggested', label: 'Hide suggested posts', hint: 'Label based; 11 languages, best effort' },
      { id: 'reels', label: 'Hide Reels', hint: 'Menu link and the feed section' },
      { id: 'sidebar', label: 'Hide the right sidebar' },
      { id: 'ads', label: 'Hide sponsored posts', hint: 'Facebook disguises this label; often incomplete' },
    ],
  },
  reddit: {
    name: 'Reddit',
    hosts: ['www.reddit.com', 'reddit.com', 'old.reddit.com'],
    features: [
      { id: 'promoted', label: 'Hide promoted posts', hint: 'Only markup NEBULA recognises' },
      { id: 'recommendations', label: 'Hide recommendations', hint: 'Best effort, English only' },
      { id: 'sidebarRight', label: 'Hide right sidebar' },
      { id: 'sidebarLeft', label: 'Hide left sidebar' },
      { id: 'distractions', label: 'Hide Popular, All and Explore links' },
    ],
  },
};

export function adapterForHost(host: string): AdapterId | null {
  return ADAPTER_IDS.find((id) => FOCUS_ADAPTERS[id].hosts.includes(host)) ?? null;
}

const obj = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {});

/** Only known adapters and features survive; everything defaults to off. */
export function normalizeFocus(raw: unknown): FocusConfig {
  const r = obj(raw);
  const out = {} as FocusConfig;
  for (const id of ADAPTER_IDS) {
    const a = obj(r[id]);
    out[id] = {};
    for (const f of FOCUS_ADAPTERS[id].features) out[id][f.id] = a[f.id] === true;
  }
  return out;
}
