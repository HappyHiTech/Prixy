export type PrayerRequestStatus = "inbox" | "active" | "answered";
export type PrayerRequestSourceType = "voice" | "manual";
export type PrayerRequestFrequencyType = "one_time" | "recurring";

export type PrayerRequest = {
  id: string;
  userId: string;
  recipientId: string | null;
  categoryId: string | null;
  requestText: string;
  rawTranscript: string | null;
  status: PrayerRequestStatus;
  sourceType: PrayerRequestSourceType;
  frequencyType: PrayerRequestFrequencyType;
  recurringDays: string[];
  lastPrayedAt: string | null;
  answeredAt: string | null;
  createdAt: string;
};
