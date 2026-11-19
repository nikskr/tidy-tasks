-- BE-2 · Feature 002 · PostgreSQL 16
-- Append-only. Never edit after it has run on staging. Reviewed by: <DBA>
-- Rollback: DROP TABLE refresh_tokens, tasks, users; (only valid before first production use)
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS users (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider        text NOT NULL CHECK (provider IN ('apple', 'google')),
  provider_sub    text NOT NULL,
  email           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, provider_sub)
);

CREATE TABLE IF NOT EXISTS tasks (
  id                 uuid PRIMARY KEY,                 -- generated on device
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title              text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  completed          boolean NOT NULL DEFAULT false,
  created_at         bigint NOT NULL,                  -- client epoch ms
  updated_at         bigint NOT NULL,                  -- client epoch ms, LWW key
  deleted_at         bigint,                           -- tombstone
  server_updated_at  bigint NOT NULL DEFAULT (extract(epoch FROM clock_timestamp()) * 1000)::bigint
);
-- Pull-by-cursor query: WHERE user_id = $1 AND server_updated_at > $2 ORDER BY server_updated_at
CREATE INDEX IF NOT EXISTS idx_tasks_user_server_updated ON tasks (user_id, server_updated_at);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  token_hash   bytea PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at   timestamptz NOT NULL,
  revoked_at   timestamptz
);

COMMIT;
