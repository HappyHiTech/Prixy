import { create } from 'zustand';

import type { PrayerRequestStatus } from '@/types/prayerRequest';

export type HomeSegment = Extract<PrayerRequestStatus, 'inbox' | 'active'>;

type HomeStore = {
  activeSegment: HomeSegment;
  setActiveSegment: (s: HomeStore['activeSegment']) => void;
};

export const useHomeStore = create<HomeStore>((set) => ({
  activeSegment: 'inbox',
  setActiveSegment: (s) => set({ activeSegment: s }),
}));
