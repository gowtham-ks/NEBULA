import { ADAPTER_RUNTIMES } from '../adapters';
import type { TextMark } from '../adapters/types';
import type { AdapterId } from '../../shared/focus';

const STYLE_ID = 'nebula-focus';
const MARK = 'data-nebula-hide';
const PATH_ATTR = 'data-nebula-path';
type Action = () => boolean;
const MAX_EVALS = 12; // per element, so progressive rendering is handled but work stays bounded

/**
 * Focus Mode engine. Selector-based hiding is pure CSS (handles dynamic content for free).
 * A MutationObserver exists only for text-label rules, only sees ADDED nodes, and works in batches.
 */
export function createFocusEngine() {
  let key = '';
  let observer: MutationObserver | null = null;
  let urlTimer: number | undefined;
  let tickTimer: number | undefined;
  let flushTimer: number | undefined;
  let actionToken = 0;
  let marks: TextMark[] = [];
  const pending = new Set<Element>();
  const evals = new WeakMap<Element, number>();

  function stop(): void {
    observer?.disconnect();
    observer = null;
    window.clearInterval(urlTimer);
    window.clearInterval(tickTimer);
    window.clearTimeout(flushTimer);
    flushTimer = undefined;
    actionToken++;
    pending.clear();
    marks = [];
    key = '';
    document.getElementById(STYLE_ID)?.remove();
    document.documentElement?.removeAttribute(PATH_ATTR);
    document.querySelectorAll(`[${MARK}]`).forEach((e) => e.removeAttribute(MARK));
  }

  function findLabel(c: Element, texts: string[]): Element | null {
    let n = 0;
    for (const leaf of c.querySelectorAll('span,h2,h3,h4,div,a')) {
      if (++n > 400) return null;
      if (leaf.childElementCount !== 0) continue;
      const t = (leaf.textContent ?? '').trim().toLowerCase();
      if (t.length > 0 && t.length <= 60 && texts.includes(t)) return leaf;
    }
    return null;
  }

  function evaluate(el: Element): void {
    for (const m of marks) {
      const cands = new Set<Element>();
      const own = el.closest(m.scope);
      if (own) cands.add(own);
      let i = 0;
      for (const c of el.querySelectorAll(m.scope)) {
        cands.add(c);
        if (++i > 100) break;
      }
      for (const c of cands) {
        if (c.hasAttribute(MARK)) continue;
        const count = evals.get(c) ?? 0;
        if (count >= MAX_EVALS) continue;
        evals.set(c, count + 1);
        const leaf = findLabel(c, m.texts);
        if (leaf) (m.hide ? leaf.closest(m.hide) ?? c : c).setAttribute(MARK, '1');
      }
    }
  }

  function flush(): void {
    flushTimer = undefined;
    const batch = [...pending].slice(0, 300);
    for (const e of batch) pending.delete(e);
    for (const el of batch) {
      try {
        if (el.isConnected) evaluate(el);
      } catch { /* one bad element must not stop the batch */ }
    }
    if (pending.size) flushTimer = window.setTimeout(flush, 50);
  }

  function queue(el: Element): void {
    pending.add(el);
    if (flushTimer === undefined) flushTimer = window.setTimeout(flush, 120);
  }

  function runActions(actions: Action[]): void {
    const token = ++actionToken;
    for (const fn of actions) {
      let tries = 0;
      const tick = () => {
        if (token !== actionToken) return;
        let done = false;
        try { done = fn(); } catch { done = true; }
        if (!done && ++tries < 10) window.setTimeout(tick, 500);
      };
      tick();
    }
  }

  function update(id: AdapterId | null, cfg: Record<string, boolean> | null): void {
    const on = cfg ? Object.keys(cfg).filter((k) => cfg[k]) : [];
    if (!id || !on.length) {
      if (key) stop();
      return;
    }
    const next = `${id}:${on.sort().join(',')}`;
    if (next === key) return;
    stop();
    key = next;

    const rt = ADAPTER_RUNTIMES[id];
    const rules: string[] = [];
    for (const f of on) for (const sel of rt.css[f] ?? []) rules.push(`${sel}{display:none !important}`);
    marks = on.flatMap((f) => rt.marks?.[f] ?? []);
    if (marks.length) rules.push(`[${MARK}]{display:none !important}`);

    if (rules.length) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = rules.join('\n');
      document.documentElement.appendChild(style);
    }

    if (marks.length) {
      observer = new MutationObserver((records) => {
        for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 1) queue(n as Element);
      });
      observer.observe(document.documentElement, { childList: true, subtree: true });
      for (const m of marks) {
        let i = 0;
        for (const c of document.querySelectorAll(m.scope)) {
          queue(c);
          if (++i > 300) break;
        }
      }
    }

    const actions: Action[] = [];
    for (const f of on) {
      const a = rt.actions?.[f];
      if (a) actions.push(a);
    }
    const ticks: (() => void)[] = [];
    for (const f of on) {
      const t = rt.ticks?.[f];
      if (t) ticks.push(t);
    }
    if (ticks.length) {
      tickTimer = window.setInterval(() => {
        if (document.hidden) return;
        for (const t of ticks) {
          try { t(); } catch { /* a failing tick must not stop the others */ }
        }
      }, 500);
    }

    if (actions.length || rt.pathAttr) {
      let lastUrl = '';
      const tick = () => {
        if (location.href === lastUrl) return;
        lastUrl = location.href;
        if (rt.pathAttr) document.documentElement.setAttribute(PATH_ATTR, (location.pathname.split('/')[1] ?? '').slice(0, 40));
        if (actions.length) runActions(actions);
      };
      tick();
      urlTimer = window.setInterval(tick, 1000); // cheap SPA navigation detection
    }
  }

  return { update };
}
