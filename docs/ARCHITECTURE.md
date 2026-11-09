# Architecture

```
src/
  popup/ dashboard/ components/   React UI (popup, dashboard, shared controls)
  shared/                         Pure logic used by UI and content script: schema, theme, css builder,
                                  css validator, profiles, focus definitions, storage keys
  storage/                        chrome.storage wrappers and React hooks
  modules/                        site activation (permissions), theme import/export, wallpapers, maintenance
  content/
    index.ts                      content script entry: reads storage, applies everything, listens for changes
    engine/                       render (style injection), picker, selector generator, focus engine
    adapters/<site>/              per-site theme CSS (YouTube) and Focus Mode rules
  background/                     service worker: seeds defaults, clears stale previews
```

## Build
Two Vite builds: `vite.config.ts` (popup, dashboard, service worker as ES modules) and
`vite.content.config.ts` (content script as a single IIFE, because MV3 content scripts cannot be modules).

## Data flow
1. UI writes validated data to `chrome.storage.local` (`nebula:*` keys).
2. The content script listens to `storage.onChanged`, debounces, and re-renders: one `<style>` for the theme,
   one for site-adapter CSS, one for user CSS and hidden-element rules, one wallpaper `<div>`, one Focus style.
3. Live preview: the dashboard writes a short-lived `nebula:preview` / `nebula:csspreview` entry (90 s TTL,
   refreshed while editing, cleared on cancel/close/startup).

## Storage
| Key | Content |
|---|---|
| `nebula:settings` | master switch, Focus master switch, active theme, enabled site patterns, schema version |
| `nebula:themes` | custom themes |
| `nebula:profiles` | per-site: enabled, theme override, CSS, hidden-element rules |
| `nebula:focus` | Focus Mode feature switches per site |
| `nebula:wallpapers`, `nebula:wp:<id>` | wallpaper index and image data (downscaled JPEG data URLs) |

Everything is read through `normalize*` functions that clamp, filter and default, so missing, corrupt or
tampered data cannot crash the extension. `chrome.storage.sync` is deliberately not used: it would copy
data to the user's Google account. IndexedDB was not needed: wallpapers are capped at 1920 px, about 2.5 MB each,
12 maximum, inside the ~10 MB local quota, and content scripts can read `chrome.storage` directly.
Quota errors surface as readable messages.

## Per-site activation
Host access is `optional_host_permissions`. Clicking "Enable on this site" requests that one origin, registers a
content script for it with `chrome.scripting.registerContentScripts` and injects it into the open tab.

## Focus Mode
Selector hiding is pure CSS, so dynamically loaded content needs no DOM scanning. A single MutationObserver is
used only for text-label rules (e.g. "Suggested for you"); it watches added nodes only, batches work in 120 ms
windows, caps evaluations per element, and is disconnected when Focus Mode is off. SPA navigation is detected
with a 1 s URL comparison. Each adapter is one small file.

## Firefox (future)
Needs `browser_specific_settings`, a `background.scripts` entry instead of `service_worker`, and a check of
`registerContentScripts`/optional host permission behaviour. No Firefox build exists yet.

## 1.1 additions
- `nebula:blocklist`: YouTube channel and word lists, applied by `content/engine/block.ts` (same batched, added-nodes-only pattern as Focus text rules).
- Adapter `ticks`: cheap 500 ms checks (visible tab only) used for skipping skippable YouTube ads and showing the dislike count.
- `shared/labels.ts`: translated interface labels shared by label-based rules.
- `background/dislikes.ts`: the only network code, gated by an optional host permission.
- `nebula:ytlayout`: YouTube glass layout options; `content/engine/ytlayout.ts` applies `adapters/youtube/layout.ts` CSS and keeps the greeting element in place with a 500 ms visible-tab check.

## 2.0 additions
- `shared/schema.ts` is schema v2 (schedule, limits, onboarded); older data upgrades through `normalizeSettings`.
- `shared/schedule.ts` picks the theme by time or system preference; the content script re-checks once a minute only while a schedule is on.
- `content/engine/limits.ts` counts focused-tab minutes for sites with a limit and shows a shadow-DOM reminder (`nebula:usage`, per day).
- `background/index.ts` handles keyboard commands, the OFF badge and the first-run welcome page.
- `modules/backup.ts` + `shared/backup.ts` export/restore everything; imports are validated like live storage, restore writes first and removes stale keys after.
- `modules/wallpapers/gallery.ts` bundles four generated wallpapers, loaded through `<img>` (no network).
