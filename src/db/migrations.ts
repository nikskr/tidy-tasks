import type { Db } from './types';

/**
 * Append-only list of schema migrations. Index i upgrades user_version i -> i + 1.
 * NEVER edit a step that has shipped in a store build — add a new one instead.
 * See specs/001-task-list/data-model.md and docs/playbook/04 §4.3.
 */
export const MIGRATIONS: readonly string[] = [
  // 1 — feature 001
  `CREATE TABLE IF NOT EXISTS tasks (
     id          TEXT PRIMARY KEY NOT NULL,
     title       TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
     completed   INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
     created_at  INTEGER NOT NULL,
     updated_at  INTEGER NOT NULL
   );
   CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks (created_at DESC);`,
];

export const DATABASE_VERSION = MIGRATIONS.length;

export async function getSchemaVersion(db: Db): Promise<number> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  return row?.user_version ?? 0;
}

/** Brings the database to DATABASE_VERSION. Each step runs in its own transaction. */
export async function migrate(db: Db): Promise<void> {
  const current = await getSchemaVersion(db);
  if (current > DATABASE_VERSION) {
    // A newer app version created this DB (e.g. after an OTA rollback). Do not touch it.
    throw new Error(`Database version ${current} is newer than app supports (${DATABASE_VERSION})`);
  }
  if (current === 0) {
    await db.execAsync('PRAGMA journal_mode = WAL;');
  }
  for (const [index, step] of MIGRATIONS.slice(current).entries()) {
    const version = current + index;
    await db.execAsync('BEGIN;');
    try {
      await db.execAsync(step);
      // PRAGMA cannot take bound parameters; value is an internal integer.
      await db.execAsync(`PRAGMA user_version = ${version + 1};`);
      await db.execAsync('COMMIT;');
    } catch (error) {
      await db.execAsync('ROLLBACK;');
      throw error;
    }
  }
}
