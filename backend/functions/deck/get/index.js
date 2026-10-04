const { withClient } = require("./shared/db");
const { isValidTimeZone } = require("./shared/timeZone");

const DECK_SQL = `
  WITH me AS (
    SELECT id FROM users WHERE cognito_sub = $1
  ),
  today AS (
    SELECT (now() AT TIME ZONE $2)::date AS d
  ),
  due AS (
    SELECT pr.*
    FROM prayer_requests pr
    JOIN me ON pr.user_id = me.id
    CROSS JOIN today
    WHERE pr.status = 'active'
      AND (pr.last_prayed_at IS NULL
           OR (pr.last_prayed_at AT TIME ZONE $2)::date < today.d)
      AND (
        pr.last_prayed_at IS NULL
        OR (pr.frequency_type = 'recurring'
            AND to_char(today.d, 'Dy') = ANY (pr.recurring_days))
        OR pr.repeat_on <= today.d
      )
  ),
  prayee_order AS (
    SELECT prayee_id, random() AS k
    FROM (SELECT DISTINCT prayee_id FROM due) g
  )
  SELECT
    due.id,
    due.request_text   AS "requestText",
    due.frequency_type AS "frequencyType",
    due.created_at     AS "createdAt",
    p.id               AS "prayeeId",
    p.name             AS "prayeeName",
    c.id               AS "categoryId",
    c.name             AS "categoryName",
    c.icon             AS "categoryIcon"
  FROM due
  JOIN prayee_order po ON po.prayee_id = due.prayee_id
  JOIN prayees p       ON p.id = due.prayee_id
  JOIN categories c    ON c.id = due.category_id
  ORDER BY po.k, random()`;

const PRAYED_TODAY_SQL = `
  SELECT count(*)::int AS "prayedToday"
  FROM prayer_requests pr
  JOIN users u ON u.id = pr.user_id
  WHERE u.cognito_sub = $1
    AND (pr.last_prayed_at AT TIME ZONE $2)::date
        = (now() AT TIME ZONE $2)::date`;

exports.handler = async (event) => {
  const sub = event.requestContext?.authorizer?.claims?.sub;

  if (!sub) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Unauthenticated" }),
    };
  }

  const tz = event.queryStringParameters?.tz;

  if (!isValidTimeZone(tz)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Invalid tz. Expected an IANA time zone like America/Los_Angeles",
      }),
    };
  }

  try {
    const deck = await withClient(async (client) => {
      const cards = await client
        .query(DECK_SQL, [sub, tz])
        .then((r) => r.rows);
      const { prayedToday } = await client
        .query(PRAYED_TODAY_SQL, [sub, tz])
        .then((r) => r.rows[0]);

      return { prayedToday, cards };
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(deck),
    };
  } catch (err) {
    console.error("GetDeck failed", { tz, error: err });

    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
