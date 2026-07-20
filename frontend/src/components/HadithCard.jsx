import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RefreshCw, Copy, Share2, Check, Award, Bookmark, Sparkles, X, Globe } from 'lucide-react';

/**
 * Premium Hadith Card component.
 * Displays Arabic text, complete translations (Hindi / Urdu / English), reference details, Sahih badge,
 * utility controls (Refresh, Copy, Share, Bookmark), and context modal.
 * Engineered for mobile devices to display full Hadith content naturally without inner scrollboxes.
 */
export const HadithCard = ({ 
  hadith, 
  loading, 
  error, 
  onRefresh 
}) => {
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState('hi'); // Default to Hindi
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync bookmark status with localStorage
  useEffect(() => {
    if (hadith?.hadithnumber) {
      const bookmarked = localStorage.getItem(`hadith_bookmarked_${hadith.hadithnumber}`) === 'true';
      setIsBookmarked(bookmarked);
    }
  }, [hadith]);

  const getTranslationText = () => {
    if (!hadith) return '';
    if (hadith.translations && hadith.translations[activeLang]) {
      return hadith.translations[activeLang];
    }
    return hadith.english || hadith.text || '';
  };

  const handleCopy = async () => {
    if (!hadith) return;
    const translation = getTranslationText();
    const langLabel = activeLang === 'hi' ? 'HINDI' : activeLang === 'ur' ? 'URDU' : 'ENGLISH';
    const textToCopy = `Hadith [${hadith.collection_name || 'Sahih Collection'} #${hadith.hadithnumber || ''}]\n\nArabic:\n${hadith.arabic || ''}\n\nTranslation (${langLabel}):\n${translation}\n\nGrade: ${hadith.grade || 'Sahih'}\n- via Salah Directory`;
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy hadith:', err);
    }
  };

  const handleShare = async () => {
    if (!hadith) return;
    const translation = getTranslationText();
    const shareData = {
      title: `Daily Hadith - ${hadith.collection_name || 'Sahih Hadith'}`,
      text: `"${translation}" - ${hadith.collection_name || 'Sahih Hadith'} (No. ${hadith.hadithnumber || ''})`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopy();
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const handleBookmarkToggle = () => {
    if (!hadith?.hadithnumber) return;
    const newStatus = !isBookmarked;
    setIsBookmarked(newStatus);
    localStorage.setItem(`hadith_bookmarked_${hadith.hadithnumber}`, newStatus ? 'true' : 'false');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-100/50 border border-slate-200/60 p-6 sm:p-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded-lg w-32"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-44"></div>
          </div>
          <div className="h-9 bg-slate-200 rounded-xl w-48"></div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded-lg w-full"></div>
          <div className="h-6 bg-slate-200 rounded-lg w-11/12"></div>
          <div className="h-6 bg-slate-200 rounded-lg w-4/5"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F8F5EF] rounded-3xl shadow-xl shadow-slate-100/30 border border-teal-100/50 p-6 sm:p-8 relative overflow-hidden text-center">
        <div className="absolute right-0 top-0 opacity-[0.02] text-teal-800 pointer-events-none">
          <BookOpen className="h-64 w-64 -mr-12 -mt-12" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <span className="bg-red-50 text-red-800 px-3.5 py-1 rounded-full text-xs font-extrabold border border-red-100 uppercase tracking-wider mb-4">
            Hadith Error
          </span>
          <p className="text-slate-700 leading-relaxed text-sm font-semibold mb-6 max-w-md italic">
            "{error}"
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 bg-[#0E7C66] hover:bg-[#1C9C84] active:scale-95 text-white px-5 py-2.5 rounded-xl transition-all shadow-md text-xs font-extrabold uppercase tracking-wider"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!hadith) return null;

  const isGradeSahih = hadith.grade && hadith.grade.trim().toLowerCase() === 'sahih';
  const displayedTranslation = getTranslationText();

  const langNames = {
    hi: 'अनुवाद (Hindi)',
    ur: 'ترجمہ (Urdu)',
    en: 'Translation (English)'
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-slate-150/40 border border-slate-200/70 p-5 sm:p-8 relative overflow-hidden transition-all duration-300">
      {/* Decorative Background Icon */}
      <div className="absolute right-0 top-0 opacity-[0.03] text-[#0E7C66] pointer-events-none">
        <BookOpen className="h-64 w-64 -mr-12 -mt-12" />
      </div>

      <div className="relative z-10">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-teal-50 text-[#0E7C66] px-3.5 py-1 rounded-full text-xs font-extrabold border border-teal-100 uppercase tracking-wider">
                Hadith of the Day
              </span>
              {isGradeSahih && (
                <div className="inline-flex items-center gap-1 bg-[#0E7C66]/10 text-[#0E7C66] px-2.5 py-0.5 rounded-lg border border-[#0E7C66]/20 font-bold text-[10px] uppercase tracking-wider shadow-xs">
                  <Award className="h-3 w-3 text-[#0E7C66]" />
                  <span>{hadith.grade}</span>
                </div>
              )}
            </div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">
              {hadith.collection_name || 'Sahih Collection'} • Hadith #{hadith.hadithnumber || ''}
            </h2>
          </div>

          {/* Language Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto shadow-inner border border-slate-200/40">
            <Globe className="h-4 w-4 text-slate-400 ml-1.5 mr-0.5 hidden sm:block" />
            {[
              { id: 'hi', label: 'हिन्दी' },
              { id: 'ur', label: 'اردو' },
              { id: 'en', label: 'English' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveLang(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                  activeLang === tab.id 
                    ? 'bg-white text-teal-800 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Block - Full Page Scrollable Flow (No inner height clipping) */}
        <div className="space-y-6">
          {/* Arabic Text Block */}
          <div className="bg-slate-50/50 p-4 sm:p-6 rounded-2xl border border-slate-100/80">
            <p 
              className="text-right font-semibold text-xl sm:text-2xl lg:text-3xl text-slate-900 leading-loose tracking-wide font-serif"
              dir="rtl"
            >
              {hadith.arabic}
            </p>
          </div>
          
          {/* Translation Block with Explicit Language Header & Styling */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-teal-800 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>{langNames[activeLang]}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold italic hidden sm:inline">
                Complete Translation Below
              </span>
            </div>

            <div 
              className={`p-4 sm:p-6 rounded-2xl transition-all duration-200 ${
                activeLang === 'ur'
                  ? 'bg-amber-50/30 border-r-4 border-amber-500/80 text-right font-serif leading-loose text-xl sm:text-2xl text-slate-800'
                  : 'bg-teal-50/30 border-l-4 border-teal-600/80 font-medium text-base sm:text-lg leading-relaxed text-slate-800'
              }`}
              dir={activeLang === 'ur' ? 'rtl' : 'ltr'}
            >
              <p className="italic">
                "{displayedTranslation}"
              </p>
            </div>
          </div>
          
          {/* Footer Controls & Utilities */}
          <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3.5 text-xs">
            {/* Quick Action Utilities */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-initial inline-flex justify-center items-center gap-1.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 px-3.5 py-2 rounded-xl transition-all border border-slate-200 font-bold"
                title="Copy Hadith Text"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 sm:flex-initial inline-flex justify-center items-center gap-1.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-700 px-3.5 py-2 rounded-xl transition-all border border-slate-200 font-bold"
                title="Share Hadith"
              >
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={handleBookmarkToggle}
                className={`flex-1 sm:flex-initial inline-flex justify-center items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all border font-bold ${
                  isBookmarked
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
                title="Bookmark Hadith"
              >
                <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-700' : 'text-slate-500'}`} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            {/* Action Buttons: Read Context & Get Next Hadith */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-initial inline-flex justify-center items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 px-4 py-2 rounded-xl font-extrabold transition-all border border-teal-100 text-xs"
              >
                Read Context
              </button>

              <button
                type="button"
                onClick={onRefresh}
                className="flex-1 sm:flex-initial inline-flex justify-center items-center gap-2 bg-[#0E7C66] hover:bg-[#1C9C84] active:scale-95 text-white px-5 py-2 rounded-xl transition-all shadow-md font-extrabold text-xs"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Next Hadith</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hadith Context & Narrators Overlay Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 relative z-10 overflow-y-auto max-h-[85vh] text-left"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-5 top-5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-2 rounded-full transition-colors active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4 pr-10">
                Hadith Context & Narrators
              </h3>

              <div className="space-y-6 mt-6">
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-teal-800 mb-2">Narrator & Chain</h4>
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                    This Hadith is compiled in {hadith?.collection_name || 'Sahih Bukhari'} under number #{hadith?.hadithnumber || '1'}.
                    It carries the authentic grading of <span className="text-emerald-700 font-bold uppercase">{hadith?.grade || 'Sahih'}</span>.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-teal-800 mb-2">Authenticity & Multi-Language Support</h4>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    All hadiths displayed on Salah Directory are sourced from verified Sahih (authentic) collections. Complete translations are available in Hindi, Urdu, and English.
                  </p>
                </div>

                <div className="bg-teal-50/60 rounded-2xl p-4 border border-teal-100/80">
                  <h4 className="text-sm font-extrabold text-teal-950 flex items-center gap-1.5 mb-1.5">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    <span>Applying this Sunnah</span>
                  </h4>
                  <p className="text-xs font-semibold text-teal-900/90 leading-relaxed">
                    "Make the Prophet's character your guide. Read the translation in your preferred language, ponder upon its guidance, and make it a habit to implement this teaching in your daily life."
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 text-right">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 text-xs"
                >
                  Close Dialog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HadithCard;
