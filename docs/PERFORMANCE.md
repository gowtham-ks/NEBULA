# Performance notes

Design choices, not measured benchmarks: no profiling was done in real browsers for this release.

- One `<style>` per concern, updated only when its text changes (no duplicate injection; double-injection guard).
- Hiding is CSS-only; dynamic page changes need no scripting.
- Only one MutationObserver, only when a text-label rule is active, added nodes only, batched (120 ms), capped (300 elements per batch,
  12 evaluations per element), disconnected on disable.
- Storage changes are debounced (40 ms). Wallpaper data is read once and cached by id.
- Navigation detection is a 1 s string comparison, only on supported sites with Focus Mode on.
- Wallpapers are downscaled to 1920 px JPEG before storage.
- Glass uses `backdrop-filter`, which can be costly on pages with many large overlapping elements: use lower blur there or turn glass off.
- Listeners and timers are removed when features are turned off or when the extension is reloaded.
