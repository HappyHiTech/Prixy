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
             p.id,
             p.user_id    AS "userId",
             p.name,
             p.created_at AS "createdAt"
           FROM prayees p
           JOIN users u ON u.id = p.user_id
           WHERE u.cognito_sub = $1
           ORDER BY p.name ASC`,
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
