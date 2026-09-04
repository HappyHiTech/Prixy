-- 001_init.sql
-- Core schema for Prixy. Safe to run repeatedly.

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name  text NOT NULL,
  email         text NOT NULL UNIQUE,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recipients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  icon        text,
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS prayer_requests (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id    uuid REFERENCES recipients(id) ON DELETE SET NULL,
  category_id     uuid REFERENCES categories(id) ON DELETE SET NULL,
  request_text    text NOT NULL,
  raw_transcript  text,
  status          text NOT NULL DEFAULT 'inbox'
                    CHECK (status IN ('inbox', 'active', 'answered')),
  source_type     text NOT NULL
                    CHECK (source_type IN ('voice', 'manual')),
  frequency_type  text NOT NULL DEFAULT 'one_time'
                    CHECK (frequency_type IN ('one_time', 'recurring')),
  recurring_days  text[] NOT NULL DEFAULT '{}',
  last_prayed_at  timestamptz,
  answered_at     timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- recurring_days is only meaningful when frequency_type = 'recurring'
  CONSTRAINT recurring_days_only_when_recurring CHECK (
    frequency_type = 'recurring' OR cardinality(recurring_days) = 0
  )
);

-- The Home Screen's three tabs are all "this user's requests with this status".
CREATE INDEX IF NOT EXISTS prayer_requests_user_status_idx
  ON prayer_requests (user_id, status);
