const { isValidTimeZone } = require("../timeZone");

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const PRAY_ACTIONS = ["done", "repeat_tomorrow"];

const parsePrayRequest = (event) => {
  const id = event.pathParameters?.id;

  if (!id || !UUID_PATTERN.test(id)) {
    return { error: "Invalid prayer request id" };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? "{}");
  } catch {
    return { error: "Request body must be valid JSON" };
  }

  if (!PRAY_ACTIONS.includes(body?.action)) {
    return {
      error: `Invalid action. Expected one of: ${PRAY_ACTIONS.join(", ")}`,
    };
  }

  if (!isValidTimeZone(body.tz)) {
    return {
      error: "Invalid tz. Expected an IANA time zone like America/Los_Angeles",
    };
  }

  return { id, action: body.action, tz: body.tz };
};

module.exports = { parsePrayRequest };
