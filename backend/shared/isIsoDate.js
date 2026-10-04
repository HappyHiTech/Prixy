const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// True for a "YYYY-MM-DD" string naming a real calendar date.
const isIsoDate = (value) => {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;

  // Postgres `::date` has no year 0000.
  if (value.startsWith("0000")) return false;

  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

module.exports = { isIsoDate };
