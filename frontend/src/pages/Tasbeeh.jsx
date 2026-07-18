import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  RotateCcw, 
  Moon, 
  Sun, 
  Check, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  AlertTriangle,
  Award
} from 'lucide-react';

const PRESET_TARGETS = [33, 99, 100, 500, 1000];

const Tasbeeh = () => {
  const [count, setCount] = useState(() => {
    const saved = localStorage.getItem('tasbeeh_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [target, setTarget] = useState(() => {
    const saved = localStorage.getItem('tasbeeh_target');
    return saved ? parseInt(saved, 10) : 33;
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('tasbeeh_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [vibrationEnabled, setVibrationEnabled] = useState(() => {
    const saved = localStorage.getItem('tasbeeh_vibration');
    return saved ? JSON.parse(saved) : true;
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('tasbeeh_sound');
    return saved ? JSON.parse(saved) : false;
  });

  const [showResetModal, setShowResetModal] = useState(false);
  const [targetReached, setTargetReached] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('tasbeeh_count', count.toString());
  }, [count]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_target', target.toString());
  }, [target]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_vibration', JSON.stringify(vibrationEnabled));
  }, [vibrationEnabled]);

  useEffect(() => {
    localStorage.setItem('tasbeeh_sound', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // Check target completion animation
  useEffect(() => {
    if (target > 0 && count > 0 && count % target === 0) {
      setTargetReached(true);
      if (vibrationEnabled && 'vibrate' in navigator) {
        try {
          navigator.vibrate([100, 50, 100, 50, 200]);
        } catch (e) {
          // ignore vibration block
        }
      }
      const timer = setTimeout(() => setTargetReached(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [count, target, vibrationEnabled]);

  const handleIncrement = () => {
    setCount(prev => prev + 1);
    if (vibrationEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate(40);
      } catch (e) {
        // ignore
      }
    }
  };

  const handleDecrement = () => {
    if (count > 0) {
      setCount(prev => prev - 1);
      if (vibrationEnabled && 'vibrate' in navigator) {
        try {
          navigator.vibrate(20);
        } catch (e) {
          // ignore
        }
      }
    }
  };

  const confirmReset = () => {
    setCount(0);
    localStorage.removeItem('tasbeeh_count');
    setShowResetModal(false);
    if (vibrationEnabled && 'vibrate' in navigator) {
      try {
        navigator.vibrate([50, 100, 50]);
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] flex flex-col justify-between transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Header Bar */}
      <div className="max-w-3xl mx-auto w-full px-4 pt-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span>📿</span> Digital Tasbeeh
          </h1>
          <p className="text-xs font-semibold opacity-70">
            Keep track of your daily Dhikr with smooth vibration & persistence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Vibration Toggle */}
          <button
            onClick={() => setVibrationEnabled(!vibrationEnabled)}
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' 
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-600'
            }`}
            title="Toggle Vibration"
          >
            <Vibrate className={`h-4 w-4 ${vibrationEnabled ? 'text-teal-500' : 'opacity-40'}`} />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2.5 rounded-xl border transition-all ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-amber-400' 
                : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
            title="Toggle Dark Mode"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Counter Card Area */}
      <div className="max-w-md mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center items-center">
        
        {/* Target Reached Banner */}
        {targetReached && (
          <div className="mb-6 bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 px-4 py-2.5 rounded-2xl flex items-center gap-2 animate-bounce text-sm font-bold">
            <Award className="h-5 w-5 text-amber-500" />
            <span>Target reached! MashaAllah! 🎉</span>
          </div>
        )}

        {/* Target Selection Pills */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs font-bold uppercase tracking-wider opacity-60 mr-1">Target:</span>
          {PRESET_TARGETS.map(t => (
            <button
              key={t}
              onClick={() => setTarget(t)}
              className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all ${
                target === t 
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20' 
                  : isDarkMode ? 'bg-slate-900 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Counter Screen */}
        <div 
          onClick={handleIncrement}
          className={`w-72 h-72 sm:w-80 sm:h-80 rounded-full border-8 flex flex-col justify-center items-center cursor-pointer select-none transition-all active:scale-95 shadow-2xl relative overflow-hidden group ${
            isDarkMode 
              ? 'bg-slate-900 border-teal-600/30 shadow-teal-900/20 hover:border-teal-500/50' 
              : 'bg-white border-teal-600/20 shadow-slate-200 hover:border-teal-500/40'
          }`}
        >
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none"></div>

          <span className={`text-xs sm:text-sm font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-3 ${
            isDarkMode 
              ? 'bg-teal-950/80 text-teal-300 border-teal-800' 
              : 'bg-teal-50 text-teal-800 border-teal-200'
          }`}>
            Count / {target}
          </span>

          <span className={`text-7xl sm:text-8xl font-black tracking-tight transition-all font-mono drop-shadow-sm ${
            isDarkMode ? 'text-teal-300' : 'text-slate-900'
          }`}>
            {count.toLocaleString()}
          </span>

          <span className={`text-xs font-bold mt-4 transition-colors ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Tap circle to count
          </span>
        </div>

        {/* Action Controls (+, -, Reset) */}
        <div className="flex items-center gap-6 mt-10">
          {/* Decrement (-) */}
          <button
            onClick={handleDecrement}
            disabled={count === 0}
            className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-all active:scale-90 disabled:opacity-40 shadow-sm ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
            title="Decrement Count (-)"
          >
            <Minus className="h-6 w-6" />
          </button>

          {/* Primary Increment (+) */}
          <button
            onClick={handleIncrement}
            className="h-20 w-20 rounded-3xl bg-teal-600 hover:bg-teal-700 text-white flex items-center justify-center shadow-lg shadow-teal-600/30 active:scale-95 transition-all"
            title="Increment Count (+)"
          >
            <Plus className="h-10 w-10" />
          </button>

          {/* Reset Counter */}
          <button
            onClick={() => setShowResetModal(true)}
            className={`h-14 w-14 rounded-2xl flex items-center justify-center border transition-all active:scale-90 shadow-sm ${
              isDarkMode 
                ? 'bg-slate-900 border-slate-800 text-red-400 hover:bg-red-950/30' 
                : 'bg-white border-slate-200 text-red-600 hover:bg-red-50'
            }`}
            title="Reset Counter"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className={`max-w-sm w-full p-6 rounded-2xl shadow-2xl border transition-all ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <h3 className="text-lg font-bold text-center mb-2">Reset Tasbeeh Counter?</h3>
            <p className="text-xs text-center opacity-70 mb-6 leading-relaxed">
              This action will reset your current count to 0 and clear saved local storage data.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-md shadow-red-600/20 active:scale-95"
              >
                Yes, Reset Count
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Quote */}
      <div className="py-4 text-center text-xs opacity-50 font-semibold">
        SubhanAllah • Alhamdulillah • Allahu Akbar
      </div>
    </div>
  );
};

export default Tasbeeh;
