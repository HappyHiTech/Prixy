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

  const id = event.pathParameters?.id;

  if (!id) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing prayee id" }),
    };
  }

  try {
    const deleted = await withClient(async (client) => {
      const result = await client.query(
        `DELETE FROM prayees p
           USING users u
          WHERE p.user_id = u.id
            AND u.cognito_sub = $1
            AND p.id = $2
        RETURNING p.id`,
        [sub, id],
      );

      if (result.rows.length === 0) return false;

      await client.query(
        `UPDATE prayer_requests
            SET status = 'inbox'
          WHERE user_id = (SELECT id FROM users WHERE cognito_sub = $1)
            AND status = 'active'
            AND prayee_id IS NULL`,
        [sub],
      );

      return true;
    });

    if (!deleted) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Prayee not found" }),
      };
    }

    return { statusCode: 204, headers: {}, body: "" };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
