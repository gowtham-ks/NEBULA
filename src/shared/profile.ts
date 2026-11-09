import { MAX_CSS } from './csssafe';
import { SITE_RE } from './schema';

export interface HiddenRule { id: string; selector: string; label: string; enabled: boolean }
export interface SiteProfile {
  enabled: boolean;
  themeId: string | null; // null = follow the global theme
  css: string;
  cssEnabled: boolean;
  rules: HiddenRule[];
}

export const EMPTY_PROFILE: SiteProfile = { enabled: true, themeId: null, css: '', cssEnabled: true, rules: [] };

const ID_RE = /^[\w-]{1,64}$/;
type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (typeof v === 'object' && v !== null ? (v as Obj) : {});

export const newRuleId = () => `r_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** A selector is stored as data and later placed in CSS, so it must not be able to break out of a rule. */
export function selectorOk(s: unknown): s is string {
  return typeof s === 'string' && s.length > 0 && s.length <= 300 && !/[{};<\n\r]|\/\*/.test(s);
}

export function normalizeProfile(raw: unknown): SiteProfile {
  const r = obj(raw);
  const rules: HiddenRule[] = [];
  if (Array.isArray(r.rules)) {
    for (const item of r.rules.slice(0, 200)) {
      const o = obj(item);
      if (!selectorOk(o.selector)) continue;
      rules.push({
        id: typeof o.id === 'string' && ID_RE.test(o.id) ? o.id : newRuleId(),
        selector: o.selector,
        label: typeof o.label === 'string' && o.label ? o.label.slice(0, 80) : o.selector.slice(0, 80),
        enabled: o.enabled !== false,
      });
    }
  }
  return {
    enabled: r.enabled !== false,
    themeId: typeof r.themeId === 'string' && ID_RE.test(r.themeId) ? r.themeId : null,
    css: typeof r.css === 'string' ? r.css.slice(0, MAX_CSS) : '',
    cssEnabled: r.cssEnabled !== false,
    rules,
  };
}

export function normalizeProfiles(raw: unknown): Record<string, SiteProfile> {
  const out: Record<string, SiteProfile> = {};
  for (const [k, v] of Object.entries(obj(raw))) if (SITE_RE.test(k)) out[k] = normalizeProfile(v);
  return out;
}
