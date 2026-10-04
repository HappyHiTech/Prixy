import type { PrayerRequestFrequencyType } from '@/types/prayerRequest';

export type DeckPrayer = {
  id: string;
  requestText: string;
  frequencyType: PrayerRequestFrequencyType;
  createdAt: string;
  prayeeId: string;
  prayeeName: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
};

export type Deck = {
  prayedToday: number;
  cards: DeckPrayer[];
};

export type PrayAction = 'done' | 'repeat_tomorrow';
