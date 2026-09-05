-- 003_auth.sql
-- Links Prixy users to their Cognito identity. Safe to run repeatedly.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS cognito_sub text UNIQUE;

-- display_name is NOT NULL in 001_init, but Cognito only gives us an email at
-- signup. Relax it so PostConfirmation can insert before the user picks a name.
ALTER TABLE users
  ALTER COLUMN display_name DROP NOT NULL;

CREATE INDEX IF NOT EXISTS users_cognito_sub_idx ON users (cognito_sub);
