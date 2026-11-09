export interface Blocklist { channels: string[]; words: string[] }

const MAX_ITEMS = 200;
const MAX_LEN = 60;

function clean(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    if (typeof x !== 'string') continue;
    const t = x.trim().replace(/\s+/g, ' ').slice(0, MAX_LEN);
    if (t && !out.some((o) => o.toLowerCase() === t.toLowerCase())) out.push(t);
    if (out.length >= MAX_ITEMS) break;
  }
  return out;
}

export function normalizeBlocklist(raw: unknown): Blocklist {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  return { channels: clean(r.channels), words: clean(r.words) };
}

/** Whole-word, case-insensitive matcher (Unicode aware). Returns null for an empty list. */
export function buildMatcher(terms: string[]): RegExp | null {
  if (!terms.length) return null;
  const alt = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${alt})(?![\\p{L}\\p{N}])`, 'iu');
}
