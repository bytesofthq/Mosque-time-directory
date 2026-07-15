import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, ArrowRight, Sparkles } from 'lucide-react';

/**
 * Premium Card component for Featured Adhkar categories (Morning / Evening).
 * Features gradient backgrounds, animated icons, responsiveness, and recommendation states.
 */
export const FeaturedAdhkarCard = ({ category, isRecommended }) => {
  const isMorning = category.id === 'morning';

  // Islamic teal-emerald vs deep blue-teal gradient
  const gradientClass = isMorning
    ? 'from-[#0E7C66] via-[#1C9C84] to-[#2cbfa3]'
    : 'from-[#0b2824] via-[#0E7C66] to-[#1C9C84]';

  return (
    <Link
      to={`/adhkar/${category.id}`}
      className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white bg-gradient-to-br ${gradientClass} shadow-xl shadow-teal-900/15 hover:shadow-2xl hover:shadow-teal-900/30 active:scale-[0.98] group flex flex-col justify-between h-56 transition-all duration-300 transform hover:-translate-y-1 w-full border border-white/10`}
    >
      {/* Background overlay for hover shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"></div>
      
      {/* Decorative large vector circle */}
      <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/[0.03] group-hover:scale-110 transition-transform duration-500 ease-out pointer-events-none border border-white/5"></div>
      
      {/* Floating Recommended Badge */}
      {isRecommended && (
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-lg shadow-amber-400/25 border border-amber-300/40 animate-pulse">
          <Sparkles className="h-3 w-3" />
          <span>Recommended Now</span>
        </div>
      )}

      {/* Header Block */}
      <div className={`flex justify-between items-start ${isRecommended ? 'pt-9' : 'pt-2'}`}>
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight group-hover:text-amber-200 transition-colors">
            {category.name}
          </h3>
          <p className="text-white/80 text-xs sm:text-sm font-medium line-clamp-2 max-w-[85%] mt-1">
            {category.description}
          </p>
        </div>

        {/* Thematic Icon with Backdrop filter */}
        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/15 shadow-inner group-hover:rotate-12 transition-transform duration-300">
          {isMorning ? (
            <Sun className="h-7 w-7 text-amber-300" style={{ animation: 'spin 10s linear infinite' }} />
          ) : (
            <Moon className="h-7 w-7 text-slate-150" />
          )}
        </div>
      </div>

      {/* Footer Block */}
      <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-4">
        <span className="bg-white/10 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-full border border-white/5 uppercase tracking-wider shadow-sm">
          {category.count} Duas
        </span>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider group-hover:text-amber-200 transition-all">
          <span>Read Now</span>
          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
};

export default FeaturedAdhkarCard;
