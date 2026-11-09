// Robust selector generation: prefer stable attributes, avoid generated class names.
const esc = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

const stableId = (id: string) =>
  id.length < 40 && !/\d{4,}/.test(id) && !/^[a-f0-9-]{16,}$/i.test(id) && !id.includes(':') && !/^(react|radix)/i.test(id);

function stableClass(c: string): boolean {
  if (c.length < 3 || c.length > 40) return false;
  if (/\d{3,}/.test(c) || /^(css|sc|jsx|styled|emotion)-/i.test(c) || c.startsWith('_')) return false;
  return !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/.test(c);
}

function isUnique(sel: string): boolean {
  try {
    return document.querySelectorAll(sel).length === 1;
  } catch {
    return false;
  }
}

function nthOfType(el: Element): number {
  let n = 1;
  for (let s = el.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === el.tagName) n++;
  return n;
}

function simple(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (el.id && stableId(el.id)) return `#${CSS.escape(el.id)}`;
  for (const attr of ['data-testid', 'data-test-id', 'data-test', 'aria-label', 'role']) {
    const v = el.getAttribute(attr);
    if (v && v.length < 60) return `${tag}[${attr}="${esc(v)}"]`;
  }
  const classes = [...el.classList].filter(stableClass).slice(0, 2);
  if (classes.length) return `${tag}.${classes.map((c) => CSS.escape(c)).join('.')}`;
  return `${tag}:nth-of-type(${nthOfType(el)})`;
}

export function selectorFor(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== document.documentElement && parts.length < 6) {
    parts.unshift(simple(cur));
    const sel = parts.join(' > ');
    if (isUnique(sel)) return sel;
    cur = cur.parentElement;
  }
  // Fallback: a full structural path is unique by construction.
  const path: string[] = [];
  for (let n: Element | null = el; n && n !== document.documentElement && path.length < 14; n = n.parentElement) {
    path.unshift(`${n.tagName.toLowerCase()}:nth-of-type(${nthOfType(n)})`);
  }
  return path.join(' > ');
}

export function describe(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id && stableId(el.id) ? `#${el.id}` : '';
  const cls = [...el.classList].filter(stableClass).slice(0, 2).map((c) => `.${c}`).join('');
  return `${tag}${id}${cls}`.slice(0, 80);
}
