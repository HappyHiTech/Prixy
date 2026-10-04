const { test } = require("node:test");
const assert = require("node:assert/strict");

const { isValidTimeZone, isUnknownTimeZoneError } = require("./timeZone");

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

test("recognises Postgres's unknown time zone error", () => {
  const err = Object.assign(new Error('time zone "Foo/Bar" not recognized'), {
    code: "22023",
  });
  assert.equal(isUnknownTimeZoneError(err), true);
});

test("ignores other invalid-parameter and unrelated errors", () => {
  const otherParam = Object.assign(new Error("invalid value for parameter"), {
    code: "22023",
  });
  assert.equal(isUnknownTimeZoneError(otherParam), false);
  assert.equal(isUnknownTimeZoneError(new Error("time zone boom")), false);
  assert.equal(isUnknownTimeZoneError(undefined), false);
});
