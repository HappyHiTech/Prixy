import { create } from 'zustand';
import { CognitoUser } from 'amazon-cognito-identity-js';

type OnboardingStore = {
  email: string;
  setEmail: (e: string) => void;

  code: string;
  setCode: (c: string) => void;

  pendingUser: CognitoUser | null;
  setPendingUser: (u: CognitoUser | null) => void;

  sendPromise: Promise<CognitoUser> | null;
  setSendPromise: (p: Promise<CognitoUser> | null) => void;

  isSubmitting: boolean;
  setIsSubmitting: (b: boolean) => void;

  error: string | null;
  setError: (e: string | null) => void;

  reset: () => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  email: '',
  setEmail: (e) => set({ email: e }),

  code: '',
  setCode: (c) => set({ code: c }),

  pendingUser: null,
  setPendingUser: (u) => set({ pendingUser: u }),

  sendPromise: null,
  setSendPromise: (p) => set({ sendPromise: p }),

  isSubmitting: false,
  setIsSubmitting: (b) => set({ isSubmitting: b }),

  error: null,
  setError: (e) => set({ error: e }),

  reset: () =>
    set({
      email: '',
      code: '',
      pendingUser: null,
      sendPromise: null,
      isSubmitting: false,
      error: null,
    }),
}));
