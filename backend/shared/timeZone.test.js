const { test } = require("node:test");
const assert = require("node:assert/strict");

const { isValidTimeZone } = require("./timeZone");

test("accepts IANA zone names", () => {
  assert.equal(isValidTimeZone("America/Los_Angeles"), true);
  assert.equal(isValidTimeZone("Asia/Singapore"), true);
  assert.equal(isValidTimeZone("UTC"), true);
});

test("rejects unknown zones", () => {
  assert.equal(isValidTimeZone("Mars/Olympus_Mons"), false);
});

test("rejects offsets, which Postgres would read with the sign flipped", () => {
  assert.equal(isValidTimeZone("+05:00"), false);
  assert.equal(isValidTimeZone("-08:00"), false);
});

test("rejects empty and non-string values", () => {
  for (const value of ["", undefined, null, 42]) {
    assert.equal(isValidTimeZone(value), false);
  }
});
