import React, { useEffect } from 'react';
import { useAdhkar } from '../hooks/useAdhkar';
import { useHadith } from '../hooks/useHadith';
import HadithCard from '../components/HadithCard';
import FeaturedAdhkarCard from '../components/FeaturedAdhkarCard';
import AdhkarCard from '../components/AdhkarCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import { isBeforeDhuhr, isAfterAsrMaghrib } from '../utils/date';
import { Heart, Compass, BookOpen } from 'lucide-react';

/**
 * Adhkar Home Page.
 * Coordinates loading of Categories and Daily Hadith.
 * Implements dynamic sorting of Featured Cards based on time of day,
 * and displays remaining categories in a responsive grid.
 */
export const AdhkarHome = () => {
  const { 
    categories, 
    loadingCategories, 
    categoriesError, 
    loadCategories 
  } = useAdhkar();

  const { 
    hadith, 
    loading: loadingHadith, 
    error: hadithError, 
    refreshHadith 
  } = useHadith();

  // Load categories list on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Determine time-based recommendations
  const morningRecommended = isBeforeDhuhr();
  const eveningRecommended = isAfterAsrMaghrib();

  // Filter and sort Featured Adhkar categories (Morning & Evening)
  const getFeaturedCategories = () => {
    const featured = categories.filter(c => c.id === 'morning' || c.id === 'evening');
    
    // Sort featured categories based on recommendation
    if (morningRecommended) {
      return featured.sort((a, b) => (a.id === 'morning' ? -1 : 1));
    }
    if (eveningRecommended) {
      return featured.sort((a, b) => (a.id === 'evening' ? -1 : 1));
    }
    
    // Default fallback order: morning first
    return featured.sort((a, b) => (a.id === 'morning' ? -1 : 1));
  };

  // Filter other categories (all categories except morning & evening)
  const getOtherCategories = () => {
    return categories.filter(c => c.id !== 'morning' && c.id !== 'evening');
  };

  const featuredCats = getFeaturedCategories();
  const otherCats = getOtherCategories();

  return (
    <div className="min-h-screen bg-[#F8F5EF]/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Elegant Header section */}
        <header className="text-center space-y-2 max-w-2xl mx-auto pt-4">
          <div className="inline-flex items-center gap-1.5 bg-[#0E7C66]/10 text-[#0E7C66] px-3.5 py-1.5 rounded-full border border-[#0E7C66]/15 font-bold text-xs uppercase tracking-widest mb-2 shadow-sm">
            <Compass className="h-3.5 w-3.5 animate-pulse" />
            <span>Islamic Remembrance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
            Adhkar & Daily Hadith
          </h1>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            Nourish your soul with verified supplications and authentic hadith of the Prophet Muhammad (ﷺ).
          </p>
        </header>

        {/* 1. Hadith of the Day Widget Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              Daily Inspiration
            </h3>
          </div>
          <HadithCard 
            hadith={hadith} 
            loading={loadingHadith} 
            error={hadithError} 
            onRefresh={refreshHadith} 
          />
        </section>

        {/* 2. Featured Adhkar (Morning & Evening) Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Heart className="h-4 w-4" />
              Essential Remembrance
            </h3>
          </div>

          {loadingCategories ? (
            <SkeletonLoader variant="featured" />
          ) : categoriesError ? (
            <ErrorState onRetry={() => loadCategories(true)} />
          ) : featuredCats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredCats.map((cat) => {
                const isRec = (cat.id === 'morning' && morningRecommended) || 
                              (cat.id === 'evening' && eveningRecommended);
                return (
                  <FeaturedAdhkarCard 
                    key={cat.id} 
                    category={cat} 
                    isRecommended={isRec} 
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 font-medium bg-white rounded-2xl border border-slate-100 p-6">
              No featured categories found.
            </div>
          )}
        </section>

        {/* 3. Other Adhkar Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Compass className="h-4 w-4" />
              More Categories
            </h3>
          </div>

          {loadingCategories ? (
            <SkeletonLoader variant="grid" count={8} />
          ) : categoriesError ? (
            <ErrorState onRetry={() => loadCategories(true)} />
          ) : otherCats.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
              {otherCats.map((cat) => (
                <AdhkarCard 
                  key={cat.id} 
                  category={cat} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 font-medium bg-white rounded-2xl border border-slate-100 p-6">
              No categories found.
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default AdhkarHome;
