# Security audit (self-review, version 1.0.0)

This is a self-review by the developer, not an independent audit.

## Checked
- **Permissions:** minimal set; no install-time host access; no static content scripts; no `web_accessible_resources`;
  strict extension-page CSP. Enforced by `scripts/audit.mjs`.
- **No network or dynamic code in source** (single exception: the opt-in dislike lookup in `src/background/dislikes.ts`, restricted to one host, a validated 11-character video id, and a numeric response; the audit script enforces this): no `fetch`, `XMLHttpRequest`, `WebSocket`, `eval`, `new Function`,
  `document.write`, `dangerouslySetInnerHTML`. `innerHTML` is used once, in the element picker, with a static template.
- **CSS injection:** theme values are clamped numbers, `#rrggbb` colours, enums or font strings limited to `[\w\s,'"-]`.
  Hidden-element selectors may not contain `{ } ; < /*` or newlines and must parse with `querySelector`.
- **Custom CSS:** blocks `@import`, remote `url()`, `image-set()`, `src()`, `expression()`, script-like constructs and
  CSS-escape tricks (`\75rl(`); checks brace/quote balance; 100 KB limit. It is validated again in the content script.
  CSS cannot execute JavaScript.
- **Imports:** theme files are parsed as JSON, every field validated and clamped, wallpapers must be real image data URLs
  under 2.5 MB, ids are regenerated. Never executed.
- **Picker:** UI lives in a closed shadow root; page-derived text is written with `textContent`.
- **Messaging:** the only message (`nebula:pick`) comes from the popup and triggers a UI, not data access.
- **Unit tests** cover the validators (`npm test`).

## Not done / residual risk
- No third-party penetration test, no fuzzing, no automated dependency audit in CI. Run `npm audit` before releases;
  known findings so far are in build-time tooling only.
- The content script runs in an isolated world but shares the DOM with the page; a hostile page can read what NEBULA
  writes into the DOM (styles, picker preview) and can observe its elements.
- Wallpapers and themes are stored unencrypted in extension storage (normal for extensions).
- Text-label Focus rules read text of elements on the sites you enabled; the text is not stored or sent anywhere.
