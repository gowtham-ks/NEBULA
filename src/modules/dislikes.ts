// The dislike count comes from a third-party service. It is strictly opt-in: enabling it asks for
// permission to contact that one host, and disabling it revokes the permission.
export const RYD_ORIGIN = 'https://returnyoutubedislikeapi.com/*';

export async function enableDislikes(): Promise<boolean> {
  try {
    return await chrome.permissions.request({ origins: [RYD_ORIGIN] });
  } catch {
    return false;
  }
}

export async function disableDislikes(): Promise<void> {
  try {
    await chrome.permissions.remove({ origins: [RYD_ORIGIN] });
  } catch { /* ignore */ }
}
