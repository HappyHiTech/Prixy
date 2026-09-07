const { withClient } = require("./shared/db");

/**
 * DEV-ONLY. Drops every table in the public schema.
 *
 * Deliberately NOT wired to API Gateway - reachable only via `aws lambda
 * invoke`, which requires IAM credentials. Never deploy to a stack holding
 * real user data.
 *
 * Payload: { "confirm": "DROP EVERYTHING" }
 */
exports.handler = async (event) => {
  try {
    if (!event || event.confirm !== "DROP EVERYTHING") {
      return {
        status: "error",
        message: 'refusing to run: payload must be {"confirm":"DROP EVERYTHING"}',
      };
    }

    const dropped = await withClient(async (client) => {
      const { rows } = await client.query(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
      );
      const names = rows.map((r) => r.tablename);
      if (names.length > 0) {
        const quoted = names.map((n) => `"${n.replace(/"/g, '""')}"`).join(", ");
        await client.query(`DROP TABLE IF EXISTS ${quoted} CASCADE`);
      }
      return names;
    });

    return { status: "ok", dropped };
  } catch (err) {
    return { status: "error", message: err.message };
  }
};
