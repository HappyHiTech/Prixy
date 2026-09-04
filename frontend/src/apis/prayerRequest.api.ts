import apiFetch from "./apiClient";

import type { PrayerRequest } from "@/types/prayerRequest";

export async function fetchPrayerRequests(): Promise<PrayerRequest[]> {
  return apiFetch<PrayerRequest[]>("/prayers");
}
