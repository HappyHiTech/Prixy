const { withClient } = require("./shared/db");

exports.handler = async () => {
  try {
    const rows = await withClient((client) =>
      client
        .query(
          `SELECT
             id,
             user_id         AS "userId",
             recipient_id    AS "recipientId",
             category_id     AS "categoryId",
             request_text    AS "requestText",
             status,
             source_type     AS "sourceType",
             frequency_type  AS "frequencyType",
             recurring_days  AS "recurringDays",
             last_prayed_at  AS "lastPrayedAt",
             answered_at     AS "answeredAt",
             created_at      AS "createdAt"
           FROM prayer_requests
           ORDER BY created_at DESC`,
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
