const crypto = require("crypto");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({});

function generateCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function parseMetadata(session) {
  const match = /^CODE-(\d{6})-(\d+)$/.exec(
    session?.[0]?.challengeMetadata ?? "",
  );
  if (!match) return null;
  return { code: match[1], issuedAt: Number(match[2]) };
}

exports.handler = async (event) => {
  const previous = parseMetadata(event.request.session);

  let code;
  let issuedAt;

  if (!previous) {
    code = generateCode();
    issuedAt = Date.now();

    await ses.send(
      new SendEmailCommand({
        Source: process.env.SES_FROM_ADDRESS,
        Destination: { ToAddresses: [event.request.userAttributes.email] },
        Message: {
          Subject: { Data: "Your Prixy verification code" },
          // Multipart (text + HTML). Text-only transactional mail scores worse
          // with spam filters, and the "didn't request this" line is expected
          // of legitimate senders - its absence is itself a mild spam signal.
          Body: {
            Text: {
              Data: [
                `Your Prixy verification code is ${code}.`,
                "",
                "It expires in 3 minutes.",
                "",
                "If you didn't request this, you can ignore this email.",
              ].join("\n"),
            },
            Html: {
              Data: [
                '<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#1a1a1a">',
                "<p>Your Prixy verification code is</p>",
                `<p style="font-size:28px;font-weight:600;letter-spacing:4px">${code}</p>`,
                "<p>It expires in 3 minutes.</p>",
                '<p style="color:#888;font-size:12px">If you didn\'t request this, you can ignore this email.</p>',
                "</div>",
              ].join(""),
            },
          },
        },
      }),
    );
  } else {
    code = previous.code;
    issuedAt = previous.issuedAt;
  }

  event.response.privateChallengeParameters = {
    code,
    issuedAt: String(issuedAt),
  };
  event.response.publicChallengeParameters = {
    email: event.request.userAttributes.email,
  };
  event.response.challengeMetadata = `CODE-${code}-${issuedAt}`;

  return event;
};
