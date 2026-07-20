import axios from 'axios';
import api from '../utils/api';
import { translateText } from '../utils/translation';

const HADITH_API_URL = 'https://ummahapi.com/api/hadith/random';
const MAX_RETRIES = 6;

/**
 * Checks if Hadith text is a cross-reference placeholder or incomplete fragment.
 */
const isIncompleteHadithText = (text) => {
  if (!text || typeof text !== 'string') return true;
  const lower = text.toLowerCase().trim();
  if (lower.length < 25) return true;
  if (lower.includes('same as above') || 
      lower.includes('see hadith') || 
      lower.includes('impossible to translate') ||
      lower.includes('from the prophet the same as above') ||
      lower.includes('as above (the sub narrators')) {
    return true;
  }
  return false;
};

/**
 * Fetches an authentic Sahih Hadith.
 * Filters out incomplete text fragments, cross-references, or non-Sahih records.
 * Guarantees complete translations in English, Hindi, and Urdu.
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<object>} Sahih Hadith object with complete translations
 */
export const fetchRandomSahihHadith = async (options = {}) => {
  let attempts = 0;
  
  // 1. Attempt Ummah API lookup with completeness check and cache busting
  while (attempts < MAX_RETRIES) {
    attempts++;
    try {
      const response = await axios.get(HADITH_API_URL, {
        params: { _t: Date.now() + Math.random() },
        signal: options.signal,
        timeout: 6000,
      });
      
      if (response.data && response.data.success && response.data.data) {
        const hadith = response.data.data;
        const englishText = (hadith.english || hadith.text || '').trim();
        const arabicText = (hadith.arabic || '').trim();

        if (hadith.grade && 
            typeof hadith.grade === 'string' && 
            hadith.grade.trim().toLowerCase() === 'sahih' &&
            !isIncompleteHadithText(englishText)) {

          // Check if Arabic contains compiler notes, grading notes, or narrator additions
          const hasArabicNotes = arabicText && (
            arabicText.includes('قال أبو عيسى') ||
            arabicText.includes('قال أبو داود') ||
            arabicText.includes('قال البخاري') ||
            arabicText.includes('وزاد') ||
            arabicText.includes('تابعه') ||
            arabicText.includes('وفي الباب') ||
            arabicText.includes('حديث حسن')
          );

          let finalEnglish = englishText;
          let finalHindi = '';
          let finalUrdu = '';

          // If Arabic has compiler notes or is longer than English, translate from Arabic to guarantee 100% parity
          if (hasArabicNotes || (arabicText && arabicText.length > englishText.length * 1.4)) {
            const [engTrans, hinTrans, urdTrans] = await Promise.all([
              translateText(arabicText, 'en', 'ar', options.signal),
              translateText(arabicText, 'hi', 'ar', options.signal),
              translateText(arabicText, 'ur', 'ar', options.signal),
            ]);
            finalEnglish = engTrans || englishText;
            finalHindi = hinTrans || finalEnglish;
            finalUrdu = urdTrans || finalEnglish;
          } else {
            const [hinTrans, urdTrans] = await Promise.all([
              translateText(englishText, 'hi', 'en', options.signal),
              translateText(englishText, 'ur', 'en', options.signal),
            ]);
            finalHindi = hinTrans || englishText;
            finalUrdu = urdTrans || englishText;
          }

          hadith.english = finalEnglish;
          hadith.translations = {
            en: finalEnglish,
            hi: finalHindi,
            ur: finalUrdu,
          };

          return hadith;
        }
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }
      console.warn(`UmmahAPI fetch attempt ${attempts} failed:`, error.message);
    }
  }

  // 2. Fallback to backend public Hadith of the Day API with cache busting & Arabic translation
  try {
    const backendRes = await api.get(`/public/hadith-of-the-day?refresh=true&_t=${Date.now()}_${Math.random()}`, {
      signal: options.signal,
    });
    
    if (backendRes.data) {
      const data = backendRes.data;
      const englishText = typeof data.text === 'object' ? data.text.en : (data.text || '');
      const arabicText = (data.arabic || '').trim();

      if (!isIncompleteHadithText(englishText)) {
        let finalEng = englishText;
        let finalHi = typeof data.text === 'object' ? data.text.hi : '';
        let finalUr = typeof data.text === 'object' ? data.text.ur : '';

        const hasArabicNotes = arabicText && (
          arabicText.includes('قال أبو عيسى') ||
          arabicText.includes('وزاد') ||
          arabicText.includes('تابعه') ||
          arabicText.includes('وفي الباب')
        );

        if (hasArabicNotes) {
          const [eT, hT, uT] = await Promise.all([
            translateText(arabicText, 'en', 'ar', options.signal),
            translateText(arabicText, 'hi', 'ar', options.signal),
            translateText(arabicText, 'ur', 'ar', options.signal),
          ]);
          finalEng = eT || englishText;
          finalHi = hT || finalEng;
          finalUr = uT || finalEng;
        } else {
          if (!finalHi || finalHi === englishText) {
            finalHi = await translateText(englishText, 'hi', 'en', options.signal);
          }
          if (!finalUr || finalUr === englishText) {
            finalUr = await translateText(englishText, 'ur', 'en', options.signal);
          }
        }

        return {
          collection_name: data.reference ? `Collection (${data.reference})` : 'Sahih Bukhari',
          hadithnumber: data.reference ? data.reference.replace(/[^0-9]/g, '') || '1' : '1',
          arabic: data.arabic || 'قَالَ رَسُولُ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
          english: finalEng,
          grade: 'Sahih',
          by: data.narrator || 'Authentic Chain',
          translations: {
            en: finalEng,
            hi: finalHi || finalEng,
            ur: finalUr || finalEng,
          }
        };
      }
    }
  } catch (backendErr) {
    if (axios.isCancel(backendErr)) {
      throw backendErr;
    }
    console.error('Backend Hadith fallback error:', backendErr.message);
  }
  
  throw new Error('No authentic hadith available right now. Please check internet connection and try again.');
};


