# Project Constitution — Tidy Tasks

Status: Approved · Owner: tech lead · Changes require team review

## Principles
1. **Spec first.** No code without an approved `spec.md`; no backend change without a Backend Change Log row (BE-ID).
2. **Offline first.** The device database is the source of truth for the user's data; network features enhance, never gate, core flows.
3. **Privacy by default.** Collect nothing not needed. No accounts in v1. No analytics/tracking SDKs. Crash reports contain no user-entered content.
4. **Small, verifiable steps.** One task = one PR ≤ ~300 changed lines, with tests.
5. **Production quality from day one.** NFRs in `docs/playbook/01-production-requirements.md` §1.1 apply to every feature.

## Tech stack (changes need a constitution amendment)
- Expo SDK 58, React Native 0.88, React 19, TypeScript strict
- Navigation: Expo Router (`src/app/`)
- Local data: `expo-sqlite` with `PRAGMA user_version` migrations
- Monitoring: `@sentry/react-native`
- Updates: `expo-updates` (EAS Update), runtime policy `appVersion`
- Tests: Jest (`jest-expo`) + React Native Testing Library; repository tests run on `sql.js`
- Build/Release: EAS Build + EAS Submit; CI on GitHub Actions
- Future backend (002): REST + OpenAPI 3.1, PostgreSQL

## Code rules
- Layers: `src/app` (screens, routing only) → `src/features/*` (hooks, components) → `src/db` / `src/lib` (data, services). Screens never contain SQL.
- All SQL uses bound parameters. Schema changes only via a new migration step.
- No `any`, no `@ts-ignore`, no empty `catch`. Errors are reported via `src/lib/monitoring.ts`.
- Every interactive element: `accessibilityRole` + `accessibilityLabel`; hit area ≥ 44pt.
- Colors from `src/theme`, support light and dark.
- New dependency → justify in PR; use `npx expo install`.

## Constitution check (copy into each plan.md)
- [ ] Works offline
- [ ] No new personal data collected (or privacy forms + policy updated)
- [ ] Migrations append-only, tested
- [ ] Accessibility + dark mode covered
- [ ] Backend changes have BE-IDs and are backward compatible
