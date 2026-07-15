import React from 'react';

/**
 * Premium skeleton loaders to prevent layout shift and blank white pages.
 * Supports different layout variants: 'hadith', 'featured', 'grid', and 'dua'.
 */
export const SkeletonLoader = ({ variant = 'grid', count = 4 }) => {
  if (variant === 'hadith') {
    return (
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-100 border border-slate-100 p-6 sm:p-8 animate-pulse w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div className="space-y-2">
            <div className="h-5 bg-slate-200 rounded-full w-28"></div>
            <div className="h-4 bg-slate-200 rounded w-36"></div>
          </div>
          <div className="flex space-x-1 h-8 bg-slate-100 p-1 rounded-xl w-48"></div>
        </div>
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded w-full"></div>
          <div className="h-6 bg-slate-200 rounded w-11/12"></div>
          <div className="h-6 bg-slate-200 rounded w-4/5"></div>
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="h-4 bg-slate-200 rounded w-48"></div>
            <div className="h-10 bg-slate-200 rounded-xl w-36"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div 
            key={idx} 
            className="h-48 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-pulse flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2 w-2/3">
                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
              </div>
              <div className="h-12 w-12 bg-slate-150 rounded-xl"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-4 bg-slate-200 rounded w-16"></div>
              <div className="h-5 w-5 bg-slate-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'dua') {
    return (
      <div className="space-y-6 w-full">
        {Array.from({ length: count }).map((_, idx) => (
          <div 
            key={idx} 
            className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm animate-pulse space-y-5"
          >
            <div className="flex justify-between items-center">
              <div className="h-6 bg-slate-200 rounded w-24"></div>
              <div className="h-6 bg-slate-200 rounded-full w-8"></div>
            </div>
            
            {/* Arabic skeleton - aligned right */}
            <div className="space-y-2 flex flex-col items-end">
              <div className="h-8 bg-slate-200 rounded w-4/5"></div>
              <div className="h-8 bg-slate-200 rounded w-3/5"></div>
            </div>
            
            {/* Transliteration and Translation skeletons */}
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-slate-200 rounded w-11/12"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
            
            {/* Footer skeletons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="h-4 bg-slate-200 rounded w-40"></div>
              <div className="flex space-x-2">
                {Array.from({ length: 4 }).map((_, bIdx) => (
                  <div key={bIdx} className="h-9 w-9 bg-slate-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Default: Category grid skeleton loader
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div 
          key={idx} 
          className="h-28 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-pulse flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div className="h-8 w-8 bg-slate-100 rounded-lg"></div>
            <div className="h-4 w-8 bg-slate-100 rounded-full"></div>
          </div>
          <div className="space-y-1">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
