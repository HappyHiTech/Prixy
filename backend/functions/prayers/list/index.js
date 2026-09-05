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
             pr.id,
             pr.user_id         AS "userId",
             pr.recipient_id    AS "recipientId",
             pr.category_id     AS "categoryId",
             pr.request_text    AS "requestText",
             pr.status,
             pr.source_type     AS "sourceType",
             pr.frequency_type  AS "frequencyType",
             pr.recurring_days  AS "recurringDays",
             pr.last_prayed_at  AS "lastPrayedAt",
             pr.answered_at     AS "answeredAt",
             pr.created_at      AS "createdAt"
           FROM prayer_requests pr
           JOIN users u ON u.id = pr.user_id
           WHERE u.cognito_sub = $1
           ORDER BY pr.created_at DESC`,
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
