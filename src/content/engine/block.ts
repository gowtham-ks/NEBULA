import { buildMatcher, type Blocklist } from '../../shared/blocklist';

const ATTR = 'data-nebula-block';
const STYLE_ID = 'nebula-block';
const MAX_EVALS = 8;
const SCOPE =
  'ytd-rich-item-renderer,ytd-video-renderer,ytd-compact-video-renderer,ytd-grid-video-renderer,' +
  'yt-lockup-view-model,ytd-playlist-renderer,ytd-channel-renderer';
const CHANNEL = 'ytd-channel-name,#channel-name,.yt-content-metadata-view-model-wiki__metadata-row,[class*="channel-name"]';

/** Hides YouTube items whose channel or text matches the user's lists. Added nodes only, batched, bounded. */
export function createBlockEngine() {
  let key = '';
  let observer: MutationObserver | null = null;
  let flushTimer: number | undefined;
  let channels: RegExp | null = null;
  let words: RegExp | null = null;
  const pending = new Set<Element>();
  const evals = new WeakMap<Element, number>();

  function stop(): void {
    observer?.disconnect();
    observer = null;
    window.clearTimeout(flushTimer);
    flushTimer = undefined;
    pending.clear();
    key = '';
    document.getElementById(STYLE_ID)?.remove();
    document.querySelectorAll(`[${ATTR}]`).forEach((e) => e.removeAttribute(ATTR));
  }

  function check(c: Element): void {
    if (c.hasAttribute(ATTR)) return;
    const n = evals.get(c) ?? 0;
    if (n >= MAX_EVALS) return;
    evals.set(c, n + 1);
    const text = (c.textContent ?? '').slice(0, 1500);
    const channelText = c.querySelector(CHANNEL)?.textContent ?? text;
    if ((words && words.test(text)) || (channels && channels.test(channelText))) c.setAttribute(ATTR, '1');
  }

  function evaluate(el: Element): void {
    const own = el.closest(SCOPE);
    if (own) check(own);
    let i = 0;
    for (const c of el.querySelectorAll(SCOPE)) {
      check(c);
      if (++i > 150) break;
    }
  }

  function flush(): void {
    flushTimer = undefined;
    const batch = [...pending].slice(0, 300);
    for (const e of batch) pending.delete(e);
    for (const el of batch) {
      try {
        if (el.isConnected) evaluate(el);
      } catch { /* ignore one bad element */ }
    }
    if (pending.size) flushTimer = window.setTimeout(flush, 50);
  }

  function queue(el: Element): void {
    pending.add(el);
    if (flushTimer === undefined) flushTimer = window.setTimeout(flush, 120);
  }

  function update(list: Blocklist | null): void {
    if (!list || (!list.channels.length && !list.words.length)) {
      if (key) stop();
      return;
    }
    const next = JSON.stringify(list);
    if (next === key) return;
    stop();
    key = next;
    channels = buildMatcher(list.channels);
    words = buildMatcher(list.words);

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `[${ATTR}]{display:none !important}`;
    document.documentElement.appendChild(style);

    observer = new MutationObserver((records) => {
      for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 1) queue(n as Element);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    let i = 0;
    for (const c of document.querySelectorAll(SCOPE)) {
      queue(c);
      if (++i > 500) break;
    }
  }

  return { update };
}
