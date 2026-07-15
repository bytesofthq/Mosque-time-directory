import React, { useState } from 'react';
import { BookOpen, RefreshCw, Copy, Share2, Check, Award } from 'lucide-react';

/**
 * Premium Hadith Card component.
 * Displays Arabic text, translation (English / Hindi / Urdu), reference details, Sahih badge,
 * and utility controls (Refresh, Copy, Share).
 */
export const HadithCard = ({ 
  hadith, 
  loading, 
  error, 
  onRefresh 
}) => {
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState('hi'); // Default to Hindi as per legacy widget

  const getTranslationText = () => {
    if (!hadith) return '';
    return hadith.translations?.[activeLang] || hadith.english || '';
  };

  const handleCopy = async () => {
    if (!hadith) return;
    const translation = getTranslationText();
    const textToCopy = `Hadith [${hadith.collection_name} #${hadith.hadithnumber}]\n\nArabic:\n${hadith.arabic}\n\nTranslation (${activeLang.toUpperCase()}):\n${translation}\n\nGrade: ${hadith.grade}`;
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
      title: `Daily Hadith - ${hadith.collection_name}`,
      text: `"${translation}" - ${hadith.collection_name} (No. ${hadith.hadithnumber})`,
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-100/50 border border-slate-100 p-6 sm:p-8 animate-pulse">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded w-28"></div>
            <div className="h-4 bg-slate-200 rounded w-36"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded-xl w-32"></div>
        </div>
        <div className="space-y-4">
          <div className="h-5 bg-slate-200 rounded w-full"></div>
          <div className="h-5 bg-slate-200 rounded w-11/12"></div>
          <div className="h-5 bg-slate-200 rounded w-4/5"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F8F5EF] rounded-2xl shadow-xl shadow-slate-100/30 border border-teal-100/50 p-6 sm:p-8 relative overflow-hidden text-center">
        <div className="absolute right-0 top-0 opacity-[0.02] text-teal-800 pointer-events-none">
          <BookOpen className="h-64 w-64 -mr-12 -mt-12" />
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <span className="bg-red-50 text-red-800 px-3 py-1 rounded-full text-xs font-bold border border-red-100 uppercase tracking-wider mb-4">
            Hadith Error
          </span>
          <p className="text-slate-700 leading-relaxed text-sm font-semibold mb-6 max-w-md italic">
            "{error}"
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 bg-[#0E7C66] hover:bg-[#1C9C84] active:scale-95 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-teal-700/10 text-xs font-bold uppercase tracking-wider"
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

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-150/40 border border-slate-100 p-6 sm:p-8 relative overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300">
      {/* Decorative Quran / Book Icon */}
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
              {/* Sahih Badge (Only display grade badge if grade is Sahih) */}
              {isGradeSahih && (
                <div className="inline-flex items-center gap-1 bg-[#0E7C66]/10 text-[#0E7C66] px-2 py-0.5 rounded-lg border border-[#0E7C66]/20 font-bold text-[10px] uppercase tracking-wider shadow-sm">
                  <Award className="h-3 w-3" />
                  <span>{hadith.grade}</span>
                </div>
              )}
            </div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2.5">
              {hadith.collection_name} • Hadith #{hadith.hadithnumber}
            </h2>
          </div>

          {/* Language Select Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl self-start sm:self-auto shadow-inner">
            {[
              { id: 'hi', label: 'हिन्दी (Hindi)' },
              { id: 'ur', label: 'اردو (Urdu)' },
              { id: 'en', label: 'English' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveLang(tab.id)}
                className={`px-4.5 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all ${
                  activeLang === tab.id 
                    ? 'bg-white text-teal-700 shadow-sm border border-slate-200/40' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Block */}
        <div className="space-y-6">
          {/* Arabic text with beautiful font styling */}
          <p 
            className="text-right font-semibold text-2xl sm:text-3xl text-slate-800 leading-loose tracking-wide font-serif"
            dir="rtl"
          >
            {hadith.arabic}
          </p>
          
          {/* Display Translation Text with Dynamic Language Alignment */}
          <p 
            className={`text-slate-600 leading-relaxed italic py-1 ${
              activeLang === 'ur' 
                ? 'text-right pr-4 border-r-4 border-teal-500/35 font-serif leading-loose text-2xl sm:text-3xl' 
                : 'pl-4 border-l-4 border-teal-500/35 text-lg sm:text-xl font-medium'
            }`}
            dir={activeLang === 'ur' ? 'rtl' : 'ltr'}
          >
            "{displayedTranslation}"
          </p>
          
          {/* Footer Controls */}
          <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 text-xs">
            {/* Quick Action Utilities */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 sm:flex-initial inline-flex justify-center items-center gap-1.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 px-4 py-2 rounded-xl transition-all border border-slate-200/50 font-bold"
                title="Copy Hadith Text"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleShare}
                className="flex-1 sm:flex-initial inline-flex justify-center items-center gap-1.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 px-4 py-2 rounded-xl transition-all border border-slate-200/50 font-bold"
                title="Share Hadith"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share</span>
              </button>
            </div>

            {/* Refresh Trigger */}
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex justify-center items-center gap-2 bg-[#0E7C66]/5 hover:bg-[#0E7C66]/10 active:scale-95 text-[#0E7C66] px-5 py-2.5 rounded-xl transition-all border border-[#0E7C66]/10 font-bold hover:shadow-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Get New Hadith</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HadithCard;

