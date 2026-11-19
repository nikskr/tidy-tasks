---
name: db-migration
description: Add a database schema change safely - on-device SQLite (src/db/migrations.ts) or server PostgreSQL (specs/NNN/migrations). Use whenever a table, column or index must change.
---

# Database migration

## On-device (expo-sqlite)
1. Never edit an existing entry in `MIGRATIONS` (`src/db/migrations.ts`). Append a new string; its index + 1 is the new `user_version`.
2. Only additive, SQLite-supported operations (`ALTER TABLE … ADD COLUMN` with a default, new tables, new indexes). For anything else: create new table → copy → drop → rename, in the same step.
3. Update `specs/NNN/data-model.md` with the step number and SQL.
4. Add tests in `src/db/__tests__/migrations.test.ts`:
   - migrate from 0 to latest;
   - migrate from the previous released version **with data present** and assert the data survives.
5. `npm run verify`.

## Server (PostgreSQL)
1. Requires a BE-ID in plan.md. New file `NNNN_<name>.sql`; never edit a file that has run on staging.
2. Wrap in a transaction with `SET LOCAL lock_timeout = '5s'`; use `CREATE INDEX CONCURRENTLY` (outside a transaction) for big tables.
3. Expand → migrate → contract: add nullable → backfill → switch code → drop later in a separate release.
4. Write the rollback note at the top of the file.
5. Apply only to a local database. Applying to staging/production is a human step — say so in your report.
