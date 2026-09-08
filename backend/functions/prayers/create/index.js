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
    const result = await withClient(async (client) => {
      const user = await client.query(
        `SELECT id FROM users WHERE cognito_sub = $1`,
        [sub],
      );

      if (user.rows.length === 0) return { notFound: true };

      const created = await client.query(
        `INSERT INTO prayer_requests (user_id, request_text, source_type)
         VALUES ($1, '', 'manual')
         RETURNING
           id,
           user_id         AS "userId",
           prayee_id       AS "prayeeId",
           category_id     AS "categoryId",
           request_text    AS "requestText",
           status,
           source_type     AS "sourceType",
           frequency_type  AS "frequencyType",
           recurring_days  AS "recurringDays",
           last_prayed_at  AS "lastPrayedAt",
           answered_at     AS "answeredAt",
           created_at      AS "createdAt"`,
        [user.rows[0].id],
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
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
