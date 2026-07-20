import { useState, useEffect, useRef, useCallback } from 'react';
import * as hadithService from '../services/hadithService';
import * as cache from '../utils/cache';

/**
 * Custom hook to manage the state of the Daily Sahih Hadith.
 * Coordinates cache lookup (invalidates at midnight), smart retry logic,
 * manual refreshes, and API loading/error boundaries.
 */
export const useHadith = () => {
  const [hadith, setHadith] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  // Cleanup abort signal on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  /**
   * Loads a random Sahih Hadith.
   * Looks up the midnight-invalidation cache first. If a refresh is forced,
   * it clears today's cache and makes new API queries.
   * @param {boolean} [forceRefresh=false]
   */
  const loadHadith = useCallback(async (forceRefresh = false) => {
    if (forceRefresh) {
      cache.clearTodayHadith();
    } else {
      // Try to retrieve from today's cache ONLY when not forcing a refresh
      const cached = cache.getTodayHadith();
      if (cached) {
        setHadith(cached);
        setError(null);
        return;
      }
    }

    // Abort any active Hadith loading requests
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const data = await hadithService.fetchRandomSahihHadith({
        forceRefresh,
        signal: abortRef.current.signal,
      });
      setHadith(data);
      cache.setTodayHadith(data);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.message === 'canceled') {
        return; // Request was aborted, ignore state changes
      }
      
      console.error('Error fetching Sahih Hadith:', err);
      setError(err.message || 'No authentic hadith available right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch Hadith automatically when the hook mounts
  useEffect(() => {
    loadHadith();
  }, [loadHadith]);

  const refreshHadith = useCallback(() => {
    return loadHadith(true);
  }, [loadHadith]);

  return {
    hadith,
    loading,
    error,
    refreshHadith,
  };
};

export default useHadith;
