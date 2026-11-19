# 1. Requirements for Production and Post-Release Support

A feature is "done" only when it meets the functional spec **and** every applicable
requirement below. These are referenced from `specs/constitution.md`, so every spec and
every agent inherits them.

## 1.1 Non-functional requirements (NFR)

| Area | Requirement | How it is verified |
|------|-------------|--------------------|
| **Stability** | Crash-free users ≥ 99.5% (target 99.8%); crash-free sessions ≥ 99.8% | Sentry release health; Play Console Android Vitals; Xcode Organizer |
| **ANR** (Android) | User-perceived ANR rate < 0.47% (Google "bad behavior" threshold) | Android Vitals |
| **Startup** | Cold start to interactive < 2.0 s on mid-range device (Pixel 6a / iPhone 12) | Sentry app-start spans, manual profiling on release build |
| **Rendering** | Lists scroll at 60 fps with 500 items; no JS frame drops > 100 ms on core flows | React Native DevTools profiler, Sentry slow/frozen frames |
| **Bundle / binary** | Hermes JS bundle (`.hbc`) ≤ 6 MB and must not grow > 10% per release without a reason in the PR (v1.0 baseline: 4.6 MB); Android download size < 30 MB | `npx expo export` size report, Play Console |
| **Offline** | Core flows work with no network; no spinner-of-death | Airplane-mode test case in QA checklist |
| **Data safety** | No data loss on update: every schema change ships with a forward migration and a test | Migration unit test; upgrade test from previous store build |
| **Security** | No secrets in the bundle; HTTPS only; tokens in `expo-secure-store`; no PII in logs/crash reports | Code review checklist, `grep` gate in CI, Sentry `beforeSend` scrubbing |
| **Privacy** | Privacy policy URL live; App Privacy (iOS) + Data Safety (Android) forms match actual collection; iOS privacy manifest complete | Release checklist |
| **Accessibility** | Every interactive element has `accessibilityRole` + `accessibilityLabel`; touch targets ≥ 44×44 pt; works with Dynamic Type / font scale 200%; contrast ≥ 4.5:1 | VoiceOver/TalkBack pass in QA |
| **Localization-ready** | No hard-coded user-facing strings outside `src/i18n` (once a 2nd locale is added) | Lint rule / review |
| **Compatibility** | iOS ≥ the minimum supported by the Expo SDK in use; Android minSdk per SDK; current Play `targetSdkVersion` requirement met | `npx expo-doctor`, Play Console pre-launch report |
| **Observability** | Every release has: crash reporting, source maps uploaded, release + dist tags, breadcrumbs for navigation | Sentry release page shows symbolicated stack traces |
| **Updatability** | OTA channel configured; runtime version policy defined; ability to force-upgrade (min supported version) once a backend exists | `eas.json`, `app.json` `runtimeVersion` |

## 1.2 Store policy checklist (re-check before every major release)

Store rules change several times a year — **always confirm against the current
App Store Review Guidelines and Google Play Developer Policy Center** before submitting.

**Both stores**
- [ ] Privacy policy URL (publicly reachable, matches actual data collection)
- [ ] Support URL / contact email
- [ ] App name, subtitle/short description, full description, keywords
- [ ] Screenshots for each required device size; feature graphic (Play)
- [ ] Age rating questionnaire completed
- [ ] If the app has accounts: in-app **account deletion** (required by both stores)
- [ ] If the app sells digital goods: store in-app purchase only (no external payment links unless the region allows it)
- [ ] No placeholder content, no "beta"/"test" wording, no broken links

**Apple App Store**
- [ ] Apple Developer Program membership; App Store Connect app record; bundle ID registered
- [ ] App Privacy "nutrition label" filled in
- [ ] `PrivacyInfo.xcprivacy` (via `ios.privacyManifests` in `app.json`) declares required-reason APIs
- [ ] Export compliance: `ITSAppUsesNonExemptEncryption` set (`false` if only HTTPS/OS crypto)
- [ ] Review notes + demo account if login exists
- [ ] Built with the Xcode/SDK version Apple currently requires (EAS images track this)

**Google Play**
- [ ] Play Console developer account; app created; package name final (cannot be changed later)
- [ ] Data safety form
- [ ] Target API level meets the current Play requirement
- [ ] Content rating, target audience, ads declaration, government/financial/health declarations as relevant
- [ ] **New personal developer accounts must run a closed test with a minimum number of testers for a minimum number of days before production access** — plan this into the schedule (historically 12 testers × 14 days; verify current numbers)
- [ ] Play App Signing enrolled (EAS manages the upload key)

## 1.3 Environments

| Env | Purpose | App variant | Backend | Distribution |
|-----|---------|-------------|---------|--------------|
| `development` | Local dev | Dev client (`developmentClient: true`) | local / dev | Simulator / USB |
| `preview` | QA, stakeholder demo | Release build, internal | staging | EAS internal distribution, TestFlight internal |
| `production` | Users | Store build | production | App Store / Google Play |

Configuration is selected by the EAS build profile and `APP_VARIANT` env var
(`app.config.ts`), never by editing code. Secrets live in **EAS environment variables**
(sensitive / secret visibility), never in the repo.

## 1.4 Versioning

- **Marketing version** (`expo.version`, e.g. `1.4.0`) — SemVer, bumped by humans at release cut.
- **Build number / versionCode** — managed remotely by EAS (`appVersionSource: remote`, `autoIncrement: true`).
- **Runtime version** — `{"policy": "appVersion"}`: an OTA update only reaches binaries with the same marketing version. Any native change ⇒ new marketing version ⇒ new store build.
- Git tag `v1.4.0` on the commit that was built for the store.

## 1.5 Support model after release

| Item | Standard |
|------|----------|
| Severity levels | **S1** crash/data loss affecting > 1% users or core flow broken → hotfix within 24 h. **S2** major feature broken for a segment → next patch (≤ 7 days). **S3** minor/UI → next planned release. **S4** cosmetic → backlog |
| Channels watched | Sentry alerts (Slack/email), Play Console Vitals, App Store Connect crashes & reviews, support inbox, store reviews (weekly) |
| On-call | Named owner per release week; runbook = [chapter 6](06-release-and-production.md) |
| Hotfix path | JS-only bug → EAS Update to `production` channel (minutes). Native bug → patch binary + expedited review (Apple) |
| Rollback | OTA: `eas update:rollback` / republish previous update. Binary: halt staged rollout (Play) / pause phased release (Apple), then ship fixed build |
| Support window | Last 2 marketing versions supported; older versions get a soft upgrade prompt, then (with backend) hard minimum version |
| Dependency hygiene | Expo SDK upgrade at least every second SDK release (≈ yearly); monthly `npx expo install --check`; security advisories triaged weekly |
| Post-release review | 48 h after each production release: crash-free %, new issues, reviews, perf regressions → written into `docs/releases/<version>.md` |
