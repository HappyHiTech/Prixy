const { withClient } = require("./shared/db");

const VALID_STATUS = ["inbox", "active", "answered"];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const prayeeId = event.queryStringParameters?.prayeeId;
  const categoryId = event.queryStringParameters?.categoryId;

  for (const [name, value] of [
    ["prayeeId", prayeeId],
    ["categoryId", categoryId],
  ]) {
    if (value !== undefined && !UUID_PATTERN.test(value)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Invalid ${name}` }),
      };
    }
  }

  try {
    const rows = await withClient((client) =>
      client
        .query(
          `SELECT
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
             pr.created_at      AS "createdAt"
           FROM prayer_requests pr
           JOIN users u ON u.id = pr.user_id
           WHERE u.cognito_sub = $1
           AND ($2::text IS NULL OR pr.status = $2)
           AND ($3::uuid IS NULL OR pr.prayee_id = $3)
           AND ($4::uuid IS NULL OR pr.category_id = $4)
           ORDER BY pr.created_at DESC`,
          [sub, status ?? null, prayeeId ?? null, categoryId ?? null],
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
