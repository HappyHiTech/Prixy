const { Client } = require("pg");
const { Signer } = require("@aws-sdk/rds-signer");

let cachedClient = null;

async function connect() {
  const signer = new Signer({
    hostname: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
  });

  const token = await signer.getAuthToken();

  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: token,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  await client.connect();
  return client;
}

async function getClient() {
  if (cachedClient) {
    try {
      await cachedClient.query("SELECT 1");
      return cachedClient;
    } catch {
      cachedClient = null;
    }
  }

  cachedClient = await connect();
  cachedClient.on("error", () => {
    cachedClient = null;
  });

  return cachedClient;
}

async function withClient(fn) {
  const client = await getClient();
  return fn(client);
}

module.exports = { connect, withClient };
