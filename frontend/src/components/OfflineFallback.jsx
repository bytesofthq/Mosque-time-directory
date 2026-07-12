import React from 'react';
import { WifiOff } from 'lucide-react';

const OfflineFallback = ({ 
  title = "You are currently offline", 
  message = "This page requires an active internet connection. Please verify your connection status and try reloading the page." 
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 max-w-lg mx-auto text-center animate-fade-in">
      <div className="bg-rose-50 dark:bg-rose-950/20 p-5 rounded-full text-rose-600 dark:text-rose-400 mb-6 border border-rose-100 dark:border-rose-900/30 animate-pulse">
        <WifiOff className="h-12 w-12" />
      </div>
      <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm sm:text-base font-semibold leading-relaxed mb-8">
        {message}
      </p>
      <button 
        onClick={handleReload}
        className="bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 mx-auto justify-center"
      >
        Try Reloading
      </button>
    </div>
  );
};

export default OfflineFallback;
