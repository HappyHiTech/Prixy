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
    const deleted = await withClient(async (client) => {
      const result = await client.query(
        `DELETE FROM prayer_requests pr
           USING users u
          WHERE pr.user_id = u.id
            AND u.cognito_sub = $1
            AND pr.id = $2
        RETURNING pr.id`,
        [sub, id],
      );

      return result.rows.length > 0;
    });

    if (!deleted) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Prayer request not found" }),
      };
    }

    return { statusCode: 204, headers: {}, body: "" };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: err.message }),
    };
  }
};
