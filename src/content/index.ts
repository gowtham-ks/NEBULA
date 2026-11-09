import { validateCss } from '../shared/csssafe';
import { normalizeBlocklist } from '../shared/blocklist';
import { normalizeYtLayout } from '../shared/ytlayout';
import { adapterForHost, normalizeFocus } from '../shared/focus';
import { KEYS, wpKey } from '../shared/keys';
import { EMPTY_PROFILE, newRuleId, normalizeProfiles, selectorOk, type SiteProfile } from '../shared/profile';
import { normalizeSettings } from '../shared/schema';
import { pickThemeId } from '../shared/schedule';
import { normalizeTheme, normalizeThemes, resolveTheme } from '../shared/theme';
import { startPicker } from './engine/picker';
import { adapterCss } from './adapters';
import { createBlockEngine } from './engine/block';
import { createFocusEngine } from './engine/focus';
import { createLimitsEngine } from './engine/limits';
import { createYtLayoutEngine } from './engine/ytlayout';
import { remove, render, renderSite, renderUser } from './engine/render';

declare global {
  interface Window { __nebulaLoaded?: boolean }
}

const DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const PREVIEW_TTL = 90_000;

(function main() {
  if (window.__nebulaLoaded) return; // guard against double injection
  window.__nebulaLoaded = true;

  const pattern = `${location.protocol}//${location.hostname}/*`;
  let timer: number | undefined;
  let previewTimer: number | undefined;
  let scheduleTimer: number | undefined;
  let wpCache: { id: string; url: string } | null = null;
  const focus = createFocusEngine();
  const block = createBlockEngine();
  const ytLayout = createYtLayoutEngine();
  const limits = createLimitsEngine();
  const prefersDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

  const validSelector = (s: string) => {
    if (!selectorOk(s)) return false;
    try { document.querySelector(s); return true; } catch { return false; }
  };

  async function loadWallpaper(id: string): Promise<string | null> {
    if (wpCache?.id === id) return wpCache.url;
    const r = await chrome.storage.local.get(wpKey(id));
    const v = r[wpKey(id)];
    if (typeof v === 'string' && DATA_URL.test(v)) {
      wpCache = { id, url: v };
      return v;
    }
    return null;
  }

  const fresh = (ts: unknown) => typeof ts === 'number' && Date.now() - ts < PREVIEW_TTL;

  async function apply(): Promise<void> {
    try {
      const res = await chrome.storage.local.get([KEYS.settings, KEYS.themes, KEYS.preview, KEYS.profiles, KEYS.cssPreview, KEYS.focus, KEYS.blocklist, KEYS.ytLayout]);
      const settings = normalizeSettings(res[KEYS.settings]);
      const profile = normalizeProfiles(res[KEYS.profiles])[pattern] ?? EMPTY_PROFILE;
      if (!settings.enabled || !settings.sites.includes(pattern) || !profile.enabled) {
        focus.update(null, null);
        block.update(null);
        ytLayout.update(null);
        limits.update(null, 0);
        remove();
        return;
      }
      const custom = normalizeThemes(res[KEYS.themes]);

      const tp = res[KEYS.preview] as { theme?: unknown; ts?: unknown } | undefined;
      const themePreview = !!tp && fresh(tp.ts) && !profile.themeId;
      const theme = profile.themeId
        ? resolveTheme(profile.themeId, custom)
        : themePreview ? normalizeTheme(tp!.theme) : resolveTheme(pickThemeId(settings, new Date(), prefersDark()), custom);

      const cp = res[KEYS.cssPreview] as { pattern?: unknown; css?: unknown; ts?: unknown } | undefined;
      const cssPreview = !!cp && cp.pattern === pattern && typeof cp.css === 'string' && fresh(cp.ts);
      const css = cssPreview ? (cp!.css as string) : profile.cssEnabled ? profile.css : '';
      const safeCss = css && validateCss(css).length === 0 ? css : '';
      const hidden = profile.rules.filter((r) => r.enabled && validSelector(r.selector)).map((r) => r.selector);

      const wp = theme.wallpaper.assetId ? await loadWallpaper(theme.wallpaper.assetId) : null;
      render(theme, wp);
      renderSite(adapterCss(location.hostname, theme, wp !== null));
      renderUser(safeCss, hidden);

      const adapterId = adapterForHost(location.hostname);
      focus.update(
        settings.focusMode && adapterId ? adapterId : null,
        adapterId ? normalizeFocus(res[KEYS.focus])[adapterId] : null,
      );
      limits.update(adapterId, adapterId ? settings.limits[adapterId] ?? 0 : 0);
      block.update(adapterId === 'youtube' ? normalizeBlocklist(res[KEYS.blocklist]) : null);
      const surface = location.hostname === 'music.youtube.com' ? 'music' : adapterId === 'youtube' ? 'youtube' : null;
      ytLayout.update(surface ? { layout: normalizeYtLayout(res[KEYS.ytLayout]), theme, surface } : null);

      // Re-check every minute only while an automatic schedule is active.
      if (settings.schedule.enabled && !profile.themeId) {
        if (scheduleTimer === undefined) scheduleTimer = window.setInterval(schedule, 60_000);
      } else if (scheduleTimer !== undefined) {
        window.clearInterval(scheduleTimer);
        scheduleTimer = undefined;
      }

      window.clearTimeout(previewTimer);
      if (themePreview || cssPreview) previewTimer = window.setTimeout(schedule, PREVIEW_TTL + 5_000); // drop stale previews
    } catch {
      // Extension was reloaded or updated; this orphaned script can no longer reach storage.
      if (!chrome.runtime?.id) {
        focus.update(null, null);
        block.update(null);
        ytLayout.update(null);
        limits.update(null, 0);
      }
    }
  }

  function schedule(): void {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => void apply(), 40);
  }

  async function mutateProfile(fn: (p: SiteProfile) => SiteProfile): Promise<void> {
    const r = await chrome.storage.local.get(KEYS.profiles);
    const all = normalizeProfiles(r[KEYS.profiles]);
    all[pattern] = fn(all[pattern] ?? EMPTY_PROFILE);
    await chrome.storage.local.set({ [KEYS.profiles]: all });
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (wpCache && changes[wpKey(wpCache.id)]) wpCache = null;
    if (Object.keys(changes).some((k) => k.startsWith('nebula:'))) schedule();
  });

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg?.type === 'nebula:pick') {
      startPicker({
        async save(selector, label) {
          await mutateProfile((p) =>
            p.rules.length >= 200 || p.rules.some((r) => r.selector === selector)
              ? p
              : { ...p, rules: [...p.rules, { id: newRuleId(), selector, label, enabled: true }] },
          );
        },
        async undo() {
          let removed: string | null = null;
          await mutateProfile((p) => {
            const last = p.rules[p.rules.length - 1];
            removed = last?.label ?? null;
            return { ...p, rules: p.rules.slice(0, -1) };
          });
          return removed;
        },
      });
      sendResponse({ ok: true });
    }
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', schedule);
  schedule();
})();
