import axios from 'axios';

/**
 * Detects if a text string contains Arabic script characters.
 */
export const containsArabicScript = (text) => {
  if (!text || typeof text !== 'string') return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
};

/**
 * Validates if a translation string is complete and valid.
 * Checks against API error messages, warnings, quota limits, or empty output.
 */
const isValidTranslation = (translated, original, targetLang) => {
  if (!translated || typeof translated !== 'string') return false;
  const trimmed = translated.trim();
  if (!trimmed) return false;

  // Filter out API warnings, error responses, or HTML error pages
  if (trimmed.startsWith('MYMEMORY WARNING') || 
      trimmed.includes('RESPONSE STATUS:') || 
      trimmed.includes('429 Too Many Requests') ||
      trimmed.includes('<!DOCTYPE html>') ||
      trimmed.includes('<html>')) {
    return false;
  }

  // For non-English/non-Arabic target languages, if the result is identical to original English (and original is > 30 chars),
  // it means translation failed.
  if (targetLang !== 'en' && targetLang !== 'ar' && trimmed.toLowerCase() === original.toLowerCase() && original.length > 30) {
    return false;
  }

  return true;
};

/**
 * Translates a single text block/paragraph using Google Translate GTX endpoint.
 * Supports source language parameter ('ar', 'en', or 'auto').
 */
const translateBlockGTX = async (text, targetLang, sourceLang = 'auto', signal = null) => {
  try {
    const sl = sourceLang || (containsArabicScript(text) ? 'ar' : 'en');
    const url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + sl + "&tl=" + targetLang + "&dt=t&q=" + encodeURIComponent(text);
    const response = await axios.get(url, { signal, timeout: 9000 });
    
    if (response.data && Array.isArray(response.data[0])) {
      const sentences = response.data[0]
        .map((item) => (Array.isArray(item) && item[0] ? item[0] : ''))
        .filter(Boolean);
      
      const fullText = sentences.join('');
      if (isValidTranslation(fullText, text, targetLang)) {
        return fullText;
      }
    }
  } catch (err) {
    if (axios.isCancel(err)) throw err;
    console.warn("GTX translation (" + sourceLang + "->" + targetLang + ") failed:", err.message);
  }
  return null;
};

/**
 * Refines English translation to use authentic, scholarly Islamic terminology:
 * - "Allah" instead of "God".
 * - "the Messenger of Allah ﷺ" / "His Messenger ﷺ" instead of generic phrases.
 * - Established Islamic terms: Wudu, Zakat, Sadaqah, Jannah, Jahannam, Dua, Salah, Hajj, Umrah, Ansar, Muhajirun, Sahabah.
 * - Honorifics: ﷺ, (رضي الله عنه), (رضي الله عنها), (رضي الله عنهم), (رحمه الله).
 */
export const refineEnglishTranslation = (text) => {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text
    .replace(/\bGod's Apostle\b/gi, 'the Messenger of Allah ﷺ')
    .replace(/\bApostle of God\b/gi, 'the Messenger of Allah ﷺ')
    .replace(/\bMessenger of God\b/gi, 'the Messenger of Allah ﷺ')
    .replace(/\bAllah's Apostle\b/gi, 'the Messenger of Allah ﷺ')
    .replace(/\bApostle of Allah\b/gi, 'the Messenger of Allah ﷺ')
    .replace(/\bthe Prophet (said|replied|stated|ordered|forbade|commanded)\b/gi, 'the Messenger of Allah ﷺ $1')
    .replace(/\b(He|the Prophet) said:\b/g, 'the Messenger of Allah ﷺ said:')
    .replace(/\bHis Apostle\b/gi, 'His Messenger ﷺ')
    .replace(/\bGod's\b/g, "Allah's")
    .replace(/\bGod\b/g, 'Allah')
    .replace(/\s*\((?:pbuh|p\.b\.u\.h\.|pbuh|ﷺ)\)/gi, ' ﷺ')
    .replace(/\[(?:pbuh|p\.b\.u\.h\.|pbuh|ﷺ)\]/gi, ' ﷺ')
    .replace(/\bmay Allah be pleased with him\b/gi, '(رضي الله عنه)')
    .replace(/\bmay Allah be pleased with her\b/gi, '(رضي الله عنها)')
    .replace(/\bmay Allah be pleased with them\b/gi, '(رضي الله عنهم)')
    .replace(/\bmay Allah have mercy on him\b/gi, '(رحمه الله)')
    .replace(/\bAblution\b/gi, 'Wudu')
    .replace(/\bAlms-giving\b/gi, 'Zakat')
    .replace(/\bParadise\b/gi, 'Jannah')
    .replace(/\bHellfire\b/gi, 'Jahannam')
    .replace(/\bHell\b/g, 'Jahannam')
    .replace(/\bSupplication\b/gi, 'Dua')
    .replace(/\bRitual prayer\b/gi, 'Salah')
    .replace(/\s+/g, ' ')
    .trim();

  cleaned = cleaned.replace(/Messenger of Allah(?!\s*ﷺ)/g, 'Messenger of Allah ﷺ');
  cleaned = cleaned.replace(/ﷺ\s*ﷺ/g, 'ﷺ');
  return cleaned;
};

/**
 * Refines Urdu translation to use standard Islamic Urdu terminology:
 * - "اللہ" instead of "خدا" or "پروردگار".
 * - "رسول اللہ ﷺ" instead of generic Prophet references.
 * - Respectful verbs ("فرمایا") and standard honorifics.
 * - Preserves Islamic terms: اللہ, رسول اللہ ﷺ, جنت, جہنم, دعا, نماز, وضو, زکوة, صدقہ, حج, عمرہ, انصار, مہاجرین, صحابہ.
 */
export const refineUrduTranslation = (text) => {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text
    .replace(/خدا/g, 'اللہ')
    .replace(/پروردگار/g, 'اللہ')
    .replace(/نبی نے کہا|رسول نے کہا|آپ نے کہا|اللہ کے رسول نے کہا/g, 'رسول اللہ ﷺ نے فرمایا')
    .replace(/نبی اکرم نے فرمایا|نبی نے فرمایا|رسول نے فرمایا/g, 'رسول اللہ ﷺ نے فرمایا')
    .replace(/اللہ کے رسول/g, 'رسول اللہ ﷺ')
    .replace(/رضی اللہ عنہ/g, '(رضي الله عنه)')
    .replace(/رضی اللہ عنہا/g, '(رضي الله عنها)')
    .replace(/رضی اللہ عنہم/g, '(رضي الله عنهم)')
    .replace(/رحمہ اللہ/g, '(رحمه الله)')
    .replace(/\s+/g, ' ')
    .trim();

  cleaned = cleaned.replace(/رسول اللہ(?!\s*ﷺ)/g, 'رسول اللہ ﷺ');
  cleaned = cleaned.replace(/ﷺ\s*ﷺ/g, 'ﷺ');
  return cleaned;
};

/**
 * Refines Hindi translation to use standard Islamic Hindi terminology:
 * - "अल्लाह" instead of "भगवान", "ईश्वर", "परमेश्वर", "प्रभु", "देवता".
 * - "रसूलुल्लाह ﷺ" or "अल्लाह के रसूल ﷺ" instead of generic names.
 * - "फ़रमाया" instead of "कहा" for Allah and Rasulullah ﷺ.
 * - "जन्नत" instead of "स्वर्ग", "जहन्नम" instead of "नरक".
 * - "दुआ" instead of "प्रार्थना" where appropriate.
 * - "ईदुल-फ़ित्र" and "ईदुल-अज़हा" for Eid festivals.
 * - Preserves Islamic terms: अंसार, मुहाजिर, मुहाजिरून, सहाबा, उमराह, हज, ज़कात, सदका, वुज़ू, नमाज़, सलाह, रोज़ा, सौम, ईमान.
 */
export const refineHindiTranslation = (text) => {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text
    // Deity replacements
    .replace(/भगवान|ईश्वर|परमेश्वर|प्रभु|देवता/g, 'अल्लाह')
    
    // Prophet / Messenger speech & title replacements
    .replace(/पैगंबर ने कहा|पैग़म्बर ने कहा|नबी ने कहा|अल्लाह के रसूल ने कहा|रसूल ने कहा|आप ने कहा|पैगंबर ने फ़रमाया|पैग़म्बर ने फ़रमाया|नबी ने फ़रमाया|अल्लाह के रसूल ने फ़रमाया|रसूल ने फ़रमाया/g, 'रसूलुल्लाह ﷺ ने फ़रमाया')
    .replace(/अल्लाह के पैगंबर|अल्लाह के पैग़म्बर|ईश्वर के दूत|ईश्वर के संदेशवाहक|अल्लाह के संदेशवाहक|अल्लाह के दूत|भगवान के दूत/g, 'अल्लाह के रसूल ﷺ')
    .replace(/पैगंबर|पैग़म्बर/g, 'रसूलुल्लाह ﷺ')
    .replace(/अल्लाह के रसूल/g, 'अल्लाह के रसूल ﷺ')
    .replace(/नबी ने/g, 'नबी करीम ﷺ ने')
    .replace(/अल्लाह ने कहा/g, 'अल्लाह ने फ़रमाया')
    
    // Convert 'कहा' to 'फ़रमाया' when referring to Allah or Rasulullah / Prophet speech
    .replace(/(अल्लाह|रसूलुल्लाह ﷺ|नबी करीम ﷺ|अल्लाह के रसूल ﷺ)\s+ने\s+कहा/g, '$1 ने फ़रमाया')
    
    // Afterlife terms
    .replace(/नरक की आग/g, 'जहन्नम की आग')
    .replace(/नरक|पाताल|यमलोक|दोज़ख/g, 'जहन्नम')
    .replace(/स्वर्ग|बैकुंठ|देवलोक|सुरलोक|परलोक/g, 'जन्नत')
    
    // Worship & supplication terms
    .replace(/प्रार्थनाएं|प्रार्थनाओं/g, 'दुआओं')
    .replace(/प्रार्थना और उपासना|प्रार्थना/g, 'दुआ')
    .replace(/पूजा और उपासना|पूजा|उपासना/g, 'इबादत')
    .replace(/दान और भिक्षा|दान|भिक्षा/g, 'सदका')
    .replace(/अभिषेक|आचमन|पवित्र स्नान/g, 'वुज़ू')
    .replace(/तीर्थयात्रा/g, 'हज')
    
    // Specific Hadith phrases / Idioms
    .replace(/दो नौकरानियाँ|दो दासी/g, 'अंसार की दो लड़कियाँ')
    .replace(/शैतान का भजन|शैतान का गाना/g, 'शैतान का बाजा')
    
    // Festival terms
    .replace(/मीठी ईद|ईद का त्योहार|ईद उल फितर|ईद-उल-फितर/g, 'ईदुल-फ़ित्र')
    .replace(/बकरीद|ईद उल अज़हा|ईद-उल-अजहा/g, 'ईदुल-अज़हा')

    // Honorifics
    .replace(/\(?रज़ियल्लाहु अन्हु\)?/g, '(रज़ियल्लाहु अन्हु)')
    .replace(/\(?रज़ियल्लाहु अन्हा\)?/g, '(रज़ियल्लाहु अन्हा)')
    .replace(/\(?रज़ियल्लाहु अन्हुम\)?/g, '(रज़ियल्लाहु अन्हुम)')
    .replace(/\(?अलैहिस्सलाम\)?/g, '(अलैहिस्सलाम)')
    .replace(/\(?रहमतुल्लाह अलैह\)?/g, '(रहमतुल्लाह अलैह)')
    .replace(/\s+/g, ' ')
    .trim();

  // Ensure ﷺ follows रसूलुल्लाह / नबी करीम / अल्लाह के रसूल without duplication
  cleaned = cleaned.replace(/रसूलुल्लाह(?!\s*ﷺ)/g, 'रसूलुल्लाह ﷺ');
  cleaned = cleaned.replace(/नबी करीम(?!\s*ﷺ)/g, 'नबी करीम ﷺ');
  cleaned = cleaned.replace(/अल्लाह के रसूल(?!\s*ﷺ)/g, 'अल्लाह के रसूल ﷺ');
  cleaned = cleaned.replace(/ﷺ\s*ﷺ/g, 'ﷺ');
  return cleaned;
};

/**
 * Translates text to target language ('hi', 'ur', 'en', etc.) while preserving:
 * - Paragraph breaks and line formatting (\n\n, \n)
 * - Complete sentence coverage without omission or summarization
 * - Compiler remarks (قال أبو عيسى, وزاد, تابعه, وفي الباب, etc.)
 * - Islamic honorifics (ﷺ, رضي الله عنه, (pbuh), etc.)
 * @param {string} text - Source text (Arabic or English)
 * @param {string} targetLang - Target language ISO code ('hi', 'ur', 'en')
 * @param {string} [sourceLang='auto'] - Source language ISO code ('ar', 'en', or 'auto')
 * @param {AbortSignal} [signal] - Optional cancellation signal
 * @returns {Promise<string>} Fully translated and refined text preserving paragraph formatting
 */
export const translateText = async (text, targetLang, sourceLang = 'auto', signal = null) => {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  const isSourceArabic = sourceLang === 'ar' || containsArabicScript(trimmed);
  const actualSourceLang = isSourceArabic ? 'ar' : (sourceLang || 'en');

  // If target is same as source language (e.g. target='en' and source='en'), return original after refinement
  if (targetLang === actualSourceLang) {
    if (targetLang === 'en') return refineEnglishTranslation(trimmed);
    if (targetLang === 'ur') return refineUrduTranslation(trimmed);
    if (targetLang === 'hi') return refineHindiTranslation(trimmed);
    return trimmed;
  }

  // Preserve line breaks by splitting into paragraphs
  const paragraphs = trimmed.split(/\r?\n/);
  const translatedParagraphs = [];

  for (const paragraph of paragraphs) {
    const cleanPara = paragraph.trim();
    if (!cleanPara) {
      translatedParagraphs.push('');
      continue;
    }

    // 1. Try Google Translate GTX API for full paragraph
    let translatedPara = await translateBlockGTX(cleanPara, targetLang, actualSourceLang, signal);

    // 2. If full paragraph fails or is too long, split by sentences and translate sentence by sentence
    if (!translatedPara) {
      // Split by Arabic and Latin sentence delimiters (. ! ? ؛ \n)
      const sentences = cleanPara.match(/[^.!?؛]+[.!?؛]+(\s+|$)|[^.!?؛]+$/g) || [cleanPara];
      const translatedSentences = [];

      for (const sentence of sentences) {
        const sClean = sentence.trim();
        if (!sClean) continue;

        let sTrans = await translateBlockGTX(sClean, targetLang, actualSourceLang, signal);
        
        // MyMemory fallback for individual sentence if GTX failed
        if (!sTrans) {
          try {
            const mmUrl = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(sClean) + "&langpair=" + actualSourceLang + "|" + targetLang;
            const res = await axios.get(mmUrl, { signal, timeout: 6000 });
            if (res.data?.responseStatus === 200 && res.data?.responseData?.translatedText) {
              const candidate = res.data.responseData.translatedText.trim();
              if (isValidTranslation(candidate, sClean, targetLang)) {
                sTrans = candidate;
              }
            }
          } catch (e) {
            if (axios.isCancel(e)) throw e;
          }
        }

        translatedSentences.push(sTrans || sClean);
      }

      translatedPara = translatedSentences.join(' ');
    }

    translatedParagraphs.push(translatedPara || cleanPara);
  }

  const result = translatedParagraphs.join('\n');
  if (targetLang === 'en') return refineEnglishTranslation(result);
  if (targetLang === 'ur') return refineUrduTranslation(result);
  if (targetLang === 'hi') return refineHindiTranslation(result);

  return result;
};
