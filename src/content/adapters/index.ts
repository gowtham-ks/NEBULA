import type { AdapterId } from '../../shared/focus';
import type { Theme } from '../../shared/theme';
import { facebookFocus } from './facebook/focus';
import { instagramFocus } from './instagram/focus';
import { redditFocus } from './reddit/focus';
import type { AdapterRuntime } from './types';
import { xFocus } from './x/focus';
import { youtubeCss } from './youtube/theme';
import { youtubeFocus } from './youtube/focus';
import { musicThemeCss } from './youtube/music';

export const ADAPTER_RUNTIMES: Record<AdapterId, AdapterRuntime> = {
  youtube: youtubeFocus,
  x: xFocus,
  instagram: instagramFocus,
  facebook: facebookFocus,
  reddit: redditFocus,
};

/** Site-specific theme CSS. Returns '' for sites without a theme adapter (generic styling still applies). */
export function adapterCss(host: string, theme: Theme, hasWallpaper: boolean): string {
  if (host === 'www.youtube.com' || host === 'youtube.com' || host === 'm.youtube.com') {
    return youtubeCss(theme, hasWallpaper);
  }
  if (host === 'music.youtube.com') return musicThemeCss(theme, hasWallpaper);
  return '';
}
