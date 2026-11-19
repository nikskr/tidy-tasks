# Plan — Feature 002 Cloud Sync

Status: Draft (blocked on open questions in spec) · Spec: ./spec.md

## Approach
- Sync model: client-generated UUIDs (already in v1 schema), last-write-wins on `updated_at`,
  tombstones for deletes, pull-by-cursor + push batches.
- App: `src/lib/api/` fetch client generated from `contracts/openapi.yaml`;
  `src/features/sync/` runs sync on foreground + after mutations (debounced 2 s).
- Auth: Sign in with Apple (`expo-apple-authentication`) and Google; backend exchanges the
  identity token for its own short-lived access token + refresh token. Tokens in `expo-secure-store`.

## Data model
Device migration **2** (append-only, see `data-model.md`):
```sql
ALTER TABLE tasks ADD COLUMN deleted_at INTEGER;          -- tombstone
ALTER TABLE tasks ADD COLUMN dirty INTEGER NOT NULL DEFAULT 1; -- needs push
CREATE TABLE IF NOT EXISTS sync_state (key TEXT PRIMARY KEY, value TEXT NOT NULL);
```
Server: `migrations/0001_init.sql`, `migrations/0002_account_deletion.sql`.

## Backend Change Log
| ID | Type | Change | Breaking? | Min app version | Migration | Owner | Status |
|----|------|--------|-----------|-----------------|-----------|-------|--------|
| BE-1 | Infra | New service `tidytasks-api` (Node/Fastify), Postgres 16, staging + prod | n/a (new) | — | — | backend | Planned |
| BE-2 | SQL | `users`, `tasks`, `refresh_tokens` tables | n/a (new) | — | `0001_init.sql` | backend + DBA | Planned |
| BE-3 | API | `POST /v1/auth/apple`, `POST /v1/auth/google`, `POST /v1/auth/refresh` | No | 1.1.0 | — | backend | Planned |
| BE-4 | API | `GET /v1/tasks/changes?cursor=`, `POST /v1/tasks/batch` | No | 1.1.0 | — | backend | Planned |
| BE-5 | API + SQL | `DELETE /v1/account` + `deletion_requests` job table | No | 1.1.0 | `0002_account_deletion.sql` | backend | Planned |
| BE-6 | Integration | Apple Sign In (Services ID, key), Google OAuth client IDs (iOS/Android/web) | No | 1.1.0 | — | backend | Planned |
| BE-7 | Config | Header `X-App-Version` check → 426 below `MIN_APP_VERSION` | No | 1.1.0 | — | backend | Planned |

## External integrations
- Apple / Google identity: email (possibly relay) + user id stored → **privacy forms change**: "Contact info: email — linked to user, app functionality". Privacy policy update required.
- Account deletion in-app required by both stores once accounts exist.

## Risks & rollback
| Risk | Mitigation | Rollback |
|------|------------|----------|
| Sync bug duplicates/loses tasks | Server-side idempotent upsert by id; property tests on merge | Remote flag `sync_enabled=false` (served by `/v1/config`), local data untouched |
| Backend outage | App is offline-first; AC-7 | — |
| Migration lock on large table | All indexes `CONCURRENTLY`; reviewed by DBA | Restore via PITR |

## Constitution check
- [x] Works offline
- [ ] New personal data (email) → privacy forms + policy update task T-12
- [x] Migrations append-only, tested
- [ ] Accessibility of sign-in buttons (use native Apple button)
- [x] Backend changes have BE-IDs and are backward compatible
