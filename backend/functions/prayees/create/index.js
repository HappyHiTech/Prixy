const { withClient } = require("./shared/db");

const MAX_NAME_LENGTH = 60;

exports.handler = async (event) => {
  const sub = event.requestContext?.authorizer?.claims?.sub;

  if (!sub) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Unauthenticated" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Invalid JSON body" }),
    };
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (name.length === 0) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Name is required" }),
    };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Name must be ${MAX_NAME_LENGTH} characters or fewer`,
      }),
    };
  }

  try {
    const result = await withClient(async (client) => {
      const user = await client.query(
        `SELECT id FROM users WHERE cognito_sub = $1`,
        [sub],
      );

      if (user.rows.length === 0) return { notFound: true };

      const created = await client.query(
        `INSERT INTO prayees (user_id, name)
         VALUES ($1, $2)
         RETURNING
           id,
           user_id    AS "userId",
           name,
           created_at AS "createdAt"`,
        [user.rows[0].id, name],
      );

      return { row: created.rows[0] };
    });

    if (result.notFound) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.row),
    };
  } catch (err) {
    // 23505 = unique_violation, from prayees_user_lower_name_idx
    if (err.code === "23505") {
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `You already have someone called "${name}".`,
        }),
      };
    }

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
