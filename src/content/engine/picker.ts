import { describe, selectorFor } from './selector';

export interface PickerHooks {
  save(selector: string, label: string): Promise<void>;
  undo(): Promise<string | null>;
}

const CSS_TEXT = `
.box{position:fixed;border:2px solid #d71921;background:rgba(215,25,33,.15);pointer-events:none;box-sizing:border-box}
.tip{position:fixed;background:#0a0a0b;color:#fff;font:11px/1.3 ui-monospace,Menlo,monospace;padding:3px 6px;border-radius:4px;pointer-events:none;max-width:60vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.panel{position:fixed;right:16px;bottom:16px;width:320px;max-width:calc(100vw - 32px);background:rgba(10,10,11,.97);color:#e8e8ea;font:13px/1.45 system-ui,sans-serif;border:1px solid rgba(255,255,255,.18);border-radius:10px;padding:12px;pointer-events:auto;box-sizing:border-box}
.panel b{font-weight:600}.panel p{margin:4px 0}.muted{color:#9a9aa0;font-size:12px}
code{display:block;background:#1a1a1d;padding:6px;border-radius:6px;font:11px/1.4 ui-monospace,Menlo,monospace;word-break:break-all;margin:6px 0}
.warn{color:#ffb4b8;font-size:12px}.row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
button{font:inherit;font-size:12px;color:#e8e8ea;background:#1a1a1d;border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:5px 9px;cursor:pointer}
button.primary{background:#d71921;border-color:#d71921;color:#fff}button:disabled{opacity:.4;cursor:default}`;

let stop: (() => void) | null = null;

function risk(el: Element): { block: boolean; warn: string | null } {
  if (el === document.documentElement || el === document.body || el === document.head) return { block: true, warn: 'The page itself cannot be hidden.' };
  const r = el.getBoundingClientRect();
  if ((r.width * r.height) / Math.max(1, innerWidth * innerHeight) > 0.6) return { block: false, warn: 'This element covers most of the page.' };
  if (el.matches('main,[role="main"]')) return { block: false, warn: 'This looks like the main content area.' };
  if (el.matches('form') || el.querySelector('input[type="password"],input[type="search"],[role="search"]')) {
    return { block: false, warn: 'This contains a form or search field.' };
  }
  if (el.matches('nav,[role="navigation"]')) return { block: false, warn: 'This looks like site navigation.' };
  return { block: false, warn: null };
}

export function startPicker(hooks: PickerHooks): void {
  if (stop) return;
  const ac = new AbortController();
  const { signal } = ac;

  const host = document.createElement('div');
  host.id = 'nebula-picker-host';
  host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  const root = host.attachShadow({ mode: 'closed' });
  root.innerHTML = `<style>${CSS_TEXT}</style><div class="box" hidden></div><div class="tip" hidden></div><div class="panel"></div>`;
  const box = root.querySelector('.box') as HTMLDivElement;
  const tip = root.querySelector('.tip') as HTMLDivElement;
  const panel = root.querySelector('.panel') as HTMLDivElement;
  const preview = document.createElement('style');
  preview.id = 'nebula-pick-preview';
  document.documentElement.append(host, preview);

  let selected: Element | null = null;
  let hover: Element | null = null;
  let selector = '';
  let previewOn = false;
  let confirmed = false;
  let notice = '';
  let raf = 0;

  const ignore = (t: EventTarget | null) => t === host;

  function place(el: Element) {
    const r = el.getBoundingClientRect();
    box.hidden = false;
    Object.assign(box.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
    tip.hidden = false;
    tip.textContent = describe(el);
    tip.style.left = `${Math.max(4, Math.min(r.left, innerWidth - 200))}px`;
    tip.style.top = `${r.top > 24 ? r.top - 22 : r.bottom + 4}px`;
  }

  function mk<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string, cls?: string) {
    const e = document.createElement(tag);
    if (text !== undefined) e.textContent = text;
    if (cls) e.className = cls;
    return e;
  }
  function btn(label: string, fn: () => void, cls?: string, disabled = false) {
    const b = mk('button', label, cls);
    b.disabled = disabled;
    b.addEventListener('click', fn, { signal });
    return b;
  }

  function finish() {
    ac.abort();
    cancelAnimationFrame(raf);
    host.remove();
    preview.remove();
    stop = null;
  }
  stop = finish;

  function reselect() {
    selected = null;
    hover = null;
    previewOn = false;
    confirmed = false;
    preview.textContent = '';
    box.hidden = true;
    tip.hidden = true;
    draw();
  }

  function choose(el: Element) {
    selected = el;
    selector = selectorFor(el);
    previewOn = false;
    confirmed = false;
    preview.textContent = '';
    place(el);
    draw();
  }

  async function undo() {
    const label = await hooks.undo();
    notice = label ? `Removed rule: ${label}` : 'No rules to undo.';
    draw();
  }

  function draw() {
    const kids: Node[] = [];
    if (!selected) {
      kids.push(mk('b', 'Pick an element to hide'));
      kids.push(mk('p', 'Hover to highlight, click to select. Press Esc to cancel.', 'muted'));
      if (notice) kids.push(mk('p', notice, 'muted'));
      const row = mk('div', undefined, 'row');
      row.append(btn('Undo last rule', () => void undo()), btn('Cancel', finish));
      kids.push(row);
    } else {
      const { block, warn } = risk(selected);
      let count = 0;
      try { count = document.querySelectorAll(selector).length; } catch { count = 0; }
      kids.push(mk('b', describe(selected)));
      kids.push(mk('code', selector));
      kids.push(mk('p', `Matches ${count} element${count === 1 ? '' : 's'} on this page.`, 'muted'));
      if (warn) kids.push(mk('p', warn, 'warn'));
      const row = mk('div', undefined, 'row');
      row.append(
        btn(previewOn ? 'Show again' : 'Preview hide', () => {
          previewOn = !previewOn;
          preview.textContent = previewOn ? `${selector}{display:none !important}` : '';
          draw();
        }, undefined, block),
        btn('Parent', () => {
          const p = selected?.parentElement;
          if (p && p !== document.body && p !== document.documentElement) choose(p);
        }),
        btn('Reselect', reselect),
      );
      const row2 = mk('div', undefined, 'row');
      row2.append(
        btn(warn && !confirmed ? 'Hide anyway…' : 'Hide and save', () => {
          if (warn && !confirmed) { confirmed = true; draw(); return; }
          void hooks.save(selector, describe(selected!)).then(finish);
        }, 'primary', block),
        btn('Cancel', finish),
      );
      if (warn && confirmed) kids.push(mk('p', 'Press again to confirm.', 'warn'));
      kids.push(row, row2);
    }
    panel.replaceChildren(...kids);
  }

  const block = (e: Event) => {
    if (ignore(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  };
  for (const t of ['mousedown', 'mouseup', 'pointerdown', 'pointerup', 'auxclick', 'contextmenu', 'dblclick']) {
    document.addEventListener(t, block, { capture: true, signal });
  }
  document.addEventListener('click', (e) => {
    if (ignore(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (!selected && e.target instanceof Element) choose(e.target);
  }, { capture: true, signal });
  document.addEventListener('mousemove', (e) => {
    if (selected || ignore(e.target) || !(e.target instanceof Element) || e.target === hover) return;
    const el = e.target;
    hover = el;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => place(el));
  }, { capture: true, signal });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); finish(); }
  }, { capture: true, signal });
  const reposition = () => { const el = selected ?? hover; if (el) place(el); };
  window.addEventListener('scroll', reposition, { capture: true, passive: true, signal });
  window.addEventListener('resize', reposition, { signal });

  draw();
}
