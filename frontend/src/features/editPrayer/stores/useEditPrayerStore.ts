import { create } from 'zustand';

export type EditTarget = 'prayee' | 'category';

type EditPrayerStore = {
  selectedEdit: EditTarget | null;
  setSelectedEdit: (e: EditPrayerStore['selectedEdit']) => void;
};

export const useEditPrayerStore = create<EditPrayerStore>((set) => ({
  selectedEdit: null,
  setSelectedEdit: (e) => set({ selectedEdit: e }),
}));
