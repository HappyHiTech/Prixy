const { test } = require("node:test");
const assert = require("node:assert/strict");

const { validateSplits, MAX_SPLITS } = require("./validateSplits");

const prayees = [{ id: "p-jake", name: "Jake" }];
const categories = [{ id: "c-friends", name: "Friends" }];

test("keeps known ids and trims text", () => {
  const out = validateSplits(
    {
      requests: [
        {
          requestText: "  Jake's job search  ",
          prayeeId: "p-jake",
          categoryId: "c-friends",
        },
      ],
    },
    prayees,
    categories,
  );
  assert.deepEqual(out, [
    {
      requestText: "Jake's job search",
      prayeeId: "p-jake",
      categoryId: "c-friends",
    },
  ]);
});

test("nulls an unknown prayee id but keeps the category", () => {
  const [split] = validateSplits(
    {
      requests: [
        {
          requestText: "Mom's surgery",
          prayeeId: "p-invented",
          categoryId: "c-friends",
        },
      ],
    },
    prayees,
    categories,
  );
  assert.equal(split.prayeeId, null);
  assert.equal(split.categoryId, "c-friends");
});

test("nulls an id taken from the wrong list", () => {
  const [split] = validateSplits(
    {
      requests: [{ requestText: "Jake", prayeeId: null, categoryId: "p-jake" }],
    },
    prayees,
    categories,
  );
  assert.equal(split.categoryId, null);
});

test("drops empty and whitespace-only text", () => {
  const out = validateSplits(
    {
      requests: [
        { requestText: "   ", prayeeId: null, categoryId: null },
        { requestText: "", prayeeId: null, categoryId: null },
      ],
    },
    prayees,
    categories,
  );
  assert.deepEqual(out, []);
});

test(`caps the result at ${MAX_SPLITS}`, () => {
  const requests = Array.from({ length: 25 }, (_, i) => ({
    requestText: `request ${i}`,
    prayeeId: null,
    categoryId: null,
  }));
  assert.equal(
    validateSplits({ requests }, prayees, categories).length,
    MAX_SPLITS,
  );
});

test("throws when requests is missing or not an array", () => {
  assert.throws(() => validateSplits({}, prayees, categories));
  assert.throws(() => validateSplits(null, prayees, categories));
  assert.throws(() =>
    validateSplits({ requests: "nope" }, prayees, categories),
  );
});
