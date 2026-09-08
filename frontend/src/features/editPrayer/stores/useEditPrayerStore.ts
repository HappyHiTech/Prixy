import { create } from 'zustand';

// Which field's sidebar is open. The prayer being edited comes from the route,
// not from here - this screen only ever edits one prayer.
export type EditTarget = 'prayee' | 'category';

type EditPrayerStore = {
  selectedEdit: EditTarget | null;
  setSelectedEdit: (e: EditPrayerStore['selectedEdit']) => void;
};

export const useEditPrayerStore = create<EditPrayerStore>((set) => ({
  selectedEdit: null,
  setSelectedEdit: (e) => set({ selectedEdit: e }),
}));
