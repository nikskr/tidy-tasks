# Feature 002 — Cloud Sync (optional account)

Status: Draft · Owner: product · Target version: 1.1.0

## Problem / why
Users with more than one device want the same list everywhere and a backup if they lose
their phone. The app must remain fully usable without an account.

## User stories
- **US-1** As a user, I can optionally sign in (Apple / Google) to back up and sync my tasks.
- **US-2** As a signed-in user, changes I make offline sync automatically when I'm back online.
- **US-3** As a user, I can sign out and delete my account and all server data from inside the app.

## Acceptance criteria
- **AC-1** Given I'm not signed in, the app behaves exactly like v1.0 (no prompts blocking use).
- **AC-2** Given I sign in for the first time, my existing local tasks are uploaded and kept.
- **AC-3** Given two devices signed in to the same account, a change on one appears on the other within 30 s of both being online and foregrounded.
- **AC-4** Given the same task edited on two devices offline, when both sync, the most recent edit (by `updated_at`) wins and no task is duplicated.
- **AC-5** Given I delete a task on one device, it is deleted on others (tombstone), even if they were offline.
- **AC-6** Given I tap "Delete account", after confirmation all server data is deleted within 24 h and I'm signed out; local tasks remain on this device.
- **AC-7** Given the server is unreachable, no error dialogs are shown; a subtle "Not synced" indicator appears.

## Edge cases
- Token expiry mid-sync; clock skew between devices (server assigns `server_updated_at`); 10k tasks first upload (batched); app version too old (426 → upgrade prompt).

## Out of scope
- Sharing lists between users, real-time collaboration, web client.

## Open questions
- [NEEDS CLARIFICATION] Do we need email/password sign-in in addition to Apple/Google?
- [NEEDS CLARIFICATION] Data residency requirements (EU-only hosting?)
