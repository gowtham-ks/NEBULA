# Development guide

- `npm run dev` rebuilds popup/dashboard/worker on change (reload the extension manually). The content script is built by
  `npm run build` (`vite build -c vite.content.config.ts`).
- Lint: `npm run lint`. Format: `npm run format`. Tests: `npm test`. Audit: `npm run audit`.

## Adding or fixing a Focus Mode rule
1. Add the feature id and label in `src/shared/focus.ts`.
2. Add selectors in `src/content/adapters/<site>/focus.ts` (`css`), text-label rules (`marks`) or a best-effort `action`.
3. Check on the live site with DevTools: `document.querySelectorAll('<selector>')`.
Selectors are separate CSS rules, so a selector that matches nothing (or is unsupported) is harmless.

## Adding a new site adapter
Create `src/content/adapters/<site>/focus.ts`, register it in `adapters/index.ts`, and add it to `FOCUS_ADAPTERS`.

## Theme file format
`{ "format": "nebula-theme", "formatVersion": 1, "themes": [Theme], "assets": { "<id>": "data:image/..." } }`.
Themes are validated by `normalizeTheme`; versioned for a future theme marketplace. Imports are data only.

## Schema changes
Bump `SCHEMA_VERSION` in `src/shared/schema.ts` and migrate inside the relevant `normalize*` function.
