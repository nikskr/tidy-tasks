# 4. Backend Changes, API, SQL and External Integrations

A mobile app cannot be "redeployed" — old versions stay installed for months. So every
backend change must be **marked, contract-first, backward compatible and reversible**.

## 4.1 Marking backend changes

Every `plan.md` has a **Backend Change Log** table. Nothing backend-related is
implemented unless it is a row in this table:

| ID | Type | Change | Breaking? | Min app version | Migration | Owner | Status |
|----|------|--------|-----------|-----------------|-----------|-------|--------|
| BE-1 | API | `GET /v1/tasks?since=` added | No (additive) | 1.1.0 | — | backend | Planned |
| BE-2 | SQL | `tasks` table + index on `(user_id, updated_at)` | No | — | `0001_create_tasks.sql` | backend + DBA | Planned |
| BE-3 | Integration | Sign in with Apple / Google | No | 1.1.0 | — | backend | Planned |

Types: `API`, `SQL`, `Integration`, `Config/flag`, `Infra`. The PR template has a
checkbox "Touches backend → BE-IDs: …". The `backend-integrator` agent refuses to
change backend code without a BE-ID.

## 4.2 API: contract-first

1. Change `specs/NNN/contracts/openapi.yaml` **first**, in its own reviewed PR.
2. Generate the client types from it (`openapi-typescript`) — the app never hand-writes response types.
3. Backend implements to the contract; contract tests (e.g. Schemathesis/Prism) run in backend CI.
4. App consumes behind a feature flag until the backend is live in production.

**Compatibility rules (mobile is the strictest client):**
- Additive only on existing versions: new optional fields, new endpoints. Never rename/remove fields, never make optional → required, never change types or enum meaning.
- Clients must **ignore unknown fields** and tolerate unknown enum values (map to `unknown`).
- Breaking change ⇒ new version path (`/v2/...`), and `/v1` stays until the last app version using it is below the min-supported version.
- Every request carries `X-App-Version`, `X-Platform`, `X-Build`; backend can then return `426 Upgrade Required` for a hard minimum version.
- Timeouts (10 s), retries with backoff only for idempotent calls, `Idempotency-Key` header on POSTs that create data.
- Errors use a single shape (RFC 9457 `application/problem+json`).

**Client layer in the app:** `src/lib/api/` — one `fetch` wrapper that adds auth,
version headers, timeout, error mapping, and Sentry breadcrumbs. Screens use hooks
(TanStack Query when a backend exists), never `fetch` directly.

## 4.3 SQL: migrations

Two databases exist once sync is added: **on-device SQLite** (expo-sqlite) and the
**server database** (PostgreSQL).

**Rules for both**
- Migrations are **append-only, numbered, forward-only** files. Never edit a migration that has shipped.
- Each migration is idempotent where possible (`IF NOT EXISTS`) and wrapped in a transaction.
- Expand → migrate → contract: add new column (nullable) → backfill → switch code → later drop old column in a separate release once no shipped client uses it.
- Every migration has a test: on-device — a Jest test that runs migrations from version 0 and from the previous release's version; server — CI applies all migrations to an empty DB and to a snapshot.

**On-device (this repo):** `src/db/migrations.ts` uses `PRAGMA user_version` and a
list of steps. Adding a step bumps the version; old steps never change.

**Server:** `specs/002-cloud-sync/migrations/*.sql` (later moved into the backend
repo). Rules for production:
- Reviewed by a human with DB ownership; agents may write, never execute against shared environments.
- Locking-safe: `CREATE INDEX CONCURRENTLY`, no table rewrites on large tables during peak, `lock_timeout` set.
- Rollback script or written "rollback = restore from PITR" decision for each migration.
- Agents get **read-only** DB access via MCP (a read-only role on a staging replica) for investigation.

## 4.4 External services and integrations

Keep a registry in `docs/integrations.md` (template below). For each one decide the
data it receives, because that drives the store privacy forms.

| Service | Purpose | SDK/API | Data sent | Store privacy impact | Keys stored in | Owner | Failure mode |
|---------|---------|---------|-----------|----------------------|----------------|-------|--------------|
| Sentry | Crash + perf monitoring | `@sentry/react-native` | Crash logs, device model, OS, app version; no PII (`sendDefaultPii: false`) | iOS: Crash Data, Performance Data — not linked to user, not tracking. Play: Crash logs, Diagnostics | DSN in `app.config.ts` via EAS env (public), auth token = EAS secret | Mobile lead | App works without it |
| Expo (EAS Update) | OTA updates | `expo-updates` | Device runtime/version headers | None beyond normal | — | Mobile lead | Falls back to embedded bundle |

**Integration rules**
- Wrap each third-party SDK behind a small module in `src/lib/<service>/` so it can be mocked, disabled by flag, or replaced.
- Initialization must never block app start or crash it — wrap in try/catch, init lazily if heavy.
- Secrets: anything that grants write access lives on the server, never in the app. Public keys (DSN, publishable keys) go through EAS env vars.
- Webhooks from third parties → backend only, verified signatures.
- Every new integration ⇒ update privacy forms + privacy policy **before** release.

## 4.5 Agent workflow for a backend-touching feature

1. `spec-author` writes `spec.md` (no backend detail).
2. `planner` writes `plan.md` including the Backend Change Log, `contracts/openapi.yaml`, `data-model.md`, SQL migrations.
3. Human reviews contract + migrations (separate PR, labeled `backend-contract`).
4. `backend-integrator` implements server side in the backend repo (or here, if monorepo), with contract tests.
5. `implementer` builds the app side against a mock server generated from the contract (Prism), behind a flag.
6. Deploy backend → verify in staging with a `preview` app build → enable flag → release app.
