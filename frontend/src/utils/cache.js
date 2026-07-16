import { getMsUntilMidnight } from './date';

const CACHE_PREFIX = 'islamic_app_v2_';

/**
 * Saves data to localStorage with a Time-To-Live (TTL).
 * @param {string} key - Cache key identifier
 * @param {any} data - Data to cache
 * @param {number} [ttlMs] - Time to live in milliseconds
 */
export const setCache = (key, data, ttlMs = null) => {
  try {
    const expiry = ttlMs ? Date.now() + ttlMs : null;
    const cacheItem = {
      data,
      expiry,
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Failed to set cache:', error);
  }
};

/**
 * Retrieves data from localStorage.
 * If the data has expired, it is deleted and null is returned, 
 * UNLESS the browser is offline (in which case it serves the stale cache),
 * or forceIgnoreExpiry is set to true.
 * @param {string} key - Cache key identifier
 * @param {boolean} [forceIgnoreExpiry] - Bypass expiration check
 */
export const getCache = (key, forceIgnoreExpiry = false) => {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    
    const cacheItem = JSON.parse(raw);
    if (!cacheItem) return null;
    
    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
    const hasExpired = cacheItem.expiry && Date.now() > cacheItem.expiry;
    
    if (hasExpired && !forceIgnoreExpiry && !isOffline) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }
    
    return cacheItem.data;
  } catch (error) {
    console.error('Failed to get cache:', error);
    return null;
  }
};

/**
 * Removes a specific item from cache.
 * @param {string} key 
 */
export const removeCache = (key) => {
  try {
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch (error) {
    console.error('Failed to remove cache:', error);
  }
};

/**
 * Clears all application caches prefix-matched by CACHE_PREFIX.
 */
export const clearAllCache = () => {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
};

/**
 * Caches today's Sahih hadith, set to automatically expire at midnight.
 * @param {object} hadith 
 */
export const setTodayHadith = (hadith) => {
  const ttl = getMsUntilMidnight();
  if (ttl > 0) {
    setCache('today_hadith', hadith, ttl);
  }
};

/**
 * Retrieves today's cached Sahih hadith.
 */
export const getTodayHadith = () => {
  return getCache('today_hadith');
};

/**
 * Clears today's cached hadith.
 */
export const clearTodayHadith = () => {
  removeCache('today_hadith');
};
