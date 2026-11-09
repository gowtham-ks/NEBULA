# Known limitations

**General**
- Not tested in Firefox. Chrome-family behaviour was tested by the project owner; Edge and Brave are expected to behave the same but are not verified.
- A site is enabled per hostname (`www.example.com` and `example.com` are separate).
- Generic text, font and glass styling use heuristics on common elements and class names; some sites will change only partially. Icon fonts are skipped on purpose.
- Wallpapers can be blocked on sites with a strict content-security policy. Total storage is ~10 MB; 12 wallpapers max.
- Fonts: only fonts installed on your computer. Font upload is not implemented.
- Per-site overrides select a whole theme (duplicate a theme for site-specific values).
- Theme preview in the dashboard is an approximation; the real preview is the open tab.

**Focus Mode**
- Selectors and labels were written from knowledge of these sites and were not exhaustively verified against every layout or A/B variant. Sites change markup without notice; rules may silently stop matching (they are then harmless).
- Label-based rules ("Suggested for you", X's "For you"/"Following", Reddit recommendations) work in **English interfaces only**.
- Instagram/Facebook mark whole posts by label, so a rare false positive or miss is possible.
- Autoplay off and "Following" are best-effort one-time clicks per page load/navigation.
- Reddit "promoted" covers only markup NEBULA recognises. NEBULA is not an ad blocker and does not claim to remove advertisements in general.
- Old Reddit has limited support.

**Picker**
- Rules use CSS selectors; if a site changes its markup a rule may stop matching. Hiding is `display:none`, so hidden elements still load.

**Added in 1.1**
- **Ads:** NEBULA hides known ad *placements* (YouTube ad slots/banners/overlays, labelled promoted posts on X, Instagram, Facebook) and clicks YouTube's own Skip button when offered. It does not block ad requests, so unskippable video ads still play and some ads will be missed. It is not an ad blocker. YouTube's terms discourage circumventing ads; use this at your own discretion.
- **Dislike count:** relies on a third-party service (opt-in); the number is an estimate from that service, and the dislike button markup may change.
- **YouTube blocklist:** whole-word matching on the visible text of video cards; card markup changes can reduce matches. It does not hide a channel's page itself.
- **YouTube History:** a shortcut to YouTube's own History page (search is YouTube's).
- **Instagram gallery mode:** experimental; it only hides the like/comment bar and comment box in the feed. It does not rebuild the feed as a grid.
- **Languages:** label-based rules recognise English, Spanish, Portuguese, French, German, Italian, Russian, Japanese, Korean, Chinese (Simplified) and Turkish labels. These translations are best effort and unverified per site. **The NEBULA interface itself is English only.**

**YouTube glass layout (1.2)**
- Built from YouTube's current custom elements (`ytd-masthead`, `ytd-guide-renderer`, `ytd-rich-grid-media`, `yt-lockup-view-model`) without verification against every layout or A/B variant. Parts may not apply, or may need selector tweaks after a YouTube update.
- The greeting banner is English, uses the browser clock, and appears only on the home page (`youtube.com/`). Your name is stored locally.
- Glass cards apply `backdrop-filter` to many elements; turn them off on slower machines.

**Glass layout, Music and the Dusk wallpaper (1.3)**
- Supported surfaces: YouTube home, subscriptions, search, watch, channel, playlist and history pages (page type is tagged on `<html data-nebula-page>`), and YouTube Music (best effort, unverified). `m.youtube.com` (mobile site), YouTube Studio, Kids and embeds are not styled by the layout. Shorts keeps its own player; only the top bar and sidebar are glass there.
- Enable NEBULA separately on `www.youtube.com` and `music.youtube.com`.
- The bundled **Dusk Bay** wallpaper is an original generated illustration in a similar colour palette. It is not the photo from any screenshot, which could not be reused.
- All glass rules depend on YouTube/YouTube Music element names, which change; expect occasional adjustments.

**2.0**
- Automatic theme uses the browser clock and system preference; a site's own theme override takes priority over it.
- Daily limits count only focused, visible tabs, so audio/video playing in a background tab is not counted. The reminder is a page overlay, not a block: a determined user can disable NEBULA.
- Restoring a backup asks for site permissions again (Chrome requires it). Sites you decline are skipped.
- The interface is English only.
- Bundled wallpapers are generated illustrations, not photographs.
