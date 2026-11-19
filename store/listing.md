# Store listing — Tidy Tasks 1.0.0

Copy into App Store Connect and Google Play Console. Public pages are served from `site/` via GitHub Pages.

## Shared
- **App IDs:** Android `com.mik_dev.tidytaskmobile` · iOS `com.mik-dev.tidytaskmobile`
- **App name:** Tidy Tasks  *(App Store ≤ 30 chars, Play ≤ 30 chars — check name availability in both stores first)*
- **Category:** Productivity
- **Marketing URL:** https://nikskr.github.io/tidy-tasks/
- **Privacy policy URL:** https://nikskr.github.io/tidy-tasks/privacy/  (source: `site/privacy/index.html`)
- **Support URL / email:** https://nikskr.github.io/tidy-tasks/support/ · mgpmessage@gmail.com
- **Price:** Free · no in-app purchases · no ads

## App Store
- **Subtitle (≤ 30):** Simple, private to-do list
- **Promotional text (≤ 170):** Add a task in one tap, tick it off, clear it away. No account, no tracking — your list stays on your phone.
- **Keywords (≤ 100, comma separated):** todo,to-do,tasks,checklist,list,planner,reminder,productivity,offline,simple
- **Description:**
  Tidy Tasks is a fast, distraction-free to-do list.

  • Add tasks instantly
  • Tap to complete, tap the title to edit
  • Filter by All, Active or Done
  • Clear completed tasks in one go
  • Works fully offline
  • Light and dark mode, VoiceOver and large text support

  Private by design: no account, no ads, no tracking. Your tasks are stored only on your device.
- **Age rating:** 4+ (answer "None" to all content questions)
- **App Privacy:** Data collected — *Crash Data*, *Performance Data*; purpose App Functionality; **not linked** to identity; **not used for tracking**.
- **Export compliance:** uses only exempt encryption (HTTPS) → `ITSAppUsesNonExemptEncryption = NO` (already set in app.config.ts)
- **Review notes:** "No login required. All features available from the main screen. Data is stored locally."
- **Screenshots:** 6.9" iPhone (1320×2868) required; 6.5" optional. (iPad not required: `supportsTablet: false`.)

## Google Play
- **Short description (≤ 80):** A simple, private to-do list. No account, works offline.
- **Full description (≤ 4000):** same as App Store description.
- **Graphics:** icon 512×512 = `assets/store-icon-512.png` (also use it for the expo.dev project icon), feature graphic 1024×500, ≥ 2 phone screenshots (16:9 or 9:16, min 320 px).
- **Content rating:** IARC questionnaire → Everyone.
- **Target audience:** 13+ (avoid "children" unless you want Families policy obligations).
- **Ads:** No ads.
- **Data safety:**
  - Data collected: *App info and performance → Crash logs, Diagnostics*
  - Shared with third parties: No (Sentry is a service provider/processor)
  - Encrypted in transit: Yes · Users can request deletion: n/a (not linked to user) · Collection required: Yes
- **App access:** All functionality available without special access.
- **Testing:** new personal developer accounts must run a **closed test** (Google's current minimum testers/days) before applying for production.
