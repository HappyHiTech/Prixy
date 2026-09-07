const { withClient } = require("./shared/db");

const UPDATABLE_FIELDS = {
  prayeeId: "prayee_id",
};

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
      body: JSON.stringify({ message: "Missing prayer request id" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Body must be valid JSON" }),
    };
  }

  const updates = Object.keys(UPDATABLE_FIELDS).filter((f) => f in body);

  if (updates.length === 0) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `No updatable fields. Expected one of: ${Object.keys(
          UPDATABLE_FIELDS,
        ).join(", ")}`,
      }),
    };
  }

  // $1 = cognito sub, $2 = prayer request id, then one placeholder per field.
  const values = [sub, id, ...updates.map((f) => body[f])];
  const setClause = updates
    .map((f, i) => `${UPDATABLE_FIELDS[f]} = $${i + 3}`)
    .join(", ");

  try {
    const result = await withClient(async (client) => {
      const user = await client.query(
        `SELECT id FROM users WHERE cognito_sub = $1`,
        [sub],
      );

      if (user.rows.length === 0) return { notFound: true };

      const userId = user.rows[0].id;

      if (body.prayeeId != null) {
        const prayee = await client.query(
          `SELECT 1 FROM prayees WHERE id = $1 AND user_id = $2`,
          [body.prayeeId, userId],
        );

        if (prayee.rows.length === 0) return { badPrayee: true };
      }

      const updated = await client.query(
        `UPDATE prayer_requests pr
            SET ${setClause}
           FROM users u
          WHERE pr.user_id = u.id
            AND u.cognito_sub = $1
            AND pr.id = $2
        RETURNING
          pr.id,
          pr.user_id         AS "userId",
          pr.prayee_id       AS "prayeeId",
          pr.category_id     AS "categoryId",
          pr.request_text    AS "requestText",
          pr.status,
          pr.source_type     AS "sourceType",
          pr.frequency_type  AS "frequencyType",
          pr.recurring_days  AS "recurringDays",
          pr.last_prayed_at  AS "lastPrayedAt",
          pr.answered_at     AS "answeredAt",
          pr.created_at      AS "createdAt"`,
        values,
      );

      return { row: updated.rows[0] };
    });

    if (result.badPrayee) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Unknown prayee" }),
      };
    }

    if (result.notFound || !result.row) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Prayer request not found" }),
      };
    }

    return {
      statusCode: 200,
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
