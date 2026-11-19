-- BE-5 · Feature 002 · account deletion queue (processed by a job; SLA 24 h)
BEGIN;
SET LOCAL lock_timeout = '5s';

CREATE TABLE IF NOT EXISTS deletion_requests (
  user_id       uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  requested_at  timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz
);

COMMIT;
