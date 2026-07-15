import { useState, useEffect, useRef, useCallback } from 'react';
import * as adhkarService from '../services/adhkarService';
import * as cache from '../utils/cache';

const CATEGORIES_CACHE_KEY = 'adhkar_categories';
const CATEGORIES_TTL = 1000 * 60 * 60 * 24; // 24 hours
const DUAS_TTL = 1000 * 60 * 60 * 24 * 7; // 7 days (duas change rarely)

/**
 * Custom hook managing Adhkar categories and Category Duas state.
 * Implements client-side caching, offline support, request cancellation,
 * and loading/error states.
 */
export const useAdhkar = () => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoriesError, setCategoriesError] = useState(null);

  const [categoryData, setCategoryData] = useState(null); // { category, duas }
  const [loadingDuas, setLoadingDuas] = useState(false);
  const [duasError, setDuasError] = useState(null);

  const categoriesAbortRef = useRef(null);
  const duasAbortRef = useRef(null);

  // Clean up abort controllers on unmount
  useEffect(() => {
    return () => {
      if (categoriesAbortRef.current) categoriesAbortRef.current.abort();
      if (duasAbortRef.current) duasAbortRef.current.abort();
    };
  }, []);

  /**
   * Loads the complete list of dua categories.
   * Checks the cache first. If a fresh cache item is found, it uses it.
   * Falls back to expired cache if offline or an error occurs.
   * @param {boolean} [forceRefresh=false] - If true, bypasses the cache to fetch directly from API
   */
  const loadCategories = useCallback(async (forceRefresh = false) => {
    // Try to get fresh cache
    const cached = cache.getCache(CATEGORIES_CACHE_KEY, forceRefresh);
    if (cached && !forceRefresh) {
      setCategories(cached);
      setCategoriesError(null);
      return;
    }

    // Cancel existing requests for categories
    if (categoriesAbortRef.current) {
      categoriesAbortRef.current.abort();
    }
    categoriesAbortRef.current = new AbortController();

    setLoadingCategories(true);
    setCategoriesError(null);

    try {
      const data = await adhkarService.fetchCategories({
        signal: categoriesAbortRef.current.signal,
      });
      setCategories(data);
      cache.setCache(CATEGORIES_CACHE_KEY, data, CATEGORIES_TTL);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.message === 'canceled') {
        return; // Request was aborted, ignore state changes
      }
      
      console.error('Error fetching categories:', err);
      
      // Fallback to cached version (even if expired) since we encountered an error / are offline
      const fallback = cache.getCache(CATEGORIES_CACHE_KEY, true);
      if (fallback) {
        setCategories(fallback);
      } else {
        setCategoriesError('Failed to load categories. Please check your network and try again.');
      }
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  /**
   * Loads duas for a specific category.
   * Checks local storage cache first to avoid duplicate API calls.
   * Falls back to expired cache if offline or an error occurs.
   * @param {string} categoryId - ID of category to load
   * @param {boolean} [forceRefresh=false] - If true, bypasses cache
   */
  const loadCategoryDuas = useCallback(async (categoryId, forceRefresh = false) => {
    if (!categoryId) return;
    const cacheKey = `adhkar_category_${categoryId}`;
    
    // Check cache
    const cached = cache.getCache(cacheKey, forceRefresh);
    if (cached && !forceRefresh) {
      setCategoryData(cached);
      setDuasError(null);
      return;
    }

    // Cancel any active dua loading request
    if (duasAbortRef.current) {
      duasAbortRef.current.abort();
    }
    duasAbortRef.current = new AbortController();

    setLoadingDuas(true);
    setDuasError(null);

    try {
      const data = await adhkarService.fetchCategoryDuas(categoryId, {
        signal: duasAbortRef.current.signal,
      });
      setCategoryData(data);
      cache.setCache(cacheKey, data, DUAS_TTL);
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError' || err.message === 'canceled') {
        return; // Request was aborted, ignore state changes
      }
      
      console.error(`Error fetching duas for category ${categoryId}:`, err);
      
      // Offline fallback: load stale cache
      const fallback = cache.getCache(cacheKey, true);
      if (fallback) {
        setCategoryData(fallback);
      } else {
        setDuasError('Failed to load duas. Please check your network and try again.');
      }
    } finally {
      setLoadingDuas(false);
    }
  }, []);

  return {
    categories,
    loadingCategories,
    categoriesError,
    loadCategories,
    
    categoryData,
    loadingDuas,
    duasError,
    loadCategoryDuas,
  };
};
export default useAdhkar;
