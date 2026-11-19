# External integrations registry

Update this table **before** releasing anything that adds or changes a third-party service,
and update the store privacy forms + `store/privacy-policy.md` to match.

| Service | Purpose | SDK/API | Data sent | iOS App Privacy | Play Data safety | Keys / where stored | Owner | If it fails |
|---------|---------|---------|-----------|-----------------|------------------|---------------------|-------|-------------|
| Sentry | Crash + performance monitoring | `@sentry/react-native` ~8.28 | Errors, stack traces, device model, OS, app version, navigation breadcrumbs (console + input breadcrumbs dropped), no PII | Crash Data, Performance Data — not linked, no tracking | Crash logs, Diagnostics — not shared | DSN: EAS env `EXPO_PUBLIC_SENTRY_DSN` (public). Upload token: EAS secret `SENTRY_AUTH_TOKEN` | Mobile lead | Init skipped / no-op; app unaffected |
| Expo EAS Update | OTA JS updates | `expo-updates` | Runtime version, platform, update id (request headers) | None | None | `EAS_PROJECT_ID` (public) | Mobile lead | Embedded bundle is used |
| EAS Build / Submit | Cloud builds, store upload | CLI | Source, credentials (server side) | — | — | Apple ASC API key + Google service account stored in EAS | Release owner | Manual Xcode/Play upload |

Planned (feature 002, not shipped): Sign in with Apple, Google Sign-In, Tidy Tasks API — see `specs/002-cloud-sync/plan.md` BE-6.
