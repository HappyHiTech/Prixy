const pad = (n: number) => String(n).padStart(2, '0');

// The device's local calendar date as "YYYY-MM-DD".
export const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
