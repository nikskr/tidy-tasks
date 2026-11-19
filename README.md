# Tidy Tasks

A simple, private, offline-first to-do app for iOS and Android. It is also the reference
implementation for the delivery playbook in [`docs/playbook/`](docs/playbook/README.md).

**Stack:** Expo SDK 58 · React Native 0.88 · TypeScript · Expo Router · expo-sqlite · Sentry · EAS Build/Submit/Update

## Repository map
| Path | What |
|------|------|
| `docs/playbook/` | The instructions: requirements, SDD, agent tasking/review, backend/API/SQL, agent config, release & production |
| `specs/` | Constitution + feature specs (`001-task-list` shipped in 1.0, `002-cloud-sync` draft with API contract & SQL) |
| `src/app/` | Screens (Expo Router) |
| `src/features/tasks/` | Task list hook, components, pure logic |
| `src/db/` | SQLite migrations + repository (+ sql.js test adapter) |
| `src/lib/` | Config, monitoring |
| `CLAUDE.md`, `.claude/`, `.mcp.json` | Agent instructions, subagents, skills, hooks, MCP servers |
| `.github/` | CI, Claude review/mention workflow, release workflow, PR template |
| `store/` | Store listing text, privacy policy, release notes |

## Develop
```bash
npm ci
npm run verify                                  # lint + typecheck + tests
npx eas-cli@latest build --profile development --platform android   # once: dev client (or npx expo run:android)
npx expo start                                  # then open in the dev client
```
The app uses native modules (SQLite, Sentry), so use a development build, not Expo Go.

## Release to the stores — first time
Detailed reasoning is in [chapter 6](docs/playbook/06-release-and-production.md). Short version:

1. **Accounts**: Apple Developer Program, Google Play Console, Expo account (and Sentry, optional).
2. **Identity** ✔: Android `com.mik_dev.tidytaskmobile`, iOS `com.mik-dev.tidytaskmobile` (iOS forbids `_`). Set in `app.config.ts`; never change them after the first store upload.
3. **Link EAS**: `npx eas-cli@latest login` → `npx eas-cli@latest init`. Put the printed project id into EAS env `EAS_PROJECT_ID` (and `EXPO_OWNER`), all environments.
4. **Env vars** (EAS → Project → Environment variables):
   `EXPO_PUBLIC_SENTRY_DSN` (plain), `SENTRY_ORG`, `SENTRY_PROJECT` (plain), `SENTRY_AUTH_TOKEN` (secret),
   `EXPO_PUBLIC_PRIVACY_URL`, `EXPO_PUBLIC_SUPPORT_EMAIL`.
5. **Publish the privacy policy** (`store/privacy-policy.md`) at a public URL.
6. **Store records**: create the app in App Store Connect (note the Apple ID → `eas.json` `submit.production.ios.ascAppId`) and in Play Console.
7. **Credentials**: `npx eas-cli@latest credentials` — let EAS generate the iOS distribution certificate/profile and the Android keystore; upload an App Store Connect API key and a Google service-account JSON for submissions.
8. **Build**: `npm run build:production`.
9. **First Android upload is manual**: download the `.aab` from the EAS build page and upload it to a Play testing track once. After that, `eas submit` / `--auto-submit` works.
10. **Submit iOS**: `npm run submit:production` → TestFlight. Test, then in App Store Connect fill metadata from `store/listing.md`, attach the build and submit for review.
11. **Google Play**: run the required closed test (new personal accounts), complete store listing / content rating / data safety from `store/listing.md`, then promote to production with a staged rollout.
12. **Monitor**: Sentry release health + Play Android Vitals + App Store Connect crashes for 48 h.

After the first release, CI does steps 8–10 when you push a tag `vX.Y.Z` (see `.github/workflows/release.yml`; needs repo secret `EXPO_TOKEN`).

## Working with AI agents
Use the playbook flow: `/new-feature` → (human approves spec) → `planner` → `/implement-task 00N T-xx` → `/review-pr` → human merge → `/release`. Production issues: `/triage-crash <sentry issue>`.
