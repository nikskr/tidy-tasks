# Tasks — Feature 001 Task List

- [x] **T-01** Project setup: Expo Router, TS strict, ESLint, Jest, `npm run verify` — Done when: verify green on empty app
- [x] **T-02** Device DB migrations v1 — AC: AC-9 — Done when: `migrations.test.ts` "migrates from 0" passes
- [x] **T-03** [P] Task repository (list/add/toggle/rename/remove/clearCompleted) — AC: AC-1..AC-6, AC-8 — Done when: `taskRepository.test.ts` passes
- [x] **T-04** [P] Pure filters and counts — AC: AC-7, AC-10, AC-11 — Done when: `filters.test.ts` passes
- [x] **T-05** `useTasks` hook wiring repository + state — AC: AC-1, AC-4..AC-8
- [x] **T-06** List screen UI: input, rows, filter bar, footer, empty states, a11y, dark mode — AC: AC-1..AC-8, AC-10, AC-11 — Done when: QA checklist §UI passes
- [x] **T-07** About screen — AC: AC-12
- [ ] **T-08** Monitoring: Sentry init, error reporting, PII scrubbing — Done when: test crash visible in Sentry with symbolicated stack (preview build) · _Code done; needs Sentry project + preview build to verify_
- [x] **T-09** Release config: app.config.ts, eas.json, privacy manifest, store metadata — Done when: `npx expo-doctor` passes ✔, `eas build --profile preview` succeeds ✔ (Android preview build installed and tested on device, 2026-11-18)
