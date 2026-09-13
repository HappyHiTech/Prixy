import { create } from 'zustand';

import type { PrayerRequestStatus } from '@/types/prayerRequest';

type GalleryStore = {
  prayeeId: string | null;
  setPrayeeId: (i: GalleryStore['prayeeId']) => void;

  categoryId: string | null;
  setCategoryId: (i: GalleryStore['categoryId']) => void;

  status: PrayerRequestStatus | null;
  setStatus: (s: GalleryStore['status']) => void;
};

export const useGalleryStore = create<GalleryStore>((set) => ({
  prayeeId: null,
  setPrayeeId: (i) => set({ prayeeId: i }),

  categoryId: null,
  setCategoryId: (i) => set({ categoryId: i }),

  status: null,
  setStatus: (s) => set({ status: s }),
}));
