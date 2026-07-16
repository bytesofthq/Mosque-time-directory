import axios from 'axios';
import { translateText } from '../utils/translation';

const HADITH_API_URL = 'https://ummahapi.com/api/hadith/random';
const MAX_RETRIES = 5;

/**
 * Fetches a random Hadith from the UmmahAPI.
 * Retries up to 5 times in a single operation if the returned hadith is not graded "Sahih".
 * If no Sahih hadith is retrieved after 5 attempts, it throws a user-friendly message.
 * Before returning, it dynamically translates the Hadith into Hindi and Urdu.
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<object>} Authenticated Sahih Hadith object with translations
 */
export const fetchRandomSahihHadith = async (options = {}) => {
  let attempts = 0;
  
  while (attempts < MAX_RETRIES) {
    attempts++;
    try {
      const response = await axios.get(HADITH_API_URL, {
        signal: options.signal,
      });
      
      if (response.data && response.data.success && response.data.data) {
        const hadith = response.data.data;
        // Normalize and verify grade is Sahih
        if (hadith.grade && typeof hadith.grade === 'string' && hadith.grade.trim().toLowerCase() === 'sahih') {
          // Pre-translate
          const englishText = hadith.english || '';
          const [hindiText, urduText] = await Promise.all([
            translateText(englishText, 'hi', options.signal),
            translateText(englishText, 'ur', options.signal),
          ]);

          hadith.translations = {
            en: englishText,
            hi: hindiText,
            ur: urduText,
          };

          return hadith;
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error; // Propagate cancellation up
      }
      console.warn(`Hadith fetch attempt ${attempts} failed:`, error.message);
    }
  }
  
  throw new Error('No authentic hadith available right now. Please try again later.');
};

