import { buildCss } from '../../shared/css';
import type { Theme } from '../../shared/theme';

const STYLE_ID = 'nebula-style';
const USER_ID = 'nebula-user';
const SITE_ID = 'nebula-site';
const WP_ID = 'nebula-wallpaper';
let lastWp: string | null = null;

function ensureStyle(id: string): HTMLStyleElement | null {
  const root = document.documentElement;
  if (!root) return null;
  let s = document.getElementById(id) as HTMLStyleElement | null;
  if (!s) {
    s = document.createElement('style');
    s.id = id;
    root.appendChild(s);
  }
  return s;
}

/** Idempotent: reuses one <style> and one wallpaper element, touching the DOM only on change. */
export function render(theme: Theme, wpUrl: string | null): void {
  const style = ensureStyle(STYLE_ID);
  if (!style) return;
  const css = buildCss(theme, wpUrl !== null);
  if (style.textContent !== css) style.textContent = css;

  let wp = document.getElementById(WP_ID);
  if (wpUrl) {
    if (!wp) {
      wp = document.createElement('div');
      wp.id = WP_ID;
      document.documentElement.appendChild(wp);
      lastWp = null;
    }
    if (lastWp !== wpUrl) {
      wp.style.backgroundImage = `url("${wpUrl}")`;
      lastWp = wpUrl;
    }
  } else if (wp) {
    wp.remove();
    lastWp = null;
  }
}

/** Hidden-element rules plus the user's (already validated) custom CSS. Pure CSS, so it also covers dynamic content. */
export function renderUser(css: string, hiddenSelectors: string[]): void {
  const text = [...hiddenSelectors.map((s) => `${s}{display:none !important}`), css].filter(Boolean).join('\n');
  if (!text) {
    document.getElementById(USER_ID)?.remove();
    return;
  }
  const s = ensureStyle(USER_ID);
  if (s && s.textContent !== text) s.textContent = text;
}

/** CSS from a site adapter (e.g. YouTube variable overrides). */
export function renderSite(css: string): void {
  if (!css) {
    document.getElementById(SITE_ID)?.remove();
    return;
  }
  const s = ensureStyle(SITE_ID);
  if (s && s.textContent !== css) s.textContent = css;
}

export function remove(): void {
  for (const id of [STYLE_ID, SITE_ID, USER_ID, WP_ID]) document.getElementById(id)?.remove();
  lastWp = null;
}
