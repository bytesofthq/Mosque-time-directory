import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdhkar } from '../hooks/useAdhkar';
import DuaCard from '../components/DuaCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import { ArrowLeft, Search, X, BookOpen, Heart } from 'lucide-react';

/**
 * Adhkar Category Detail Page.
 * Displays all duas inside the selected category, implements real-time search filtration,
 * and handles lazy loading, caching and custom error/retry boundaries.
 */
export const AdhkarCategory = () => {
  const { categoryId } = useParams();
  const { 
    categoryData, 
    loadingDuas, 
    duasError, 
    loadCategoryDuas 
  } = useAdhkar();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch category data on mount / categoryId change
  useEffect(() => {
    loadCategoryDuas(categoryId);
  }, [categoryId, loadCategoryDuas]);

  // Reset search when category changes
  useEffect(() => {
    setSearchQuery('');
  }, [categoryId]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Perform case-insensitive search matching all fields in a Dua
  const getFilteredDuas = () => {
    if (!categoryData || !categoryData.duas) return [];
    if (!searchQuery.trim()) return categoryData.duas;
    
    const query = searchQuery.toLowerCase();
    return categoryData.duas.filter((dua) => {
      return (
        (dua.title && dua.title.toLowerCase().includes(query)) ||
        (dua.arabic && dua.arabic.includes(query)) ||
        (dua.transliteration && dua.transliteration.toLowerCase().includes(query)) ||
        (dua.translation && dua.translation.toLowerCase().includes(query)) ||
        (dua.source && dua.source.toLowerCase().includes(query))
      );
    });
  };

  const filteredDuas = getFilteredDuas();
  const categoryInfo = categoryData?.category || {};

  return (
    <div className="min-h-screen bg-[#F8F5EF]/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header Panel */}
        <div className="flex flex-col gap-4">
          <Link
            to="/adhkar"
            className="self-start inline-flex items-center gap-1.5 text-slate-500 hover:text-[#0E7C66] font-bold text-xs uppercase tracking-wider transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Adhkar</span>
          </Link>
          
          {/* Category Info Header */}
          {!loadingDuas && !duasError && categoryInfo.name && (
            <div className="space-y-1.5 pt-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {categoryInfo.name}
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                {categoryInfo.description}
              </p>
            </div>
          )}
        </div>

        {/* Loading / Error States for Category Info / Header skeletons */}
        {loadingDuas && (
          <div className="space-y-2 animate-pulse pt-2">
            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        )}

        {/* Content Container */}
        {loadingDuas ? (
          <div className="pt-4">
            <SkeletonLoader variant="dua" count={3} />
          </div>
        ) : duasError ? (
          <ErrorState onRetry={() => loadCategoryDuas(categoryId, true)} />
        ) : categoryData ? (
          <div className="space-y-6 pt-2">
            
            {/* Search filter bar */}
            <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center px-4 py-3 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500/35 transition-all">
              <Search className="h-4.5 w-4.5 text-slate-400 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search by title, translation, Arabic, transliteration or reference..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full text-slate-700 bg-transparent outline-none border-none text-sm placeholder-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="p-1 rounded-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* List of Duas */}
            {filteredDuas.length > 0 ? (
              <div className="space-y-6">
                {filteredDuas.map((dua) => (
                  <DuaCard 
                    key={dua.id} 
                    dua={dua} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center shadow-sm max-w-md mx-auto my-8">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Search className="h-5 w-5" />
                </div>
                <h5 className="font-bold text-slate-700 mb-1">No Duas Match Your Search</h5>
                <p className="text-slate-400 text-xs font-medium leading-relaxed mb-4">
                  We couldn't find any results for "{searchQuery}". Try modifying your keywords or spelling.
                </p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="bg-[#0E7C66] hover:bg-[#1C9C84] active:scale-95 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  Clear Search
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AdhkarCategory;
