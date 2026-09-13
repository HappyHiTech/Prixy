const { Pool } = require("pg");
const { Signer } = require("@aws-sdk/rds-signer");

// Reused across invocations within the same warm Lambda execution
// environment. IAM auth tokens are valid for 15 minutes, so the pool is
// recreated once the token might have expired rather than per-invocation —
// this avoids re-signing a token and re-authenticating on every request.
let cachedPool = null;
let cachedPoolCreatedAt = 0;
const TOKEN_TTL_MS = 14 * 60 * 1000;

async function createPool() {
  const signer = new Signer({
    hostname: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
  });

  const token = await signer.getAuthToken();

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: token,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    max: 3,
    idleTimeoutMillis: 60000,
  });

  pool.on("error", () => {
    cachedPool = null;
  });

  return pool;
}

async function getPool() {
  const tokenExpired = Date.now() - cachedPoolCreatedAt > TOKEN_TTL_MS;

  if (cachedPool && !tokenExpired) {
    return cachedPool;
  }

  const stalePool = cachedPool;
  cachedPool = await createPool();
  cachedPoolCreatedAt = Date.now();

  if (stalePool) {
    stalePool.end().catch(() => {});
  }

  return cachedPool;
}

async function withClient(fn) {
  const pool = await getPool();
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

module.exports = { withClient };
