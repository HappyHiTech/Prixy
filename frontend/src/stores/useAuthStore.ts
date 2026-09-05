import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

import type { AuthTokens } from '@/types/auth';

const ID_TOKEN_KEY = `prixy.idToken`;
const REFRESH_TOKEN_KEY = `prixy.refreshToken`;

type AuthStore = {
  idToken: string | null;
  isBootstrapping: boolean;

  signIn: (tokens: AuthTokens) => Promise<void>;
  signOut: () => Promise<void>;
  bootstrap: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  idToken: null,
  isBootstrapping: true,

  signIn: async (tokens) => {
    await SecureStore.setItemAsync(ID_TOKEN_KEY, tokens.idToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken);
    set({ idToken: tokens.idToken });
  },
  signOut: async () => {
    await SecureStore.deleteItemAsync(ID_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    set({ idToken: null });
  },

  bootstrap: async () => {
    const idToken = await SecureStore.getItemAsync(ID_TOKEN_KEY);
    set({ idToken, isBootstrapping: false });
  },
}));

export const getIdToken = () => useAuthStore.getState().idToken;
