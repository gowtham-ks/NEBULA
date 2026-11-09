// Shows the dislike count next to the dislike button. Opt-in: the background worker only fetches
// when the user granted permission for the third-party service. Only the video id leaves the browser.
const counts = new Map<string, number>();
const inflight = new Set<string>();
const failedAt = new Map<string, number>();
const fmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

function show(btn: Element, n: number): void {
  let el = btn.querySelector<HTMLElement>('.nebula-dislike');
  const text = fmt.format(n);
  if (!el) {
    el = document.createElement('span');
    el.className = 'nebula-dislike';
    el.style.cssText = 'margin-left:6px;font-size:14px';
    btn.appendChild(el);
  }
  if (el.textContent !== text) el.textContent = text;
}

export function dislikeTick(): void {
  if (location.pathname !== '/watch') return;
  const id = new URLSearchParams(location.search).get('v');
  if (!id || !/^[\w-]{11}$/.test(id)) return;
  const btn = document.querySelector('dislike-button-view-model button');
  if (!btn) return;
  const known = counts.get(id);
  if (known !== undefined) return show(btn, known);
  if (inflight.has(id) || Date.now() - (failedAt.get(id) ?? 0) < 60_000) return;
  inflight.add(id);
  chrome.runtime
    .sendMessage({ type: 'nebula:dislikes', videoId: id })
    .then((r: { dislikes?: unknown } | undefined) => {
      if (r && typeof r.dislikes === 'number') counts.set(id, r.dislikes);
      else failedAt.set(id, Date.now());
    })
    .catch(() => failedAt.set(id, Date.now()))
    .finally(() => inflight.delete(id));
}
