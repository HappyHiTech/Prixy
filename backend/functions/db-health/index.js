const { withClient } = require("./shared/db");

exports.handler = async () => {
  try {
    const rows = await withClient((client) =>
      client.query("SELECT 1 AS ok").then((r) => r.rows),
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "connected", result: rows }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "error", message: err.message }),
    };
  }
};
