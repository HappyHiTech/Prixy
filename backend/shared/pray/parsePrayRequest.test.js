const { test } = require("node:test");
const assert = require("node:assert/strict");

const { parsePrayRequest } = require("./parsePrayRequest");

const ID = "3f2b8c1e-4a5d-4e6f-8a9b-0c1d2e3f4a5b";
const TZ = "America/Los_Angeles";

const event = ({ id = ID, body } = {}) => ({
  pathParameters: { id },
  body: body === undefined ? JSON.stringify({ action: "done", tz: TZ }) : body,
});

test("parses a valid done request", () => {
  assert.deepEqual(parsePrayRequest(event()), { id: ID, action: "done", tz: TZ });
});

test("parses repeat_tomorrow", () => {
  const result = parsePrayRequest(
    event({ body: JSON.stringify({ action: "repeat_tomorrow", tz: TZ }) }),
  );
  assert.equal(result.action, "repeat_tomorrow");
});

test("rejects a missing or non-uuid id", () => {
  assert.match(parsePrayRequest(event({ id: "abc" })).error, /id/);
  assert.match(parsePrayRequest({ body: "{}" }).error, /id/);
});

test("rejects unknown actions", () => {
  const result = parsePrayRequest(
    event({ body: JSON.stringify({ action: "skip", tz: TZ }) }),
  );
  assert.match(result.error, /action/);
});

test("rejects an invalid tz", () => {
  const result = parsePrayRequest(
    event({ body: JSON.stringify({ action: "done", tz: "Nowhere/Land" }) }),
  );
  assert.match(result.error, /tz/);
});

test("rejects a body that isn't JSON", () => {
  assert.match(parsePrayRequest(event({ body: "not json" })).error, /JSON/);
});

test("rejects a missing body", () => {
  assert.match(parsePrayRequest(event({ body: null })).error, /action/);
});
