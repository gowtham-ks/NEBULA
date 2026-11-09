// Fetches the dislike count for a video id on behalf of the YouTube content script.
// Only runs when the user opted in (permission for this one host granted). Only the video id is sent.
const API = 'https://returnyoutubedislikeapi.com/votes?videoId=';
const ORIGIN = 'https://returnyoutubedislikeapi.com/*';
const cache = new Map<string, { n: number; t: number }>();

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type !== 'nebula:dislikes' || sender.id !== chrome.runtime.id || !sender.tab) return;
  const id = msg.videoId;
  if (typeof id !== 'string' || !/^[\w-]{11}$/.test(id)) {
    sendResponse({ error: 'bad id' });
    return;
  }
  void (async () => {
    try {
      const hit = cache.get(id);
      if (hit && Date.now() - hit.t < 1_800_000) {
        sendResponse({ dislikes: hit.n });
        return;
      }
      if (!(await chrome.permissions.contains({ origins: [ORIGIN] }))) {
        sendResponse({ error: 'not enabled' });
        return;
      }
      const res = await fetch(API + id);
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { dislikes?: unknown };
      const n = typeof data.dislikes === 'number' && Number.isFinite(data.dislikes) && data.dislikes >= 0 ? Math.floor(data.dislikes) : null;
      if (n === null) throw new Error('bad data');
      cache.set(id, { n, t: Date.now() });
      if (cache.size > 200) cache.delete(cache.keys().next().value as string);
      sendResponse({ dislikes: n });
    } catch {
      sendResponse({ error: 'unavailable' });
    }
  })();
  return true; // async response
});
