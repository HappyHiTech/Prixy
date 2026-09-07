import { create } from 'zustand';

type ActionButtonStore = {
  isActionOpen: boolean;
  toggleAction: () => void;
  closeAction: () => void;
};

export const useActionButtonStore = create<ActionButtonStore>((set) => ({
  isActionOpen: false,
  toggleAction: () => set((state) => ({ isActionOpen: !state.isActionOpen })),
  closeAction: () => set({ isActionOpen: false }),
}));
