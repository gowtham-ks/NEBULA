import type { Theme } from '../../shared/theme';
import type { YtLayout } from '../../shared/ytlayout';
import { musicLayoutCss } from '../adapters/youtube/music';
import { youtubeLayoutCss } from '../adapters/youtube/layout';

export type Surface = 'youtube' | 'music';

const STYLE_ID = 'nebula-yt-layout';
const GREET_ID = 'nebula-greeting';
const PAGE_ATTR = 'data-nebula-page';
const DATE = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

function hello(hour: number): string {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function setText(el: Element | null, text: string): void {
  if (el && el.textContent !== text) el.textContent = text;
}

function pageOf(): string {
  const p = location.pathname;
  if (p === '/') return 'home';
  if (p.startsWith('/watch')) return 'watch';
  if (p.startsWith('/shorts')) return 'shorts';
  if (p.startsWith('/results')) return 'results';
  if (p.startsWith('/feed/subscriptions')) return 'subscriptions';
  if (p.startsWith('/feed/history')) return 'history';
  if (p.startsWith('/playlist')) return 'playlist';
  if (/^\/(@|channel\/|c\/|user\/)/.test(p)) return 'channel';
  return 'other';
}

/** Applies the glass layout for YouTube or YouTube Music, tags the current page type, and keeps the home greeting in place. */
export function createYtLayoutEngine() {
  let key = '';
  let timer: number | undefined;
  let current: { layout: YtLayout; surface: Surface } | null = null;

  function tick(): void {
    if (document.hidden || !current) return;
    const root = document.documentElement;
    const page = current.surface === 'music' ? 'music' : pageOf();
    if (root.getAttribute(PAGE_ATTR) !== page) root.setAttribute(PAGE_ATTR, page);

    const host = current.surface === 'youtube' && page === 'home' ? document.querySelector('ytd-browse[page-subtype="home"]') : null;
    let el = document.getElementById(GREET_ID);
    if (!current.layout.greeting || !host) {
      el?.remove();
      return;
    }
    if (!el || el.parentElement !== host) {
      el?.remove();
      el = document.createElement('div');
      el.id = GREET_ID;
      const date = document.createElement('span');
      date.className = 'nebula-date';
      const h = document.createElement('h2');
      h.className = 'nebula-hello';
      const text = document.createElement('span');
      text.className = 'nebula-text';
      const name = document.createElement('span');
      name.className = 'nebula-name';
      h.append(text, name);
      el.append(date, h);
      host.prepend(el);
    }
    const now = new Date();
    const name = current.layout.name;
    setText(el.querySelector('.nebula-date'), DATE.format(now).toUpperCase());
    setText(el.querySelector('.nebula-text'), name ? `${hello(now.getHours())},` : hello(now.getHours()));
    setText(el.querySelector('.nebula-name'), name);
  }

  function stop(): void {
    window.clearInterval(timer);
    timer = undefined;
    current = null;
    key = '';
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(GREET_ID)?.remove();
    document.documentElement?.removeAttribute(PAGE_ATTR);
  }

  function update(state: { layout: YtLayout; theme: Theme; surface: Surface } | null): void {
    if (!state || !state.layout.enabled) {
      if (key) stop();
      return;
    }
    const css = state.surface === 'music' ? musicLayoutCss(state.theme, state.layout) : youtubeLayoutCss(state.theme, state.layout);
    const next = state.surface + css + JSON.stringify(state.layout);
    if (next === key) return;
    key = next;
    current = { layout: state.layout, surface: state.surface };

    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.documentElement.appendChild(style);
    }
    if (style.textContent !== css) style.textContent = css;

    tick();
    if (timer === undefined) timer = window.setInterval(tick, 500);
  }

  return { update };
}
