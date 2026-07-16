/**
 * Detects if the current device time is before Dhuhr (typically 12:00 PM).
 * Used to recommend Morning Adhkar.
 */
export const isBeforeDhuhr = () => {
  const hours = new Date().getHours();
  return hours < 12;
};

/**
 * Detects if the current device time is after Asr/Maghrib (typically 3:00 PM or 15:00 onwards).
 * Used to recommend Evening Adhkar.
 */
export const isAfterAsrMaghrib = () => {
  const hours = new Date().getHours();
  return hours >= 15;
};

/**
 * Calculates the number of milliseconds remaining from the current time
 * until the next midnight. Used to invalidate today's Hadith cache.
 */
export const getMsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Sets to 12:00 AM of the next day
  return midnight.getTime() - now.getTime();
};
