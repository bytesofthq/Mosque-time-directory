import React, { useState, useEffect } from 'react';
import { Copy, Share2, Heart, Volume2, Check, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * Premium Dua Card component.
 * Displays Arabic text, transliteration, translated translation (Hindi / Urdu / English), source reference,
 * and features a bookmark/favorite manager, share utilities, and a tap-to-count repeater.
 */
export const DuaCard = ({ dua }) => {
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [tapCount, setTapCount] = useState(dua.repeat || 1);
  const [activeLang, setActiveLang] = useState('hi'); // Default to Hindi to match HadithCard

  // Check if this dua is bookmarked as a favorite in localStorage
  useEffect(() => {
    try {
      const favorites = JSON.parse(localStorage.getItem('adhkar_favorites') || '[]');
      setIsFavorite(favorites.includes(dua.id));
    } catch (e) {
      console.error('Error checking favorite status:', e);
    }
  }, [dua.id]);

  // Toggle favorite bookmark state
  const handleToggleFavorite = () => {
    try {
      const favorites = JSON.parse(localStorage.getItem('adhkar_favorites') || '[]');
      let updatedFavorites;
      if (isFavorite) {
        updatedFavorites = favorites.filter((id) => id !== dua.id);
        toast.info('Removed from Favorites');
      } else {
        updatedFavorites = [...favorites, dua.id];
        toast.success('Added to Favorites');
      }
      localStorage.setItem('adhkar_favorites', JSON.stringify(updatedFavorites));
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.error('Error saving favorite status:', e);
    }
  };

  const getActiveTitle = () => {
    return dua.translations?.title[activeLang] || dua.title || '';
  };

  const getActiveText = () => {
    return dua.translations?.text[activeLang] || dua.translation || '';
  };

  const handleCopy = async () => {
    const activeTitle = getActiveTitle();
    const activeText = getActiveText();
    const textToCopy = `Dua: ${activeTitle}\n\nArabic:\n${dua.arabic}\n\nTransliteration:\n${dua.transliteration}\n\nTranslation (${activeLang.toUpperCase()}):\n${activeText}\n\nReference: ${dua.source || 'UmmahAPI'}`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Dua copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy dua:', err);
      toast.error('Failed to copy dua.');
    }
  };

  const handleShare = async () => {
    const activeTitle = getActiveTitle();
    const activeText = getActiveText();
    const shareData = {
      title: `Dua: ${activeTitle}`,
      text: `"${activeText}" - Ref: ${dua.source || 'UmmahAPI'}`,
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

  const handleAudioClick = () => {
    toast.info('Audio recitation feature is coming soon! Stay tuned.');
  };

  const handleTapIncrement = () => {
    if (tapCount > 0) {
      setTapCount((prev) => prev - 1);
      // Optional: Gentle browser sound or visual flash
      if (tapCount === 1) {
        toast.success('Dhikr Completed!', { autoClose: 1500 });
      }
    }
  };

  const handleResetCount = (e) => {
    e.stopPropagation(); // Avoid triggering the card increment
    setTapCount(dua.repeat || 1);
  };

  const displayedTitle = getActiveTitle();
  const displayedText = getActiveText();

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      {/* Glow highlight on completed Dhikr */}
      {tapCount === 0 && (
        <div className="absolute inset-0 bg-[#0E7C66]/5 pointer-events-none transition-all duration-300"></div>
      )}

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4 mb-5">
        <div className="flex justify-between items-center w-full sm:w-auto">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-800">
            {displayedTitle}
          </h4>
          
          {/* Favorite Toggle for mobile view */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`p-2 rounded-xl border transition-colors ${
                isFavorite 
                  ? 'bg-red-50 text-red-500 border-red-150' 
                  : 'bg-slate-50 text-slate-400 border-slate-100'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Language Tabs & Desktop Favorite Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/20 shadow-inner">
            {[
              { id: 'hi', label: 'हिन्दी' },
              { id: 'ur', label: 'اردو' },
              { id: 'en', label: 'English' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveLang(tab.id)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  activeLang === tab.id 
                    ? 'bg-white text-[#0E7C66] shadow-sm border border-slate-200/30' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Desktop Favorite Toggle */}
          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`hidden sm:inline-block p-2 rounded-xl border transition-colors ${
              isFavorite 
                ? 'bg-red-50 text-red-500 border-red-150' 
                : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body Area */}
      <div className="space-y-6">
        {/* Arabic text block */}
        <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-2xl border border-amber-900/10 shadow-sm">
          <p 
            className="text-right font-semibold text-3xl sm:text-4xl lg:text-[2.75rem] text-slate-900 leading-[2.8] font-arabic py-2"
            dir="rtl"
          >
            {dua.arabic}
          </p>
        </div>

        {/* Transliteration */}
        {dua.transliteration && (
          <p className="text-slate-600 italic text-sm sm:text-base leading-relaxed pl-3 border-l-2 border-teal-500/30">
            {dua.transliteration}
          </p>
        )}

        {/* Translation Body with Language-Sensitive Alignment */}
        <p 
          className={`text-slate-700 leading-relaxed ${
            activeLang === 'ur' 
              ? 'text-right pr-4 pl-0 border-l-0 border-r-2 border-amber-500/40 font-arabic leading-[2.2] text-2xl sm:text-3xl text-slate-800' 
              : 'text-base sm:text-lg font-medium'
          }`}
          dir={activeLang === 'ur' ? 'rtl' : 'ltr'}
        >
          {displayedText}
        </p>
      </div>

      {/* Bottom controls */}
      <div className="pt-6 border-t border-slate-100 mt-6 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        {/* Reference / Source */}
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Reference: <span className="text-slate-600">{dua.source || 'UmmahAPI'}</span>
        </div>

        {/* Action button container */}
        <div className="flex items-center justify-between sm:justify-end gap-2.5">
          
          {/* Audio Button */}
          <button
            type="button"
            onClick={handleAudioClick}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 rounded-xl border border-slate-150 transition-all"
            title="Listen Audio"
          >
            <Volume2 className="h-4 w-4" />
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 rounded-xl border border-slate-150 transition-all"
            title="Copy to clipboard"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 rounded-xl border border-slate-150 transition-all"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {/* Dhikr Count Multiplier Indicator */}
          <div 
            onClick={handleTapIncrement}
            className={`flex items-center gap-2 cursor-pointer font-extrabold text-xs uppercase px-4 py-2.5 rounded-xl border transition-all select-none ${
              tapCount === 0
                ? 'bg-[#0E7C66]/10 text-[#0E7C66] border-[#0E7C66]/20'
                : 'bg-[#0E7C66] hover:bg-[#1C9C84] active:scale-[0.96] text-white border-transparent shadow-sm'
            }`}
            title="Tap to count recital"
          >
            {tapCount === 0 ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Completed</span>
              </>
            ) : (
              <span>Count: {tapCount}x</span>
            )}
            
            {tapCount !== (dua.repeat || 1) && (
              <button 
                onClick={handleResetCount}
                className="ml-1 p-0.5 rounded-md hover:bg-black/10 text-white/90 hover:text-white"
                title="Reset counter"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default DuaCard;
