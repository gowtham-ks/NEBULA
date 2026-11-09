import { FOCUS_ADAPTERS, type AdapterId } from '../../shared/focus';
import { KEYS } from '../../shared/keys';
import { normalizeUsage, todayKey } from '../../shared/usage';

const TICK_S = 15;
const SNOOZE_MS = 5 * 60_000;

const CSS = `
.wrap{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(8,4,12,.82);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.card{width:min(420px,calc(100vw - 32px));background:rgba(20,16,24,.92);border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:24px;color:#f2eef5;font:14px/1.5 system-ui,sans-serif;text-align:center;box-sizing:border-box}
h2{margin:0 0 8px;font:700 22px/1.2 system-ui,sans-serif}p{margin:0 0 18px;color:#c9c2cf}
.row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
button{font:inherit;color:#f2eef5;background:#26202b;border:1px solid rgba(255,255,255,.2);border-radius:10px;padding:9px 16px;cursor:pointer}
button.primary{background:#d71921;border-color:#d71921;color:#fff}`;

/**
 * Optional daily limit. Counts time only while the tab is visible and focused, and only for sites where the
 * user set a limit. Minutes are stored locally per day, per supported site: no URLs, no history.
 */
export function createLimitsEngine() {
  let site: AdapterId | null = null;
  let limit = 0;
  let timer: number | undefined;
  let pending = 0;
  let snoozeUntil = 0;
  let host: HTMLElement | null = null;
  let msg: HTMLElement | null = null;

  function hide(): void {
    host?.remove();
    host = null;
    msg = null;
  }

  function show(used: number): void {
    if (!site) return;
    const text = `You have used ${used} min on ${FOCUS_ADAPTERS[site].name} today. Your daily limit is ${limit} min.`;
    if (host && msg) {
      if (msg.textContent !== text) msg.textContent = text;
      return;
    }
    host = document.createElement('div');
    host.id = 'nebula-limit-host';
    host.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;';
    const root = host.attachShadow({ mode: 'closed' });
    const style = document.createElement('style');
    style.textContent = CSS;
    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    const card = document.createElement('div');
    card.className = 'card';
    const h = document.createElement('h2');
    h.textContent = 'Daily limit reached';
    msg = document.createElement('p');
    msg.textContent = text;
    const row = document.createElement('div');
    row.className = 'row';
    const snooze = document.createElement('button');
    snooze.className = 'primary';
    snooze.textContent = '5 more minutes';
    snooze.addEventListener('click', () => {
      snoozeUntil = Date.now() + SNOOZE_MS;
      hide();
    });
    const back = document.createElement('button');
    back.textContent = 'Go back';
    back.addEventListener('click', () => {
      if (history.length > 1) history.back();
      else location.href = 'about:blank';
    });
    row.append(snooze, back);
    card.append(h, msg, row);
    wrap.append(card);
    root.append(style, wrap);
    document.documentElement.appendChild(host);
  }

  async function tick(): Promise<void> {
    if (!site || limit <= 0) return;
    try {
      const r = await chrome.storage.local.get(KEYS.usage);
      const usage = normalizeUsage(r[KEYS.usage], todayKey());
      if (!document.hidden && document.hasFocus()) {
        pending += TICK_S;
        if (pending >= 60) {
          const add = Math.floor(pending / 60);
          pending -= add * 60;
          usage.minutes[site] = (usage.minutes[site] ?? 0) + add;
          await chrome.storage.local.set({ [KEYS.usage]: usage });
        }
      }
      const used = usage.minutes[site] ?? 0;
      if (used >= limit && Date.now() >= snoozeUntil) show(used);
      else hide();
    } catch { /* extension reloaded: nothing to do */ }
  }

  function stop(): void {
    window.clearInterval(timer);
    timer = undefined;
    site = null;
    limit = 0;
    pending = 0;
    hide();
  }

  function update(id: AdapterId | null, minutes: number): void {
    if (!id || minutes <= 0) {
      if (site) stop();
      return;
    }
    site = id;
    limit = minutes;
    if (timer === undefined) {
      timer = window.setInterval(() => void tick(), TICK_S * 1000);
      void tick();
    }
  }

  return { update };
}
