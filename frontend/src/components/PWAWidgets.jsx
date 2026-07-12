import React from 'react';
import { usePWA } from '../context/PWAContext';
import { WifiOff, Download, RefreshCw, X } from 'lucide-react';
import logo from '../assets/logo.png';

export const PWAWidgets = () => {
  const {
    showInstallBanner,
    setShowInstallBanner,
    installApp,
    isOffline,
    needUpdate,
    updateApp
  } = usePWA();

  const handleDismissInstall = () => {
    sessionStorage.setItem('pwa-dismissed', 'true');
    setShowInstallBanner(false);
  };

  return (
    <>
      {/* Offline Indicator Banner */}
      {isOffline && (
        <div className="fixed bottom-4 left-4 z-50 bg-rose-600 text-white font-bold text-xs md:text-sm px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-bounce border border-rose-500/30">
          <WifiOff className="h-4.5 w-4.5 animate-pulse" />
          <span>You are currently offline. Working offline.</span>
        </div>
      )}

      {/* Service Worker Auto-Update Toast */}
      {needUpdate && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-slate-900 dark:bg-black text-slate-100 shadow-2xl rounded-2xl border border-slate-800 p-4 flex flex-col gap-3 animate-slide-up">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="bg-teal-500/20 p-2 rounded-xl text-teal-400">
                <RefreshCw className="h-5 w-5 animate-spin-slow" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">Update Available</h4>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  A new version of Salah Directory is available.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={updateApp}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              Update now
            </button>
          </div>
        </div>
      )}

      {/* Install App Prompt Banner */}
      {showInstallBanner && (
        <div className="fixed bottom-4 right-4 z-40 max-w-md w-[calc(100%-2rem)] sm:w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-800 p-4 sm:p-5 flex items-center gap-4 animate-slide-up">
          <img 
            src={logo} 
            alt="Salah Directory Logo" 
            className="h-12 w-12 rounded-xl object-contain bg-slate-50 dark:bg-slate-800/50 p-1 shrink-0" 
          />
          <div className="flex-1 min-w-0">
            <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">Install Salah Directory</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5 leading-normal">
              Install the application on your device for offline support and faster access.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={installApp}
                className="bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </button>
              <button
                onClick={handleDismissInstall}
                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition-all"
              >
                Not now
              </button>
            </div>
          </div>
          <button 
            onClick={handleDismissInstall}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 p-1"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  );
};
