const { withClient } = require("./shared/db");


const UPDATABLE_FIELDS = {
  prayeeId: "prayee_id",
  categoryId: "category_id",
  requestText: "request_text",
  frequencyType: "frequency_type",
  recurringDays: "recurring_days",
  answered: null,
};

const ANSWERED_FIELD = "answered";

const FIELD_CASTS = {
  recurringDays: "::text[]",
};

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

  if ("requestText" in body) {
    if (typeof body.requestText !== "string" || body.requestText.trim() === "") {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "requestText must be a non-empty string",
        }),
      };
    }
  }

  if ("answered" in body && typeof body.answered !== "boolean") {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "answered must be a boolean" }),
    };
  }

  if ("frequencyType" in body && !FREQUENCY_TYPES.includes(body.frequencyType)) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `frequencyType must be one of: ${FREQUENCY_TYPES.join(", ")}`,
      }),
    };
  }

  if ("recurringDays" in body) {
    const days = body.recurringDays;

    if (
      !Array.isArray(days) ||
      days.some((day) => !RECURRING_DAYS.includes(day)) ||
      new Set(days).size !== days.length
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
  }


  if (
    "frequencyType" in body &&
    "recurringDays" in body &&
    body.frequencyType === "one_time" &&
    body.recurringDays.length > 0
  ) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "recurringDays must be empty when frequencyType is one_time",
      }),
    };
  }

  // $1 = cognito sub, $2 = prayer request id, then one placeholder per field.
  const values = [sub, id, ...updates.map((f) => body[f])];
  const setClause = updates
    .filter((f) => f !== ANSWERED_FIELD)
    .map(
      (f) =>
        `${UPDATABLE_FIELDS[f]} = $${updates.indexOf(f) + 3}${FIELD_CASTS[f] ?? ""}`,
    )
    .join(", ");

  // A column referenced in SET resolves to the pre-UPDATE row, so a field
  // included in this PATCH must be read from its placeholder instead. The
  // cast is required: a bare placeholder appearing only inside CASE gives
  // Postgres nothing to infer the type from.
  const fieldExpr = (field) => {
    const i = updates.indexOf(field);
    return i === -1 ? `pr.${UPDATABLE_FIELDS[field]}` : `$${i + 3}::uuid`;
  };

  const prayeeExpr = fieldExpr("prayeeId");
  const categoryExpr = fieldExpr("categoryId");


  const answeredIdx = updates.indexOf(ANSWERED_FIELD);
  const answeredExpr =
    answeredIdx === -1 ? "NULL::boolean" : `$${answeredIdx + 3}::boolean`;

  try {
    const result = await withClient(async (client) => {
      const user = await client.query(
        `SELECT id FROM users WHERE cognito_sub = $1`,
        [sub],
      );

      if (user.rows.length === 0) return { notFound: true };

      const userId = user.rows[0].id;

  
      const sentOneFrequencyField =
        ("frequencyType" in body) !== ("recurringDays" in body);

      if (sentOneFrequencyField) {
        const current = await client.query(
          `SELECT pr.frequency_type, pr.recurring_days
             FROM prayer_requests pr
            WHERE pr.id = $1 AND pr.user_id = $2`,
          [id, userId],
        );

        if (current.rows.length === 0) return { notFound: true };

        const { frequency_type, recurring_days } = current.rows[0];
        const nextType = body.frequencyType ?? frequency_type;
        const nextDays = body.recurringDays ?? recurring_days;

        if (nextType === "one_time" && nextDays.length > 0) {
          return { badFrequency: true };
        }
      }

      if (body.prayeeId != null) {
        const prayee = await client.query(
          `SELECT 1 FROM prayees WHERE id = $1 AND user_id = $2`,
          [body.prayeeId, userId],
        );

        if (prayee.rows.length === 0) return { badPrayee: true };
      }

      if (body.categoryId != null) {
        const category = await client.query(
          `SELECT 1 FROM categories WHERE id = $1 AND user_id = $2`,
          [body.categoryId, userId],
        );

        if (category.rows.length === 0) return { badCategory: true };
      }

      const updated = await client.query(
        `UPDATE prayer_requests pr
            SET ${setClause}${setClause ? "," : ""}
                status = CASE
                  WHEN ${answeredExpr} IS TRUE THEN 'answered'
                  WHEN ${answeredExpr} IS FALSE
                   AND ${prayeeExpr} IS NOT NULL
                   AND ${categoryExpr} IS NOT NULL
                  THEN 'active'
                  WHEN ${answeredExpr} IS FALSE THEN 'inbox'
                  WHEN pr.status = 'answered' THEN pr.status
                  WHEN ${prayeeExpr} IS NOT NULL
                   AND ${categoryExpr} IS NOT NULL
                  THEN 'active'
                  ELSE 'inbox'
                END,
                answered_at = CASE
                  WHEN ${answeredExpr} IS TRUE THEN now()
                  WHEN ${answeredExpr} IS FALSE THEN NULL
                  ELSE pr.answered_at
                END
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

    if (result.badFrequency) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "recurringDays must be empty when frequencyType is one_time",
        }),
      };
    }

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
