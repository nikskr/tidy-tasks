# Data model — Feature 001

## Device (SQLite, `tidytasks.db`)

### Migration 1
```sql
PRAGMA journal_mode = WAL;
CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY NOT NULL,          -- UUID v4, generated on device (sync-ready for 002)
  title       TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
  completed   INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
  created_at  INTEGER NOT NULL,                   -- epoch ms
  updated_at  INTEGER NOT NULL                    -- epoch ms
);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks (created_at DESC);
```

Why UUID text ids instead of INTEGER autoincrement: feature 002 will sync tasks to a
server; client-generated UUIDs avoid id remapping.

## Entity
| Field | Type (TS) | Notes |
|-------|-----------|-------|
| id | `string` | UUID |
| title | `string` | 1–200 chars, trimmed |
| completed | `boolean` | stored 0/1 |
| createdAt | `number` | epoch ms |
| updatedAt | `number` | epoch ms, bumped on every change |
