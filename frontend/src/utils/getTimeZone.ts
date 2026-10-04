// Some older Hermes builds return undefined here.
export const getTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
