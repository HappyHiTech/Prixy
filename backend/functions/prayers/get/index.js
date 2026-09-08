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
      body: JSON.stringify({ message: "Missing prayer request id" }),
    };
  }

  try {
    const row = await withClient((client) =>
      client
        .query(
          `SELECT
             pr.id,
             pr.user_id         AS "userId",
             pr.prayee_id       AS "prayeeId",
             pr.category_id     AS "categoryId",
             pr.request_text    AS "requestText",
             pr.raw_transcript  AS "rawTranscript",
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
             AND pr.id = $2`,
          [sub, id],
        )
        .then((r) => r.rows[0]),
    );

    if (!row) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Prayer request not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
