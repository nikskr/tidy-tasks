# Plan — Feature 001 Task List

Status: Approved · Spec: ./spec.md

## Approach
```
src/app/_layout.tsx        Stack navigator, SQLiteProvider(onInit=migrate), Sentry wrap, theme
src/app/index.tsx          List screen: header, input, filter bar, FlatList, footer
src/app/about.tsx          Version, build, privacy policy link
src/features/tasks/
  useTasks.ts              hook: loads tasks, exposes add/toggle/rename/remove/clearCompleted, filter
  TaskItem.tsx             row: checkbox, inline edit, delete
  FilterBar.tsx            segmented control (All/Active/Done)
  filters.ts               pure filter/count functions
src/db/
  migrations.ts            PRAGMA user_version migrations
  taskRepository.ts        SQL only; takes a minimal `Db` interface (so tests can use sql.js)
src/lib/monitoring.ts      Sentry init + reportError
src/theme/                 light/dark palettes
```
State: the hook holds the list in React state and applies the same mutation to SQLite;
after each write it re-reads from the DB (simple, consistent; fine for ≤ 10k rows).

## Data model
See [data-model.md](data-model.md). Device migration v1.

## Backend Change Log
| ID | Type | Change | Breaking? | Min app version | Migration | Owner | Status |
|----|------|--------|-----------|-----------------|-----------|-------|--------|
| — | — | No backend in v1 | — | — | — | — | — |

## External integrations
- Sentry (crash + performance). Data: crash logs, device/OS info, no user content (`beforeSend` scrubs breadcrumbs of input text). iOS App Privacy: Crash Data + Performance Data, not linked, no tracking. Play Data safety: Crash logs + Diagnostics, not shared, encrypted in transit.

## Risks & rollback
| Risk | Mitigation | Rollback |
|------|------------|----------|
| Migration bug loses data | Migration tests from v0; WAL mode | OTA fix (JS-only) |
| Sentry DSN missing in build | Init is skipped when DSN empty; app works | — |

## Test strategy
- Unit: `filters.test.ts` (AC-7, AC-10, AC-11), `taskRepository.test.ts` on sql.js (AC-1..AC-6, AC-8, AC-9 via migration-from-zero).
- Manual QA: `docs/qa-checklist.md` (accessibility, dark mode, kill/relaunch, update-over-previous-build).

## Constitution check
- [x] Works offline
- [x] No new personal data collected (crash data disclosed in privacy forms)
- [x] Migrations append-only, tested
- [x] Accessibility + dark mode covered
- [x] Backend changes have BE-IDs — none
