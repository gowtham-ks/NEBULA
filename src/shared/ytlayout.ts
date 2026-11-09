export interface YtLayout {
  enabled: boolean; // glass, rounded floating panels
  cards: boolean; // glass on video cards (costs more GPU)
  greeting: boolean; // "Good evening, <name>" banner on the home page
  name: string;
  hero: number; // vh of open space above the home grid
}

export const DEFAULT_YT_LAYOUT: YtLayout = { enabled: false, cards: true, greeting: true, name: '', hero: 32 };

export function normalizeYtLayout(raw: unknown): YtLayout {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const hero = typeof r.hero === 'number' && Number.isFinite(r.hero) ? r.hero : DEFAULT_YT_LAYOUT.hero;
  return {
    enabled: r.enabled === true,
    cards: r.cards !== false,
    greeting: r.greeting !== false,
    // eslint-disable-next-line no-control-regex
    name: typeof r.name === 'string' ? r.name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 30) : '',
    hero: Math.min(60, Math.max(0, Math.round(hero))),
  };
}
