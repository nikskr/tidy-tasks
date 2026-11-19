## What
<!-- One or two sentences. -->

## Spec traceability
- Feature: `specs/NNN-…`
- Task(s): T-…
- Acceptance criteria covered: AC-…

## How it was verified
- [ ] `npm run verify` green
- [ ] Tests named by AC id
- [ ] Manual check on device/simulator (platforms: iOS / Android) — screenshots or recording if UI changed
- [ ] Dark mode + large font checked (UI changes)

## Risk
- [ ] Touches backend → BE-IDs: …  (contract updated, backward compatible)
- [ ] DB migration added (append-only, tested from previous version)
- [ ] New dependency (justify): …
- [ ] Native change (needs new binary; cannot ship via OTA)
- [ ] Privacy impact (new data collected/sent) → privacy forms + policy updated

## AI involvement
- Implemented by: human / implementer agent / @claude
- AI review verdict: …
