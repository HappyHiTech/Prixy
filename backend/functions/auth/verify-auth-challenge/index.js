const crypto = require("crypto");

const CODE_PATTERN = /^\d{6}$/;
const CODE_TTL_MS = 3 * 60 * 1000;

exports.handler = async (event) => {
  const expected = event.request.privateChallengeParameters?.code ?? "";
  const issuedAt = Number(
    event.request.privateChallengeParameters?.issuedAt ?? 0,
  );
  const provided = event.request.challengeAnswer || "";

  let correct = false;

  if (
    CODE_PATTERN.test(provided) &&
    CODE_PATTERN.test(expected) &&
    issuedAt > 0 &&
    Date.now() - issuedAt <= CODE_TTL_MS
  ) {
    correct = crypto.timingSafeEqual(
      Buffer.from(provided, "utf8"),
      Buffer.from(expected, "utf8"),
    );
  }

  event.response.answerCorrect = correct;

  return event;
};
