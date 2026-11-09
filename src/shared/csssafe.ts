export const MAX_CSS = 100_000;

// Custom CSS may never load remote resources or carry script-like constructs.
const BLOCKED: [RegExp, string][] = [
  [/@import/i, '@import is not allowed (it loads remote CSS).'],
  [/url\(\s*(?!["']?data:image\/)/i, 'url() may only reference data:image/ URLs (no network requests).'],
  [/image-set\s*\(|\bsrc\s*\(|cross-fade\s*\(/i, 'image-set(), src() and cross-fade() are not allowed.'],
  [/expression\s*\(|javascript:|vbscript:|-moz-binding|behavior\s*:/i, 'Script-like constructs are not allowed.'],
  [/<\s*\/?\s*(style|script)/i, 'HTML tags are not allowed in CSS.'],
];

function unescapeCss(s: string): string {
  return s
    .replace(/\\([0-9a-fA-F]{1,6})\s?/g, (_, h: string) => {
      const cp = parseInt(h, 16);
      return cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : '';
    })
    .replace(/\\([\s\S])/g, '$1');
}

/** Returns a list of problems; an empty list means the CSS is safe to inject. */
export function validateCss(css: string): string[] {
  const errors: string[] = [];
  if (css.length > MAX_CSS) errors.push(`CSS is larger than ${MAX_CSS / 1000} KB.`);

  const stripped = unescapeCss(css.replace(/\/\*[\s\S]*?\*\//g, ''));
  for (const [re, msg] of BLOCKED) if (re.test(stripped)) errors.push(msg);

  let brace = 0, paren = 0, quote = '';
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = '';
      else if (c === '\n') { errors.push('Unterminated string.'); quote = ''; }
    } else if (c === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      if (end === -1) { errors.push('Unterminated comment.'); break; }
      i = end + 1;
    } else if (c === '"' || c === "'") quote = c;
    else if (c === '\\') i++;
    else if (c === '{') brace++;
    else if (c === '}') { brace--; if (brace < 0) { errors.push('Unexpected "}".'); brace = 0; } }
    else if (c === '(') paren++;
    else if (c === ')') { paren--; if (paren < 0) { errors.push('Unexpected ")".'); paren = 0; } }
  }
  if (quote) errors.push('Unterminated string.');
  if (brace > 0) errors.push('Missing "}".');
  if (paren > 0) errors.push('Missing ")".');
  return [...new Set(errors)];
}
