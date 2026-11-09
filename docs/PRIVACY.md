# Privacy and permissions

NEBULA collects nothing. There is no analytics, telemetry, account, tracking or remote code. By default the extension
makes no network requests; the one exception is the **opt-in** dislike count (below). Settings, themes, wallpapers and rules are stored in `chrome.storage.local` on your device.
`npm run audit` checks this on every release.

| Permission | Why |
|---|---|
| `storage` | Save your settings locally. |
| `activeTab` | Read the address of the tab you click NEBULA on, to show the site name and enable it. |
| `scripting` | Register/inject the styling script on sites you enable. |
| Optional site access | Requested for **one site at a time**, only when you press "Enable on this site" (or add a site in the Website Manager). Removing the site revokes it. |

NEBULA does not read browsing history, page content (beyond matching labels for Focus Mode rules on the sites you
enabled), cookies, or form data. Exported theme files contain only your theme settings (and wallpapers if you tick the option).
"Delete all NEBULA data" in Settings removes everything and revokes all site permissions.

## Opt-in: YouTube dislike count
Off by default. If you switch on "Show dislike count" (Dashboard > Focus Mode > YouTube), Chrome asks for permission to contact
`returnyoutubedislikeapi.com`, a third-party service. NEBULA then sends **only the video id** of the video you are watching
(the service also sees your IP address, as any website does) and shows the number it returns. Switching the option off revokes the permission.
The request is made by the background worker; the content script never makes network requests.

## Added in 2.0
- **Daily limits (optional):** only for sites where you set a limit, NEBULA counts the minutes the tab is visible and focused and stores `{day, minutes per site}` locally. No URLs, titles or history are recorded, and nothing is sent anywhere. Setting a limit to 0 stops counting.
- **Backups** are files you create and move yourself. They contain your settings and optionally wallpapers, and are not uploaded anywhere.
- **Keyboard shortcuts and the toolbar badge** use no extra permissions.
