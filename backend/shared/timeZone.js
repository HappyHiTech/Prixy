const isValidTimeZone = (tz) => {
  if (typeof tz !== "string" || tz.length === 0) return false;
  if (tz.startsWith("+") || tz.startsWith("-")) return false;

  try {
    // Postgres reads a bare offset in POSIX style with the sign flipped.
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

module.exports = { isValidTimeZone };
