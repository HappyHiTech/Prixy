const { withClient } = require("./shared/db");

exports.handler = async (event) => {
  const sub = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  try {
    await withClient(async (client) => {
      const result = await client.query(
        `INSERT INTO users (cognito_sub, email)
         VALUES ($1, $2)
         ON CONFLICT (email)
         DO UPDATE SET cognito_sub = EXCLUDED.cognito_sub
         RETURNING id`,
        [sub, email],
      );

      const userId = result.rows[0].id;

      // Starter set every new account gets. ON CONFLICT makes this safe to
      // re-run, since the users INSERT above is an upsert.
      await client.query(
        `INSERT INTO categories (user_id, name, icon, is_default)
         VALUES
           ($1, 'Family',  'home',   true),
           ($1, 'Friends', 'users',  true),
           ($1, 'Church',  'church', true)
         ON CONFLICT (user_id, name) DO NOTHING`,
        [userId],
      );
    });
  } catch (err) {
    console.error("post-confirmation failed", err);
    throw err;
  }

  return event;
};
