import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

import { clearCachedUser, refreshSession } from '@/apis/auth.api';
import type { AuthTokens } from '@/types/auth';

const ID_TOKEN_KEY = `prixy.idToken`;
const REFRESH_TOKEN_KEY = `prixy.refreshToken`;
const EMAIL_KEY = `prixy.email`;

type AuthStore = {
  idToken: string | null;
  isBootstrapping: boolean;

  signIn: (email: string, tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
  bootstrap: () => Promise<void>;
};

const BASE64_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function decodeBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  let bits = 0;
  let bitCount = 0;
  let output = '';

  for (const char of normalized) {
    const value = BASE64_ALPHABET.indexOf(char);
    if (value === -1) continue;

    bits = (bits << 6) | value;
    bitCount += 6;

    if (bitCount >= 8) {
      bitCount -= 8;
      output += String.fromCharCode((bits >> bitCount) & 0xff);
    }
  }

  return output;
}

function isExpired(idToken: string): boolean {
  try {
    const [, payload] = idToken.split('.');
    const { exp } = JSON.parse(decodeBase64Url(payload)) as { exp?: number };
    if (!exp) return true;
    return Date.now() >= exp * 1000 - 60_000;
  } catch {
    return true;
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  idToken: null,
  isBootstrapping: true,

  signIn: async (email, tokens) => {
    await SecureStore.setItemAsync(ID_TOKEN_KEY, tokens.idToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
    await SecureStore.setItemAsync(EMAIL_KEY, email);
    set({ idToken: tokens.idToken });
  },
  signOut: async () => {
    clearCachedUser();
    await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(EMAIL_KEY);
    set({ idToken: null });
  },

  bootstrap: async () => {
    const idToken = await SecureStore.getItemAsync(ID_TOKEN_KEY);

    if (!idToken) {
      set({ idToken: null, isBootstrapping: false });
      return;
    }

    if (!isExpired(idToken)) {
      set({ idToken, isBootstrapping: false });
      return;
    }

    const [email, refreshToken] = await Promise.all([
      SecureStore.getItemAsync(EMAIL_KEY),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);

    if (!email || !refreshToken) {
      await get().signOut();
      set({ isBootstrapping: false });
      return;
    }

    try {
      const tokens = await refreshSession(email, refreshToken);
      await get().signIn(email, tokens);
    } catch {
      await get().signOut();
    } finally {
      set({ isBootstrapping: false });
    }
  },
}));

export const getIdToken = () => useAuthStore.getState().idToken;
