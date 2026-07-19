import React, { useEffect, useState } from 'react';
import { usePWA } from '../context/PWAContext';
import { Smartphone, CheckCircle, Download, ShieldCheck, Share, PlusSquare, ArrowDownCircle, ArrowDown, Check } from 'lucide-react';
import logo from '../assets/logo.png';

const DownloadApp = () => {
  const { isInstallable, installApp } = usePWA();
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Detect iOS Device (iPhone / iPad / iPod)
    const checkIOS = 
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    setIsIOS(checkIOS);

    // Detect if already installed in Standalone mode
    const checkStandalone = 
      window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;

    setIsStandalone(checkStandalone);

    // Automatically trigger PWA install prompt on Android / supported devices
    if (!checkIOS && isInstallable) {
      const timer = setTimeout(() => {
        installApp();
      }, 600);
      return () => clearTimeout(timer);
    } else if (checkIOS && !checkStandalone) {
      // Auto-show iOS instructions on iOS devices
      setShowIOSInstructions(true);
    }
  }, [isInstallable, installApp]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      // Smooth scroll to iOS instructions box
      const el = document.getElementById('ios-install-guide');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (isInstallable && installApp) {
      await installApp();
    } else {
      // General browser fallback
      setShowIOSInstructions(true);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gradient-to-b from-teal-50/60 via-white to-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative">
      <div className="max-w-2xl w-full">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-teal-100/80 p-6 sm:p-10 text-center relative overflow-hidden backdrop-blur-sm">
          
          {/* Decorative Background Effects */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-200/40 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none"></div>

          {/* App Logo */}
          <div className="relative inline-block mb-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-teal-50 rounded-3xl p-3 shadow-inner mx-auto flex items-center justify-center border border-teal-100">
              <img 
                src={logo} 
                alt="Salah Directory Logo" 
                className="w-full h-full object-contain drop-shadow"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-teal-600 text-white p-2 rounded-2xl shadow-lg border-2 border-white">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            {isStandalone ? "Salah Directory App Installed" : "Install Salah Directory App"}
          </h1>

          <p className="mt-3 text-slate-600 text-sm sm:text-base font-medium max-w-md mx-auto">
            {isStandalone 
              ? "Salah Directory is already installed on your home screen!"
              : isIOS
              ? "Add Salah Directory directly to your iPhone / iPad home screen for instant access and offline prayer times."
              : "Install our Progressive Web App (PWA) onto your device home screen."}
          </p>

          {/* Installed Badge if running standalone */}
          {isStandalone ? (
            <div className="mt-6 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold px-6 py-3 rounded-2xl">
              <Check className="w-5 h-5 text-emerald-600" />
              <span>App Ready on Home Screen</span>
            </div>
          ) : (
            <>
              {/* Main PWA Install Trigger Button */}
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-extrabold px-8 py-4 rounded-2xl shadow-xl shadow-teal-700/25 transition-all text-base sm:text-lg cursor-pointer"
                >
                  <Download className="w-6 h-6 animate-bounce" />
                  <span>{isIOS ? "Install App on iPhone / iPad" : "Install Salah Directory App"}</span>
                </button>
              </div>

              {/* Explicit Fallback Box */}
              <div className="mt-6 p-4 sm:p-5 bg-teal-50/80 border border-teal-200/60 rounded-2xl">
                <p className="text-slate-800 text-sm font-semibold mb-3">
                  if download is not started click here to download
                </p>
                <button
                  onClick={handleInstallClick}
                  className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition-all text-xs sm:text-sm active:scale-95"
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  <span>Click Here to Install App</span>
                </button>
              </div>
            </>
          )}

          {/* Features Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-left">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Offline Access</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Accurate Timings</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-700">Adhkar & Hadith</span>
            </div>
          </div>
        </div>

        {/* Dedicated iPhone / iPad Installation Instructions */}
        <div 
          id="ios-install-guide"
          className={`mt-6 bg-white rounded-2xl p-6 border shadow-sm transition-all duration-300 ${
            isIOS || showIOSInstructions ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200'
          }`}
        >
          <h3 className="font-black text-slate-800 text-base sm:text-lg flex items-center gap-2">
            <ShieldCheck className="w-5.5 h-5.5 text-teal-600" />
            iPhone & iPad Installation Instructions (Safari)
          </h3>

          <p className="text-xs text-slate-500 mt-1 font-medium">
            Apple iOS requires a quick manual step in Safari to install web apps onto your iPhone home screen:
          </p>

          <div className="mt-4 space-y-3">
            {/* Step 1 */}
            <div className="flex items-start gap-3 p-3 bg-teal-50/60 rounded-xl border border-teal-100">
              <div className="w-7 h-7 bg-teal-700 text-white font-extrabold rounded-lg flex items-center justify-center shrink-0 text-sm">
                1
              </div>
              <div className="text-slate-800 text-xs sm:text-sm font-semibold leading-relaxed">
                Tap the <strong className="text-teal-900 inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-teal-200"><Share className="w-4 h-4 text-teal-700" /> Share button</strong> in your Safari browser menu bar at the bottom.
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 p-3 bg-teal-50/60 rounded-xl border border-teal-100">
              <div className="w-7 h-7 bg-teal-700 text-white font-extrabold rounded-lg flex items-center justify-center shrink-0 text-sm">
                2
              </div>
              <div className="text-slate-800 text-xs sm:text-sm font-semibold leading-relaxed">
                Scroll down the share options and tap <strong className="text-teal-900 inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-teal-200"><PlusSquare className="w-4 h-4 text-teal-700" /> Add to Home Screen</strong>.
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 p-3 bg-teal-50/60 rounded-xl border border-teal-100">
              <div className="w-7 h-7 bg-teal-700 text-white font-extrabold rounded-lg flex items-center justify-center shrink-0 text-sm">
                3
              </div>
              <div className="text-slate-800 text-xs sm:text-sm font-semibold leading-relaxed">
                Tap <strong className="text-teal-900">Add</strong> in the top right corner. The app icon will immediately appear on your iPhone home screen!
              </div>
            </div>
          </div>

          {/* Android / Desktop note */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Using Android or Desktop Chrome?</span>
            <span className="text-teal-700 font-bold">Tap "Install App" button above</span>
          </div>
        </div>

      </div>

      {/* Floating Bottom Arrow Banner for iPhone Users */}
      {isIOS && !isStandalone && (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[calc(100%-2rem)] bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-bounce">
          <div className="flex items-center gap-2">
            <Share className="w-5 h-5 text-teal-400 shrink-0" />
            <span className="text-xs font-bold">Tap Share 📤 & select "Add to Home Screen"</span>
          </div>
          <ArrowDown className="w-4 h-4 text-teal-400 shrink-0" />
        </div>
      )}
    </div>
  );
};

export default DownloadApp;
