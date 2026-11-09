# NEBULA 2.0

Privacy-first website customization for Chrome, Edge, Brave and other Chromium browsers (Manifest V3).
No analytics, no accounts, no tracking. Everything is stored on your device.

## Features
- **Themes:** 13 presets, your own themes, import/export, automatic day/night schedule.
- **Glass, wallpapers, typography:** live preview on your open tabs; built-in wallpaper gallery or your own images.
- **Per-site control:** profiles, theme overrides, custom CSS (validated, live preview), element picker with safeguards.
- **Focus Mode:** YouTube, X, Instagram, Facebook, Reddit (hide distractions, promoted posts, suggestions; 11-language label rules).
- **YouTube extras:** glass layout with greeting banner, YouTube Music styling, channel/word blocklist, optional dislike count, History shortcut.
- **Automation:** daily time limits with a snoozable reminder, keyboard shortcuts, toolbar OFF badge.
- **Backup and restore** of everything.

## Install (developers)
```
npm install
npm run build        # type-check + production build into dist/
npm test             # unit tests
npm run audit        # privacy/security checks
npm run package      # build + audit + release/nebula-<version>.zip (needs the zip command)
```
Load it: `chrome://extensions` -> Developer mode -> **Load unpacked** -> select `dist/`.
After rebuilding, click reload on the NEBULA card and reload open tabs.

## Using it
1. Open a website, click the NEBULA icon, press **Enable on this site** and approve Chrome's prompt. NEBULA touches no site until you do.
2. Pick a theme in the popup, or open the Dashboard to customize. Edits preview live; **Apply** saves.
3. Dashboard > Focus Mode for distraction hiding; Automation for schedules, limits and shortcuts.

## Documentation
[Architecture](docs/ARCHITECTURE.md) · [Development](docs/DEVELOPMENT.md) · [Privacy and permissions](docs/PRIVACY.md) ·
[Security audit](docs/SECURITY_AUDIT.md) · [Performance](docs/PERFORMANCE.md) · [Known limitations](docs/KNOWN_LIMITATIONS.md) ·
[Testing plan](TESTING.md) · [Changelog](CHANGELOG.md) · examples in `examples/`.
