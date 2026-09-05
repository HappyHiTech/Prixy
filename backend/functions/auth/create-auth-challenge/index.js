const crypto = require("crypto");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({});

function generateCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

exports.handler = async (event) => {
  let code;

  if (!event.request.session || event.request.session.length === 0) {
    code = generateCode();

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
    code = event.request.session[0].challengeMetadata.replace("CODE-", "");
  }

  event.response.privateChallengeParameters = { code };
  event.response.publicChallengeParameters = {
    email: event.request.userAttributes.email,
  };
  event.response.challengeMetadata = `CODE-${code}`;

  return event;
};
