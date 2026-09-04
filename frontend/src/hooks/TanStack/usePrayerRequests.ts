import { useQuery } from "@tanstack/react-query";

import { fetchPrayerRequests } from "@/apis/prayerRequest.api";

export const usePrayerRequests = () => {
  return useQuery({
    queryKey: ["prayerRequests"],
    queryFn: fetchPrayerRequests,
  });
};
