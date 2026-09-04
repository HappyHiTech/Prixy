const fs = require("fs");
const path = require("path");
const { withClient } = require("./shared/db");

const SQL_DIR = path.join(__dirname, "sql");

exports.handler = async () => {
  try {
    const files = fs
      .readdirSync(SQL_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const applied = await withClient(async (client) => {
      const results = [];
      for (const file of files) {
        const sql = fs.readFileSync(path.join(SQL_DIR, file), "utf8");
        await client.query("BEGIN");
        try {
          await client.query(sql);
          await client.query("COMMIT");
          results.push({ file, status: "ok" });
        } catch (err) {
          await client.query("ROLLBACK");
          throw new Error(`${file} failed: ${err.message}`);
        }
      }
      return results;
    });

    return { status: "ok", applied };
  } catch (err) {
    return { status: "error", message: err.message };
  }
};
