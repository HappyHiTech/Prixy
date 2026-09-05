// Passwordless: the emailed CUSTOM_AUTH code IS the verification, so there is
// no separate confirmation step. Auto-confirm at signup, otherwise the user
// sits UNCONFIRMED and InitiateAuth rejects with "User is not confirmed."
exports.handler = async (event) => {
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  return event;
};
