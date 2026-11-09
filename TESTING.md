# Testing

## Automated
```
npm run build    # type-check + build
npm test         # unit tests: CSS validator, theme/profile/focus normalisers, theme import
npm run audit    # permissions, network/eval scan, CSP
```

## Manual test plan
Mark each item pass/fail. A feature counts as done only when the behaviour works, not when the UI exists.

**Install and basics**
1. Load unpacked from `dist/`: no Errors button on the card; version 1.0.0.
2. Popup opens, shows the site name, theme list, switches and buttons. Master switch persists after closing the popup.
3. Dashboard: all 10 sections open; none says "Not yet implemented".

**Per-site activation and permissions**
4. "Enable on this site" shows Chrome's prompt for that one site. Denying it leaves the site untouched.
5. "Turn off for this site" removes styling without reload. Website Manager > Remove also revokes permission.

**Appearance, glass, typography, wallpapers, themes**
6. Presets restyle a simple site (e.g. en.wikipedia.org) instantly. Colour, glass, typography and wallpaper edits preview live; Cancel reverts, Apply saves.
7. Upload a wallpaper; adjust position, scaling, opacity, blur, dim; delete it. A non-image file shows an error.
8. Theme create/rename/duplicate/delete/apply. Export a theme, delete it, import the file. Import `examples/themes/nebula-examples.json`. Importing a random JSON file shows an error.

**Per-site profiles, CSS, picker**
9. Website Manager: theme override, duplicate to another hostname, reset, add by hostname.
10. Custom CSS: live preview, Apply/Cancel/Reset, enable switch, `.css` import/export, syntax colours. `@import url(https://x.test/a.css);` and `a{background:url(http://x.test/a.png)}` are rejected.
11. Picker: hover highlight, select, selector + match count, Preview hide, Parent, Reselect, Hide and save, Undo last rule. Warnings for main content/forms/search/navigation; `html`/`body` cannot be hidden. Rules toggle/delete in the Website Manager. Test a case where the selector contains `>` (an element without id/class): the rule must persist after reload.

**Focus Mode** (turn the master switch on; enable NEBULA on each site first; use an English interface)
12. YouTube: Shorts, homepage, related, comments, end screens, autoplay. Navigate between pages (SPA) and confirm rules keep working.
13. X: trends, suggested accounts, sidebar, "For you" tab hidden, Following preferred on /home.
14. Instagram: Reels link, suggested posts, Explore link and page.
15. Facebook: suggested posts, Reels, right sidebar.
16. Reddit: promoted posts, recommendations, sidebars, Popular/All/Explore links.
17. Scroll a long feed with a text-label rule on: scrolling stays smooth; turning the feature off un-hides everything.
For each rule that does not work, record the site, page URL and what is still visible. Rules are expected to need occasional updates.

**Resilience**
18. Restart the browser: settings, themes, wallpapers, rules, CSS, Focus switches, enabled sites persist.
19. Fill storage with wallpapers: you get a readable "Storage is full" message, nothing breaks.
20. Settings: storage usage shown; "Delete all NEBULA data" resets everything and revokes permissions.
21. Reload the extension while a site is open: the old page does not throw errors in DevTools after reload.

## Added in 1.1
22. YouTube > Hide ads: ad slots/banners disappear; on a skippable video ad the Skip button is clicked automatically. Unskippable ads will still play (expected).
23. X / Instagram / Facebook > Hide promoted/sponsored: labelled posts disappear. Facebook may miss some (expected).
24. YouTube blocklist: add a channel name and a word; matching videos vanish from home/search/sidebar; remove them and reload to see them return.
25. Dislike count: switch it on, accept the permission prompt for returnyoutubedislikeapi.com, open a video: a number appears by the dislike button. Switch off: permission revoked, number gone.
26. YouTube History shortcuts in the popup and dashboard open youtube.com/feed/history.
27. Instagram gallery mode: like/comment bar and comment box hidden in the feed.
28. Switch the site/account language to e.g. Spanish or German and re-test suggested/sponsored/For you rules.

## Added in 1.2
29. Dashboard > Appearance > YouTube glass layout: switch it on with a wallpaper applied. The top bar and sidebar become floating rounded glass panels, cards and chips turn glass, and (on youtube.com home) the greeting shows the date, "Good <time>," and your name.
30. Change the name, hero slider, cards and greeting switches: the open tab updates live. Switch the layout off: everything returns to normal.
31. Navigate home > video > home: the greeting disappears on the video page and returns on home.

## Added in 1.3
32. Dashboard > Appearance > "Apply the Dusk look": theme, wallpaper and layout apply together on an enabled YouTube tab.
33. Visit home, subscriptions, a search, a video, a channel, a playlist, History and a Short. Nothing should look broken: no overlapping bars, unreadable text or cut-off thumbnails. Note any page that does.
34. Enable NEBULA on music.youtube.com: the theme colours apply, and with the layout on the top bar, bottom player bar and sidebar turn glass. Play a track: the player page must stay usable.
35. Resize the window narrow and wide: the greeting stays on the home page and the layout stays intact.

## Added in 2.0
36. First install (or remove and re-add the extension): the welcome page opens. Overview shows the checklist; "Got it" hides it.
37. Popup: enable a site, then change "Theme for this site"; the page updates and the Website Manager shows the override.
38. Automation: turn on the automatic theme with day/night themes and times a few minutes apart: the theme flips at the boundary without reloading. Try "System light/dark" and switch your OS theme.
39. Daily limit: set 1 minute for a site, keep that tab focused for about 1-2 minutes: the reminder appears; "5 more minutes" hides it; "Go back" navigates back. Set 0: no tracking, no reminder.
40. Shortcuts: Alt+Shift+N toggles NEBULA (toolbar shows OFF when paused), Alt+Shift+F toggles Focus Mode, Alt+Shift+P starts the picker on an enabled site. Change them at chrome://extensions/shortcuts.
41. Backup: Export, change a setting, Import the file, Restore: settings return; Chrome asks for site permissions. Import a random .json: an error is shown.
42. Wallpapers > Built-in gallery: add each wallpaper, preview it in the mini preview, delete it.
43. New presets (Aurora, Rose Quartz, Sunset, Terminal, Mono Paper) apply and look sensible on a simple site.
