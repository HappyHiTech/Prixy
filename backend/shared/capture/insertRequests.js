const RETURNING_COLUMNS = `
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
  answered_at     AS "answeredAt",
  created_at      AS "createdAt"`;

async function insertRequests(client, userId, splits, sourceType) {
  await client.query("BEGIN");
  try {
    const rows = [];
    for (const split of splits) {
      const status = split.prayeeId && split.categoryId ? "active" : "inbox";

      const result = await client.query(
        `INSERT INTO prayer_requests
          (user_id, prayee_id, category_id, request_text, raw_transcript, source_type, status)
        VALUES ($1, $2, $3, $4, $4, $5, $6)
        RETURNING ${RETURNING_COLUMNS}
        `,
        [
          userId,
          split.prayeeId,
          split.categoryId,
          split.requestText,
          sourceType,
          status,
        ],
      );
      rows.push(result.rows[0]);
    }
    await client.query("COMMIT");
    return rows;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

module.exports = { insertRequests };
