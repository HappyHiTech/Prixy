const { withClient } = require("./shared/db");

/**
 * DEV-ONLY. Runs arbitrary SQL against the Prixy database.
 *
 * This function is deliberately NOT wired to API Gateway - the only way to
 * reach it is `aws lambda invoke`, which requires IAM credentials. Do not add
 * an Events block, and do not deploy this to a stack holding real user data.
 *
 * Payload: { "sql": "SELECT ...", "params": ["optional", "bind", "values"] }
 */
exports.handler = async (event) => {
  try {
    const { sql, params = [] } = event || {};

    if (typeof sql !== "string" || sql.trim() === "") {
      return {
        status: "error",
        message: 'payload must include a non-empty "sql" string',
      };
    }

    const result = await withClient((client) => client.query(sql, params));

    return {
      status: "ok",
      command: result.command,
      rowCount: result.rowCount,
      rows: result.rows,
    };
  } catch (err) {
    return { status: "error", message: err.message };
  }
};
