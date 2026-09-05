import {
  CognitoUser,
  CognitoUserPool,
  CognitoUserAttribute,
  AuthenticationDetails,
} from 'amazon-cognito-identity-js';

import type { AuthTokens } from '@/types/auth';

const USER_POOL_ID = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID;

if (!USER_POOL_ID || !CLIENT_ID) {
  throw new Error(
    'EXPO_PUBLIC_COGNITO_USER_POOL_ID / _CLIENT_ID missing from frontend/.env',
  );
}

const userPool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
});

function randomPassword(): string {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(24));
  const body = Array.from(bytes, (b) => b.toString(36))
    .join('')
    .slice(0, 20);
  return `Aa1!${body}`;
}

function signUp(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    userPool.signUp(
      email,
      randomPassword(),
      [new CognitoUserAttribute({ Name: 'email', Value: email })],
      [],
      (err) => {
        if (err && err.name !== 'UsernameExistsException') return reject(err);
        resolve();
      },
    );
  });
}

export function startSignIn(email: string): Promise<CognitoUser> {
  return signUp(email).then(
    () =>
      new Promise((resolve, reject) => {
        const user = new CognitoUser({ Username: email, Pool: userPool });
        user.setAuthenticationFlowType('CUSTOM_AUTH');

        user.initiateAuth(new AuthenticationDetails({ Username: email }), {
          onSuccess: () => resolve(user),
          onFailure: (err) => reject(err),
          customChallenge: () => resolve(user),
        });
      }),
  );
}

export function answerCode(
  user: CognitoUser,
  code: string,
): Promise<AuthTokens> {
  return new Promise((resolve, reject) => {
    user.sendCustomChallengeAnswer(code, {
      onSuccess: (session) =>
        resolve({
          idToken: session.getIdToken().getJwtToken(),
          accessToken: session.getAccessToken().getJwtToken(),
          refreshToken: session.getRefreshToken().getToken(),
        }),
      onFailure: (err) => reject(err),
      customChallenge: () => reject(new Error('Incorrect code')),
    });
  });
}
