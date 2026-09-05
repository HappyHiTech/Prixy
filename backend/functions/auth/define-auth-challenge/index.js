const MAX_ATTEMPTS = 3;

exports.handler = async (event) => {
  const session = event.request.session || [];

  if (session.length === 0) {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";
  } else if (session[session.length - 1].challengeResult === true) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else if (session.length >= MAX_ATTEMPTS) {
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  } else {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";
  }

  return event;
};
