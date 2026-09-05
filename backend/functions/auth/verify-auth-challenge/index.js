const crypto = require("crypto");

exports.handler = async (event) => {
  const expected = event.request.privateChallengeParameters.code;
  const provided = event.request.challengeAnswer || "";

  event.response.answerCorrect =
    provided.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));

  return event;
};
