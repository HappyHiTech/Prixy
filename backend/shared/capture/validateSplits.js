const MAX_SPLITS = 20;

function validateSplits(raw, prayees, categories) {
  if (!raw || !Array.isArray(raw.requests)) {
    throw new Error("Model output is missing a requests array");
  }

  const prayeeIds = new Set(prayees.map((p) => p.id));
  const categoryIds = new Set(categories.map((c) => c.id));

  const splits = [];

  for (const item of raw.requests) {
    const requestText =
      typeof item?.requestText === "string" ? item.requestText.trim() : "";
    if (requestText.length === 0) continue;

    splits.push({
      requestText,
      prayeeId: prayeeIds.has(item.prayeeId) ? item.prayeeId : null,
      categoryId: categoryIds.has(item.categoryId) ? item.categoryId : null,
    });
  }
  return splits.slice(0, MAX_SPLITS);
}

module.exports = { validateSplits, MAX_SPLITS };
