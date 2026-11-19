---
name: release
description: Cut a new app release - version bump, changelog, store notes, readiness checks, and the ordered human steps for EAS build/submit and store rollout. Use when asked to release, ship, or prepare a version.
---

# Release

Arguments: version (SemVer), e.g. `1.1.0`. Patch = fixes only; minor = features; any native change needs at least a minor and a new binary.

1. Confirm `main` is clean and CI green. List specs going out and confirm they are `Implemented`.
2. Delegate to `release-engineer`:
   - bump `version` in `app.config.ts`;
   - add `CHANGELOG.md` entry and `store/release-notes/<version>.md` (≤ 500 chars, user language, no internal jargon);
   - run `npm run verify`, `npx expo-doctor`, `npx expo export` and compare bundle size to the NFR;
   - fill the store checklist (docs/playbook/01 §1.2).
3. Show the readiness report. Ask the human before committing.
4. Hand over the human steps (do not run them):
   1. `npx eas-cli@latest build --profile preview --platform all` → QA with `docs/qa-checklist.md`
   2. `git tag v<version> && git push origin v<version>` → `release.yml` builds production + submits to TestFlight / Play internal
   3. App Store Connect: attach build, What's New, submit for review, enable phased release
   4. Play Console: promote internal → production with staged rollout 10% → 50% → 100%
   5. Watch Sentry release health for 48 h, then write `docs/releases/<version>.md`
