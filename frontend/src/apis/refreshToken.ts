import { useAuthStore } from '@/stores/useAuthStore';

let inFlight: Promise<string | null> | null = null;

export function refreshTokenOnce(): Promise<string | null> {
  inFlight ??= useAuthStore
    .getState()
    .refreshFromStorage()
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}
