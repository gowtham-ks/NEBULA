/** Hide an element when a short label (exact, case-insensitive) appears inside a scoped container. */
export interface TextMark {
  scope: string; // containers to inspect
  texts: string[]; // lower-case exact label texts
  hide?: string; // hide this ancestor of the label instead of the container
}

export interface AdapterRuntime {
  /** feature id -> selectors hidden with display:none (one CSS rule each, so a bad selector only loses itself). */
  css: Record<string, string[]>;
  marks?: Record<string, TextMark[]>;
  /** feature id -> best-effort action; returns true when finished (retried briefly otherwise). */
  actions?: Record<string, () => boolean>;
  /** feature id -> cheap function run every 500 ms (visible tab only) while the feature is on. */
  ticks?: Record<string, () => void>;
  /** Expose the first URL path segment as html[data-nebula-path] for path-scoped CSS. */
  pathAttr?: boolean;
}
