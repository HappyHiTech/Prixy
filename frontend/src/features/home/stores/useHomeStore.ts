import { create } from 'zustand';

import type { PrayerRequestStatus } from '@/types/prayerRequest';
import type { EditTarget } from '@/features/editPrayer/stores/useEditPrayerStore';

export type HomeSegment = Extract<PrayerRequestStatus, 'inbox' | 'active'>;

type HomeStore = {
  activeSegment: HomeSegment;
  setActiveSegment: (s: HomeStore['activeSegment']) => void;

  selectedPrayerId: string | null;
  setSelectedPrayerId: (p: HomeStore['selectedPrayerId']) => void;

  selectedEdit: EditTarget | null;
  setSelectedEdit: (e: HomeStore['selectedEdit']) => void;
};

export const useHomeStore = create<HomeStore>((set) => ({
  activeSegment: 'inbox',
  setActiveSegment: (s) => set({ activeSegment: s }),

  selectedPrayerId: null,
  setSelectedPrayerId: (p) => set({ selectedPrayerId: p }),

  selectedEdit: null,
  setSelectedEdit: (e) => set({ selectedEdit: e }),
}));
