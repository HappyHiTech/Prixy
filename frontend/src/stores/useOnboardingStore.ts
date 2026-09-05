import { create } from 'zustand';

type OnboardingStore = {
  email: string;
  setEmail: (e: string) => void;

  code: string;
  setCode: (c: string) => void;
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  email: '',
  setEmail: (e) => set({ email: e }),

  code: '',
  setCode: (c) => set({ code: c }),
}));
