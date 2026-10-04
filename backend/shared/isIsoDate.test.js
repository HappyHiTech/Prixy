const { test } = require("node:test");
const assert = require("node:assert/strict");

const { isIsoDate } = require("./isIsoDate");

test("accepts real calendar dates", () => {
  assert.equal(isIsoDate("2026-10-04"), true);
  assert.equal(isIsoDate("2024-02-29"), true);
});

test("rejects dates that do not exist", () => {
  assert.equal(isIsoDate("2026-02-29"), false);
  assert.equal(isIsoDate("2026-13-01"), false);
  assert.equal(isIsoDate("2026-10-32"), false);
});

test("rejects malformed strings", () => {
  assert.equal(isIsoDate("2026-1-4"), false);
  assert.equal(isIsoDate(""), false);
  assert.equal(isIsoDate("2026-10-04T00:00:00Z"), false);
});

test("rejects non-strings", () => {
  assert.equal(isIsoDate(null), false);
  assert.equal(isIsoDate(undefined), false);
  assert.equal(isIsoDate(20261004), false);
});
