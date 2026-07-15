import axios from 'axios';

/**
 * Translates English text to a target language using the MyMemory API.
 * Safely splits the text into chunks of under 450 characters to avoid API limits.
 * @param {string} text - The source English text to translate
 * @param {string} targetLang - The ISO code for the target language (e.g., 'hi', 'ur')
 * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
 * @returns {Promise<string>} Translated text
 */
export const translateText = async (text, targetLang, signal = null) => {
  if (!text) return '';
  try {
    const words = text.split(' ');
    const chunks = [];
    let currentChunk = '';
    
    for (const word of words) {
      if ((currentChunk + ' ' + word).length > 450) {
        chunks.push(currentChunk.trim());
        currentChunk = word;
      } else {
        currentChunk = currentChunk ? currentChunk + ' ' + word : word;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    const translatedChunks = [];
    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${targetLang}`;
      const response = await axios.get(url, { signal });
      const data = response.data;
      if (data && data.responseStatus === 200 && data.responseData && data.responseData.translatedText) {
        translatedChunks.push(data.responseData.translatedText);
      } else {
        translatedChunks.push(chunk);
      }
    }
    return translatedChunks.join(' ');
  } catch (err) {
    if (axios.isCancel(err)) {
      throw err; // Re-throw cancellation so caller handles aborts correctly
    }
    console.error(`Translation error to ${targetLang}:`, err.message);
    return text; // Return the original text as a fallback on failure
  }
};
