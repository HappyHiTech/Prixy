import { create } from 'zustand';

type QCStore = {
  text: string;
  setText: (text: string) => void;
  reset: () => void;
};

export const useQCStore = create<QCStore>((set) => ({
  text: '',
  setText: (text) => set({ text }),
  reset: () => set({ text: '' }),
}));
