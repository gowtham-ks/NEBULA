import { describe, expect, it } from 'vitest';
import { LABELS } from '../src/shared/labels';

describe('LABELS', () => {
  it('are lower-case, trimmed and non-empty', () => {
    for (const list of Object.values(LABELS)) {
      for (const t of list) {
        expect(t === t.trim().toLowerCase() && t.length > 0).toBe(true);
      }
    }
  });
  it('cover several languages', () => {
    expect(LABELS.sponsored.length > 10).toBe(true);
    expect(LABELS.suggestedForYou.includes('suggested for you')).toBe(true);
    expect(LABELS.suggestedForYou.includes('vorschläge für dich')).toBe(true);
  });
});
