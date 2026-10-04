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
  prayAgain: boolean;
};

type EditPrayerDraft = EditPrayerSnapshot & {
  prayerId: string;
  snapshot: EditPrayerSnapshot;
  // Read-only facts from the server (not part of the editable snapshot).
  canPrayAgain: boolean;
  lastPrayedAt: string | null;

  setPrayeeId: (v: string) => void;
  setCategoryId: (v: string) => void;
  setRequestText: (v: string) => void;
  setFrequency: (
    frequencyType: PrayerRequestFrequencyType,
    recurringDays: string[],
  ) => void;
  setAnswered: (v: boolean) => void;
  togglePrayAgain: () => void;

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
  prayAgain: false,
};

export const useEditPrayerDraftStore = create<EditPrayerDraft>((set) => ({
  ...EMPTY,
  prayerId: '',
  snapshot: EMPTY,
  canPrayAgain: false,
  lastPrayedAt: null,

  setPrayeeId: (v) => set({ prayeeId: v }),
  setCategoryId: (v) => set({ categoryId: v }),
  setRequestText: (v) => set({ requestText: v }),
  setFrequency: (frequencyType, recurringDays) =>
    set({ frequencyType, recurringDays, prayAgain: false }),
  setAnswered: (v) => set({ answered: v }),
  togglePrayAgain: () => set((s) => ({ prayAgain: !s.prayAgain })),

  reset: (prayer) => {
    const saved: EditPrayerSnapshot = {
      prayeeId: prayer.prayeeId,
      categoryId: prayer.categoryId,
      requestText: prayer.requestText,
      frequencyType: prayer.frequencyType,
      recurringDays: prayer.recurringDays,
      answered: prayer.status === 'answered',
      prayAgain: false,
    };

    set({
      ...saved,
      prayerId: prayer.id,
      snapshot: saved,
      canPrayAgain: prayer.lastPrayedAt !== null && prayer.repeatOn === null,
      lastPrayedAt: prayer.lastPrayedAt,
    });
  },

  clear: () =>
    set({
      ...EMPTY,
      prayerId: '',
      snapshot: EMPTY,
      canPrayAgain: false,
      lastPrayedAt: null,
    }),
}));

export const selectIsPrayerDraftDirty = (s: EditPrayerDraft) =>
  s.prayeeId !== s.snapshot.prayeeId ||
  s.categoryId !== s.snapshot.categoryId ||
  s.requestText !== s.snapshot.requestText ||
  s.frequencyType !== s.snapshot.frequencyType ||
  s.answered !== s.snapshot.answered ||
  s.prayAgain !== s.snapshot.prayAgain ||
  s.recurringDays.join(',') !== s.snapshot.recurringDays.join(',');

export const selectIsOnceDormant = (s: EditPrayerDraft) =>
  s.frequencyType === 'one_time' && !s.answered && s.canPrayAgain;
