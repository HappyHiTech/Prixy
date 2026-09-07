const { withClient } = require("./shared/db");

exports.handler = async (event) => {
  const sub = event.requestContext?.authorizer?.claims?.sub;

  if (!sub) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Unauthenticated" }),
    };
  }

  try {
    const rows = await withClient((client) =>
      client
        .query(
          `SELECT
             c.id,
             c.user_id    AS "userId",
             c.name,
             c.icon,
             c.is_default AS "isDefault",
             c.created_at AS "createdAt"
           FROM categories c
           JOIN users u ON u.id = c.user_id
           WHERE u.cognito_sub = $1
           ORDER BY c.is_default DESC, c.name ASC`,
          [sub],
        )
        .then((r) => r.rows),
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
