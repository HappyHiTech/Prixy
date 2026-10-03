const { withClient } = require("./shared/db");
const { parseRequests } = require("./shared/capture/parseRequests");
const { insertRequests } = require("./shared/capture/insertRequests");

const MAX_INPUT_CHARS = 5000;

const respond = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

exports.handler = async (event) => {
  const sub = event.requestContext?.authorizer?.claims?.sub;

  if (!sub) return respond(401, { message: "Unauthenticated" });

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return respond(400, { message: "Body must be valid JSON" });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (text.length === 0) {
    return respond(400, { message: "Write something to capture first." });
  }
  if (text.length > MAX_INPUT_CHARS) {
    return respond(400, {
      message: `Keep it under ${MAX_INPUT_CHARS} characters.`,
    });
  }

  try {

    const context = await withClient(async (client) => {
      const user = await client.query(
        `SELECT id FROM users WHERE cognito_sub = $1`,
        [sub],
      );
      if (user.rows.length === 0) return null;

      const userId = user.rows[0].id;
      const prayees = await client.query(
        `SELECT id, name FROM prayees WHERE user_id = $1`,
        [userId],
      );
      const categories = await client.query(
        `SELECT id, name FROM categories WHERE user_id = $1`,
        [userId],
      );

      return { userId, prayees: prayees.rows, categories: categories.rows };
    });

    if (!context) return respond(404, { message: "User not found" });

    let splits;
    try {
      splits = await parseRequests(text, context.prayees, context.categories);
    } catch (err) {
      console.error("parseRequests failed", {
        name: err.name,
        status: err.status,
        message: err.message,
        requestId: err.requestID,
      });
      return respond(502, {
        message: "Couldn't process that right now. Please try again.",
      });
    }

    if (splits.length === 0) {
      return respond(422, {
        message: "Couldn't find a prayer request in that text.",
      });
    }

    const created = await withClient((client) =>
      insertRequests(client, context.userId, splits, "manual"),
    );

    return respond(201, created);
  } catch (err) {
    return respond(500, { message: err.message });
  }
};
