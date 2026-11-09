import { ADAPTER_IDS } from './focus';

// v2 adds: schedule, limits, onboarded. Older data is upgraded by normalizeSettings (missing fields get defaults).
export const SCHEMA_VERSION = 2;

export interface Schedule {
  enabled: boolean;
  mode: 'time' | 'system';
  dayThemeId: string;
  nightThemeId: string;
  dayStart: number; // minutes after midnight
  nightStart: number;
}

export interface Settings {
  schemaVersion: number;
  enabled: boolean;
  focusMode: boolean;
  activeThemeId: string;
  /** Origin patterns (https://example.com/*) where the user enabled NEBULA. */
  sites: string[];
  schedule: Schedule;
  /** Daily time limit in minutes per supported site (0 = off). */
  limits: Record<string, number>;
  onboarded: boolean;
}

export const DEFAULT_SCHEDULE: Schedule = {
  enabled: false,
  mode: 'time',
  dayThemeId: 'minimal-light',
  nightThemeId: 'nothing-dark',
  dayStart: 7 * 60,
  nightStart: 19 * 60,
};

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: SCHEMA_VERSION,
  enabled: true,
  focusMode: false,
  activeThemeId: 'nothing-dark',
  sites: [],
  schedule: DEFAULT_SCHEDULE,
  limits: {},
  onboarded: false,
};

export const SITE_RE = /^https?:\/\/[^/*\s]+\/\*$/;
const ID_RE = /^[\w-]{1,64}$/;
type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (typeof v === 'object' && v !== null ? (v as Obj) : {});
const minutes = (v: unknown, fb: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(1439, Math.max(0, Math.round(v))) : fb;

/** Coerce unknown stored data into valid Settings; tolerates missing, old or corrupt values. */
export function normalizeSettings(raw: unknown): Settings {
  const r = obj(raw);
  const sc = obj(r.schedule);
  const lim = obj(r.limits);
  const limits: Record<string, number> = {};
  for (const id of ADAPTER_IDS) {
    const v = lim[id];
    limits[id] = typeof v === 'number' && Number.isFinite(v) ? Math.min(600, Math.max(0, Math.round(v))) : 0;
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    enabled: typeof r.enabled === 'boolean' ? r.enabled : DEFAULT_SETTINGS.enabled,
    focusMode: typeof r.focusMode === 'boolean' ? r.focusMode : DEFAULT_SETTINGS.focusMode,
    activeThemeId: typeof r.activeThemeId === 'string' && ID_RE.test(r.activeThemeId) ? r.activeThemeId : DEFAULT_SETTINGS.activeThemeId,
    sites: Array.isArray(r.sites)
      ? r.sites.filter((s): s is string => typeof s === 'string' && SITE_RE.test(s)).slice(0, 500)
      : [],
    schedule: {
      enabled: sc.enabled === true,
      mode: sc.mode === 'system' ? 'system' : 'time',
      dayThemeId: typeof sc.dayThemeId === 'string' && ID_RE.test(sc.dayThemeId) ? sc.dayThemeId : DEFAULT_SCHEDULE.dayThemeId,
      nightThemeId: typeof sc.nightThemeId === 'string' && ID_RE.test(sc.nightThemeId) ? sc.nightThemeId : DEFAULT_SCHEDULE.nightThemeId,
      dayStart: minutes(sc.dayStart, DEFAULT_SCHEDULE.dayStart),
      nightStart: minutes(sc.nightStart, DEFAULT_SCHEDULE.nightStart),
    },
    limits,
    onboarded: r.onboarded === true,
  };
}
