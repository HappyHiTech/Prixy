import { create } from 'zustand';

import type {
  PrayerRequest,
  PrayerRequestFrequencyType,
} from '@/types/prayerRequest';

type EditPrayerSnapshot = {
  prayeeId: string | null;
  categoryId: string | null;
  requestText: string;
  frequencyType: PrayerRequestFrequencyType;
  recurringDays: string[];
  answered: boolean;
};

type EditPrayerDraft = EditPrayerSnapshot & {
  prayerId: string;
  snapshot: EditPrayerSnapshot;

  setPrayeeId: (v: string) => void;
  setCategoryId: (v: string) => void;
  setRequestText: (v: string) => void;
  setFrequency: (
    frequencyType: PrayerRequestFrequencyType,
    recurringDays: string[],
  ) => void;
  setAnswered: (v: boolean) => void;

  reset: (prayer: PrayerRequest) => void;
  clear: () => void;
};

const EMPTY: EditPrayerSnapshot = {
  prayeeId: null,
  categoryId: null,
  requestText: '',
  frequencyType: 'one_time',
  recurringDays: [],
  answered: false,
};

export const useEditPrayerDraftStore = create<EditPrayerDraft>((set) => ({
  ...EMPTY,
  prayerId: '',
  snapshot: EMPTY,

  setPrayeeId: (v) => set({ prayeeId: v }),
  setCategoryId: (v) => set({ categoryId: v }),
  setRequestText: (v) => set({ requestText: v }),
  setFrequency: (frequencyType, recurringDays) =>
    set({ frequencyType, recurringDays }),
  setAnswered: (v) => set({ answered: v }),

  reset: (prayer) => {
    const saved: EditPrayerSnapshot = {
      prayeeId: prayer.prayeeId,
      categoryId: prayer.categoryId,
      requestText: prayer.requestText,
      frequencyType: prayer.frequencyType,
      recurringDays: prayer.recurringDays,
      answered: prayer.status === 'answered',
    };

    set({ ...saved, prayerId: prayer.id, snapshot: saved });
  },

  clear: () => set({ ...EMPTY, prayerId: '', snapshot: EMPTY }),
}));

export const selectIsPrayerDraftDirty = (s: EditPrayerDraft) =>
  s.prayeeId !== s.snapshot.prayeeId ||
  s.categoryId !== s.snapshot.categoryId ||
  s.requestText !== s.snapshot.requestText ||
  s.frequencyType !== s.snapshot.frequencyType ||
  s.answered !== s.snapshot.answered ||
  s.recurringDays.join(',') !== s.snapshot.recurringDays.join(',');
