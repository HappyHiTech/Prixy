const DAY_MS = 24 * 60 * 60 * 1000;

export const daysSince = (iso: string) => {
  const then = new Date(iso);
  const now = new Date();

  const thenDay = new Date(then.getFullYear(), then.getMonth(), then.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.round((today.getTime() - thenDay.getTime()) / DAY_MS);
};
