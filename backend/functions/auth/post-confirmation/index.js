const { withClient } = require("./shared/db");

exports.handler = async (event) => {
  const sub = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;

  try {
    await withClient((client) =>
      client.query(
        `INSERT INTO users (cognito_sub, email)
         VALUES ($1, $2)
         ON CONFLICT (email)
         DO UPDATE SET cognito_sub = EXCLUDED.cognito_sub
         RETURNING id`,
        [sub, email],
      ),
    );
  } catch (err) {
    console.error("post-confirmation user upsert failed", err);
  }

  return event;
};
