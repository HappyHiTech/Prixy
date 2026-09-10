ALTER TABLE prayees
  DROP CONSTRAINT IF EXISTS prayees_user_id_name_key;

ALTER TABLE categories
  DROP CONSTRAINT IF EXISTS categories_user_id_name_key;

CREATE UNIQUE INDEX IF NOT EXISTS prayees_user_lower_name_idx
  ON prayees (user_id, lower(name));

CREATE UNIQUE INDEX IF NOT EXISTS categories_user_lower_name_idx
  ON categories (user_id, lower(name));
