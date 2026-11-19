# Tidy Tasks — agent instructions

Offline-first to-do app. Expo SDK 58 · React Native 0.88 · React 19 · TypeScript strict · Expo Router · expo-sqlite · Sentry · EAS.

@AGENTS.md

## Before you start any task
1. Read `specs/constitution.md`.
2. Read the feature folder you are working on: `specs/NNN-*/spec.md`, `plan.md`, `tasks.md`.
3. If the spec is not `Approved`, or the task is not in `tasks.md`, stop and say so. Do not invent scope.
4. If the task touches the backend/API/SQL/integrations, it must reference a BE-ID from `plan.md` (see `docs/playbook/04-backend-api-sql-integrations.md`).

## Commands
```bash
npm run verify        # lint + typecheck + tests — must be green before you say "done"
npm test -- <path>    # single test file
npx expo start        # dev server (needs a dev build: native modules are not in Expo Go)
npx expo install <pkg># ONLY way to add dependencies (SDK-compatible versions)
npx expo-doctor       # config/dependency health
npm run icons         # regenerate icon PNGs from scripts/generate-icons.mjs
```

## Layout and rules
- `src/app/` routes only (screens, layouts). No SQL, no business logic.
- `src/features/<feature>/` hooks, components, pure logic. `src/db/` migrations + repositories. `src/lib/` services (config, monitoring, api).
- Repositories take the `Db` interface (`src/db/types.ts`) so tests run on sql.js (`src/db/__tests__/sqljsDb.ts`).
- SQL: bound parameters only. Schema change = append a step to `MIGRATIONS` in `src/db/migrations.ts` + a test. Never edit a shipped step.
- Errors: `reportError(error, 'area.action')` from `src/lib/monitoring.ts`. No empty `catch`, no `any`, no `@ts-ignore`.
- UI: colors from `usePalette()`, sizes from `spacing`/`MIN_TOUCH`; every pressable has `accessibilityRole` + `accessibilityLabel`.
- Config: `app.config.ts` (variant via `APP_VARIANT`). Never create/edit `ios/` or `android/` (CNG).
- Tests are named by acceptance criterion: `it('AC-4: …')`.

## Definition of done
- `npm run verify` green; new behavior has tests mapped to AC IDs.
- `tasks.md` item ticked; PR description lists AC IDs + how verified (template in `.github/pull_request_template.md`).
- No new dependency without justification in the PR.

## Never do (ask a human)
- `eas submit`, `eas update --channel production`, changing store rollout, editing credentials/secrets.
- Running SQL against any non-local database; destructive git (`push --force`, `reset --hard` on shared branches).
- Weakening or deleting tests to make them pass.

## Playbook
`docs/playbook/` — requirements (01), SDD (02), agent tasking & review (03), backend/API/SQL (04), agent config (05), release & production (06).
