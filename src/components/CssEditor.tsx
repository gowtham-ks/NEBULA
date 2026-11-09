import { useRef } from 'react';

type Tok = { t: string; s: string };

const TOKEN_RE =
  /(\/\*[\s\S]*?(?:\*\/|$))|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(@[\w-]+)|(#[0-9a-fA-F]{3,8}\b)|((?<![\w#-])-?\d*\.?\d+(?:px|em|rem|%|vh|vw|s|ms|deg)?)|([\w-]+)(?=\s*:)|([{}])/g;

const COLORS: Record<string, string> = {
  c: 'text-neutral-500', s: 'text-emerald-400', a: 'text-purple-400',
  n: 'text-amber-300', p: 'text-sky-300', b: 'text-neutral-400',
};

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let last = 0, depth = 0;
  TOKEN_RE.lastIndex = 0;
  for (let m = TOKEN_RE.exec(src); m; m = TOKEN_RE.exec(src)) {
    if (m.index > last) out.push({ t: '', s: src.slice(last, m.index) });
    const s = m[0];
    let t = '';
    if (m[1]) t = 'c';
    else if (m[2]) t = 's';
    else if (m[3]) t = 'a';
    else if (m[4] || m[5]) t = 'n';
    else if (m[6]) t = depth > 0 ? 'p' : '';
    else { t = 'b'; depth = Math.max(0, depth + (s === '{' ? 1 : -1)); }
    out.push({ t, s });
    last = m.index + s.length;
  }
  if (last < src.length) out.push({ t: '', s: src.slice(last) });
  return out;
}

/** Lightweight highlighter: a transparent textarea over a coloured <pre>. No dependencies. */
export function CssEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const pre = useRef<HTMLPreElement>(null);
  const shared = 'absolute inset-0 m-0 whitespace-pre-wrap break-words p-3 [scrollbar-gutter:stable]';
  return (
    <div className="relative h-80 rounded-card border border-white/15 bg-black/40 font-mono text-[13px] leading-5">
      <pre ref={pre} aria-hidden className={`${shared} pointer-events-none overflow-hidden`}>
        {tokenize(value).map((k, i) => <span key={i} className={COLORS[k.t] ?? 'text-neutral-200'}>{k.s}</span>)}
        {'\n'}
      </pre>
      <textarea
        value={value}
        spellCheck={false}
        aria-label="Custom CSS"
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (pre.current) {
            pre.current.scrollTop = e.currentTarget.scrollTop;
            pre.current.scrollLeft = e.currentTarget.scrollLeft;
          }
        }}
        className={`${shared} h-full w-full resize-none overflow-auto bg-transparent text-transparent caret-white outline-none`}
      />
    </div>
  );
}
