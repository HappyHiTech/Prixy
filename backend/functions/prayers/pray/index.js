const { withClient } = require("./shared/db");
const { parsePrayRequest } = require("./shared/pray/parsePrayRequest");
const { isUnknownTimeZoneError } = require("./shared/timeZone");

const PRAY_SQL = `
  UPDATE prayer_requests pr
  SET last_prayed_at = now(),
      repeat_on = CASE WHEN $3 = 'repeat_tomorrow'
                       THEN (now() AT TIME ZONE $4)::date + 1
                       ELSE NULL END
  FROM users u
  WHERE pr.user_id = u.id
    AND u.cognito_sub = $1
    AND pr.id = $2
    AND pr.status = 'active'
  RETURNING
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
    pr.repeat_on::text AS "repeatOn", -- keeps date as "YYYY-MM-DD"; pg would otherwise turn a date into a JS Date at UTC midnight
    pr.answered_at     AS "answeredAt",
    pr.created_at      AS "createdAt"`;

const EXISTS_SQL = `
  SELECT 1
  FROM prayer_requests pr
  JOIN users u ON u.id = pr.user_id
  WHERE u.cognito_sub = $1
    AND pr.id = $2`;

exports.handler = async (event) => {
  const sub = event.requestContext?.authorizer?.claims?.sub;

  if (!sub) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Unauthenticated" }),
    };
  }

  const parsed = parsePrayRequest(event);

  if (parsed.error) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: parsed.error }),
    };
  }

  const { id, action, tz } = parsed;

  try {
    const result = await withClient(async (client) => {
      const row = await client
        .query(PRAY_SQL, [sub, id, action, tz])
        .then((r) => r.rows[0]);

      if (row) return { row };

      const exists = await client
        .query(EXISTS_SQL, [sub, id])
        .then((r) => r.rowCount > 0);

      return { row: null, exists };
    });

    if (result.row) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.row),
      };
    }

    if (!result.exists) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Prayer request not found" }),
      };
    }

    return {
      statusCode: 409,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Only active prayer requests can be prayed",
      }),
    };
  } catch (err) {
    if (isUnknownTimeZoneError(err)) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Unknown time zone: ${tz}` }),
      };
    }

    console.error("PrayPrayer failed", { id, action, error: err });

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
