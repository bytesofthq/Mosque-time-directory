import axios from 'axios';
import { translateText } from '../utils/translation';

const BASE_URL = 'https://ummahapi.com/api';

/**
 * Fetches all dua categories from UmmahAPI.
 * @param {object} [options] - Optional configurations
 * @param {AbortSignal} [options.signal] - Abort controller signal for request cancellation
 * @returns {Promise<Array>} List of categories
 */
export const fetchCategories = async (options = {}) => {
  const response = await axios.get(`${BASE_URL}/duas/categories`, {
    signal: options.signal,
  });
  if (response.data && response.data.success) {
    return response.data.data.categories;
  }
  throw new Error(response.data?.message || 'Failed to fetch categories');
};

/**
 * Fetches all duas belonging to a specific category.
 * Translates each Dua's title and description into Hindi and Urdu in parallel.
 * @param {string} categoryId - The unique ID of the category (e.g. 'morning')
 * @param {object} [options] - Optional configurations
 * @param {AbortSignal} [options.signal] - Abort controller signal for request cancellation
 * @returns {Promise<object>} Category info and list of translated duas
 */
export const fetchCategoryDuas = async (categoryId, options = {}) => {
  const response = await axios.get(`${BASE_URL}/duas/category/${categoryId}`, {
    signal: options.signal,
  });
  if (response.data && response.data.success) {
    const data = response.data.data;
    
    // Dynamically translate all duas in the list
    if (data.duas && Array.isArray(data.duas)) {
      const translatedDuas = await Promise.all(
        data.duas.map(async (dua) => {
          try {
            const [hiTitle, urTitle, hiText, urText] = await Promise.all([
              translateText(dua.title, 'hi', options.signal),
              translateText(dua.title, 'ur', options.signal),
              translateText(dua.translation, 'hi', options.signal),
              translateText(dua.translation, 'ur', options.signal),
            ]);

            dua.translations = {
              title: {
                en: dua.title,
                hi: hiTitle,
                ur: urTitle,
              },
              text: {
                en: dua.translation,
                hi: hiText,
                ur: urText,
              },
            };
          } catch (err) {
            if (axios.isCancel(err)) {
              throw err;
            }
            // Fallback to original text on failure
            dua.translations = {
              title: { en: dua.title, hi: dua.title, ur: dua.title },
              text: { en: dua.translation, hi: dua.translation, ur: dua.translation },
            };
          }
          return dua;
        })
      );
      data.duas = translatedDuas;
    }
    
    return data;
  }
  throw new Error(response.data?.message || 'Failed to fetch duas for this category');
};

