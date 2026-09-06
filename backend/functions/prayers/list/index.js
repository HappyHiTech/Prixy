const { withClient } = require("./shared/db");

const VALID_STATUS = ["inbox", "active", "answered"];

exports.handler = async (event) => {
  const sub = event.requestContext?.authorizer?.claims?.sub;

  if (!sub) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Unauthenticated" }),
    };
  }

  const status = event.queryStringParameters?.status;

  if (status !== undefined && !VALID_STATUS.includes(status)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Invalid status. Expected one of: ${VALID_STATUS.join(", ")}`,
      }),
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
           AND ($2::text IS NULL OR pr.status = $2)
           ORDER BY pr.created_at DESC`,
          [sub, status ?? null],
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
