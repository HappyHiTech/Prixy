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
      body: JSON.stringify({ message: "Missing category id" }),
    };
  }

  try {
    const result = await withClient(async (client) => {
      const existing = await client.query(
        `SELECT c.is_default
           FROM categories c
           JOIN users u ON u.id = c.user_id
          WHERE u.cognito_sub = $1
            AND c.id = $2`,
        [sub, id],
      );

      if (existing.rows.length === 0) return { notFound: true };
      if (existing.rows[0].is_default) return { isDefault: true };

      await client.query(
        `DELETE FROM categories c
           USING users u
          WHERE c.user_id = u.id
            AND u.cognito_sub = $1
            AND c.id = $2`,
        [sub, id],
      );

      await client.query(
        `UPDATE prayer_requests
            SET status = 'inbox'
          WHERE user_id = (SELECT id FROM users WHERE cognito_sub = $1)
            AND status = 'active'
            AND category_id IS NULL`,
        [sub],
      );

      return { deleted: true };
    });

    if (result.notFound) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Category not found" }),
      };
    }

    if (result.isDefault) {
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Default categories can't be deleted.",
        }),
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
