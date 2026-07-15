import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Islamic-themed error component with custom messages and retry capabilities.
 */
export const ErrorState = ({ 
  title = 'Connection Unsuccessful', 
  message = 'Indeed, with hardship comes ease (Quran 94:6). We are having trouble fetching this content. Please check your internet connection and try again.', 
  onRetry 
}) => {
  return (
    <div className="bg-[#F8F5EF] border border-teal-100 rounded-2xl p-6 sm:p-8 text-center max-w-lg mx-auto my-8 shadow-sm relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute right-0 top-0 opacity-[0.03] text-teal-800 pointer-events-none">
        <AlertCircle className="h-32 w-32 -mr-6 -mt-6" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-12 h-12 bg-amber-50 text-[#0E7C66] rounded-full flex items-center justify-center mb-4 border border-teal-100/50">
          <AlertCircle className="h-6 w-6" />
        </div>
        
        <h3 className="text-base font-bold text-slate-800 uppercase tracking-wide mb-2">
          {title}
        </h3>
        
        <p className="text-slate-600 text-sm mb-6 leading-relaxed max-w-md italic">
          "{message}"
        </p>
        
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 bg-[#0E7C66] hover:bg-[#1C9C84] active:scale-95 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-teal-800/10 text-xs uppercase tracking-wider"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
