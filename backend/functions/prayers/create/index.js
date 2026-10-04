const { withClient } = require("./shared/db");

const FREQUENCY_TYPES = ["one_time", "recurring"];
const RECURRING_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
      body: JSON.stringify({ message: "Body must be valid JSON" }),
    };
  }

  const {
    requestText,
    prayeeId = null,
    categoryId = null,
    frequencyType = "one_time",
    recurringDays = [],
  } = body;

  if (typeof requestText !== "string" || requestText.trim() === "") {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "requestText must be a non-empty string",
      }),
    };
  }

  if (!FREQUENCY_TYPES.includes(frequencyType)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `frequencyType must be one of: ${FREQUENCY_TYPES.join(", ")}`,
      }),
    };
  }

  if (
    !Array.isArray(recurringDays) ||
    recurringDays.some((day) => !RECURRING_DAYS.includes(day)) ||
    new Set(recurringDays).size !== recurringDays.length
  ) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `recurringDays must be an array of unique days from: ${RECURRING_DAYS.join(
          ", ",
        )}`,
      }),
    };
  }

  if (frequencyType === "one_time" && recurringDays.length > 0) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "recurringDays must be empty when frequencyType is one_time",
      }),
    };
  }

  const status = prayeeId && categoryId ? "active" : "inbox";

  try {
    const result = await withClient(async (client) => {
      const user = await client.query(
        `SELECT id FROM users WHERE cognito_sub = $1`,
        [sub],
      );

      if (user.rows.length === 0) return { notFound: true };

      const userId = user.rows[0].id;

      if (prayeeId != null) {
        const prayee = await client.query(
          `SELECT 1 FROM prayees WHERE id = $1 AND user_id = $2`,
          [prayeeId, userId],
        );

        if (prayee.rows.length === 0) return { badPrayee: true };
      }

      if (categoryId != null) {
        const category = await client.query(
          `SELECT 1 FROM categories WHERE id = $1 AND user_id = $2`,
          [categoryId, userId],
        );

        if (category.rows.length === 0) return { badCategory: true };
      }

      const created = await client.query(
        `INSERT INTO prayer_requests
           (user_id, prayee_id, category_id, request_text, source_type,
            frequency_type, recurring_days, status)
         VALUES ($1, $2, $3, $4, 'manual', $5, $6::text[], $7)
         RETURNING
           id,
           user_id         AS "userId",
           prayee_id       AS "prayeeId",
           category_id     AS "categoryId",
           request_text    AS "requestText",
           raw_transcript  AS "rawTranscript",
           status,
           source_type     AS "sourceType",
           frequency_type  AS "frequencyType",
           recurring_days  AS "recurringDays",
           last_prayed_at  AS "lastPrayedAt",
           repeat_on::text AS "repeatOn",
           answered_at     AS "answeredAt",
           created_at      AS "createdAt"`,
        [
          userId,
          prayeeId,
          categoryId,
          requestText,
          frequencyType,
          recurringDays,
          status,
        ],
      );

      return { row: created.rows[0] };
    });

    if (result.badPrayee) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Unknown prayee" }),
      };
    }

    if (result.badCategory) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Unknown category" }),
      };
    }

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
