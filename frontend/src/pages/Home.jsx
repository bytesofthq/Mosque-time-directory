import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api, { BACKEND_URL } from '../utils/api';
import { 
  Search, MapPin, ArrowRight, Compass, Navigation, BookOpen, RefreshCw, 
  Heart, Share2, Bookmark, Copy, Check, ChevronRight, Star, Clock, 
  Sun, Sunrise, Sunset, Moon, Sparkles, X, CheckCircle, Bell
} from 'lucide-react';
import { usePWA } from '../context/PWAContext';
import OfflineFallback from '../components/OfflineFallback';
import defaultMosque from '../assets/default_mosque.png';
import { useHadith } from '../hooks/useHadith';
import { useAdhkar } from '../hooks/useAdhkar';
import SkeletonLoader from '../components/SkeletonLoader';
import { toast } from 'react-toastify';

// Animated Counter Component for Statistics Section
const AnimatedCounter = ({ target, duration = 1.2, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const elementRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const currentRef = elementRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    
    let start = 0;
    const end = parseInt(target.replace(/[,+]/g, ''), 10);
    if (isNaN(end) || end <= 0) {
      setCount(0);
      return;
    }
    
    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 10);
    
    const timer = setInterval(() => {
      const step = Math.ceil(end / (totalMiliseconds / incrementTime));
      start += step;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target, duration, hasStarted]);

  return (
    <span ref={elementRef} className="font-extrabold text-3xl sm:text-4xl text-slate-900 tracking-tight block">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { isOffline } = usePWA();
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('');
  const [prayerTimings, setPrayerTimings] = useState({});
  const [dates, setDates] = useState({});
  const { hadith, loading: loadingHadith, error: hadithError, refreshHadith } = useHadith();
  const { categories, loadCategories } = useAdhkar();
  
  // Real Statistics state
  const [stats, setStats] = useState({ totalMosques: 0, totalHadiths: 0, totalUsers: 0 });

  // Suggestions states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Hadith interaction states
  const [copiedHadith, setCopiedHadith] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeLang, setActiveLang] = useState('hi'); // Default to Hindi
  const [isHadithModalOpen, setIsHadithModalOpen] = useState(false);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch suggestions based on debounced query
  useEffect(() => {
    if (debouncedSearch.trim().length > 1) {
      const fetchSuggestions = async () => {
        try {
          const response = await api.get('/public/mosques', {
            params: { search: debouncedSearch, limit: 5 }
          });
          setSuggestions(response.data.mosques);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      };
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [debouncedSearch]);

  // Sync bookmark state with localStorage
  useEffect(() => {
    if (hadith?.hadithnumber) {
      const bookmarked = localStorage.getItem(`hadith_bookmarked_${hadith.hadithnumber}`) === 'true';
      setIsBookmarked(bookmarked);
    }
  }, [hadith]);

  const fetchMosques = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/public/mosques', {
        params: { page: 1, limit: 6 } // Fetch exactly 6 directory mosques for redesigned grid
      });
      setMosques(response.data.mosques);
    } catch (error) {
      console.error('Error fetching mosques:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch real statistics
  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get('/public/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching public stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchMosques();
    fetchStats();
  }, [fetchMosques, fetchStats]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    navigate(`/search?q=${search}&area=${area}`);
  };

  const handleClear = () => {
    setSearch('');
    setArea('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (mosque) => {
    setSearch(mosque.mosqueName);
    setShowSuggestions(false);
    navigate(`/mosques/${mosque.slug || mosque._id}`);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return defaultMosque;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${BACKEND_URL}${imagePath}`;
  };

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      try {
        const res = await fetch(
          "https://api.aladhan.com/v1/timingsByCity?city=Lucknow&country=India&method=1&school=1"
        );
        const data = await res.json();
        setPrayerTimings(data.data.timings);
        setDates(data.data.date);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPrayerTimes();
    loadCategories();
  }, [loadCategories]);

  // Hadith actions
  const getTranslationText = () => {
    if (!hadith) return '';
    return hadith.translations?.[activeLang] || hadith.english || '';
  };

  const handleCopyHadith = async () => {
    if (!hadith) return;
    const translation = getTranslationText();
    const textToCopy = `Hadith [${hadith.collection_name} #${hadith.hadithnumber}]\n\nArabic:\n${hadith.arabic}\n\nTranslation (${activeLang.toUpperCase()}):\n${translation}\n\nGrade: ${hadith.grade}\n- via Salah Directory`;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedHadith(true);
      toast.success("Hadith text copied to clipboard!");
      setTimeout(() => setCopiedHadith(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShareHadith = async () => {
    if (!hadith) return;
    const translation = getTranslationText();
    const shareData = {
      title: `Daily Hadith - ${hadith.collection_name}`,
      text: `"${translation}" - ${hadith.collection_name} (No. ${hadith.hadithnumber})`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        handleCopyHadith();
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const handleBookmarkHadith = () => {
    if (!hadith) return;
    const nextState = !isBookmarked;
    setIsBookmarked(nextState);
    localStorage.setItem(`hadith_bookmarked_${hadith.hadithnumber}`, String(nextState));
    if (nextState) {
      toast.success("Hadith bookmarked successfully!");
    } else {
      toast.info("Hadith removed from bookmarks.");
    }
  };

  const calculateIshraqTime = (sunriseStr) => {
    if (!sunriseStr) return "";
    try {
      const [hours, minutes] = sunriseStr.split(":").map(Number);
      let ishraqMin = minutes + 20;
      let ishraqHr = hours;
      if (ishraqMin >= 60) {
        ishraqMin -= 60;
        ishraqHr = (ishraqHr + 1) % 24;
      }
      const hrStr = String(ishraqHr).padStart(2, '0');
      const minStr = String(ishraqMin).padStart(2, '0');
      return `${hrStr}:${minStr}`;
    } catch (e) {
      console.error("Error calculating Ishraq time:", e);
      return "";
    }
  };

  const formatTime = (time) => {
    if (!time) return "--:--";
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Scroll to section helper
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Helper to determine if we should recommend Morning Adhkar or Evening Adhkar
  // Morning Adhkar: after Fajr timing, Evening Adhkar: after Asr timing
  const isEveningAdhkarTime = useCallback(() => {
    if (!prayerTimings.Asr || !prayerTimings.Fajr) {
      const hr = new Date().getHours();
      return hr >= 15 || hr < 4; // 3 PM onwards or night fallback
    }
    
    try {
      const now = new Date();
      const [asrHrs, asrMins] = prayerTimings.Asr.split(':').map(Number);
      const asrTime = new Date();
      asrTime.setHours(asrHrs, asrMins, 0, 0);
      
      const [fajrHrs, fajrMins] = prayerTimings.Fajr.split(':').map(Number);
      const fajrTime = new Date();
      fajrTime.setHours(fajrHrs, fajrMins, 0, 0);

      // Evening Adhkar is active after Asr time up until the next Fajr
      return now >= asrTime || now < fajrTime;
    } catch {
      const hr = new Date().getHours();
      return hr >= 15 || hr < 4;
    }
  }, [prayerTimings]);

  // Dynamic metrics helpers
  const getStatTarget = (key, fallback) => {
    if (stats && stats[key] && stats[key] > 0) {
      return String(stats[key]);
    }
    return String(fallback);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 pb-4 font-sans antialiased text-slate-800 selection:bg-teal-150 selection:text-teal-900">
      
      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative bg-gradient-to-br from-teal-950 via-teal-900 to-emerald-950 text-white pt-28 pb-16 px-4 overflow-hidden border-b border-teal-800/40">
        {/* Abstract Geometric Grid Backdrop */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-[1280px] mx-auto text-center relative z-10 space-y-6">
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Small Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-500/30 px-3.5 py-1 rounded-full text-emerald-300 font-semibold text-xs tracking-wider uppercase backdrop-blur-sm"
            >
              <Compass className="h-3.5 w-3.5 text-amber-400" />
              <span>Islamic Directory & Mosque Finder</span>
            </motion.div>

            {/* Large Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-none text-white max-w-4xl mx-auto"
            >
              Find <span className="text-amber-400">Verified Mosques</span>, <span className="text-amber-400">Prayer Timings</span> & Daily <span className="text-amber-400">Islamic Resources</span>
            </motion.h1>

            {/* Small Description */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-teal-100/90 text-sm sm:text-base max-w-2xl mx-auto font-normal leading-relaxed"
            >
              Find nearby verified mosques, accurate prayer timings, authentic Hadith, morning & evening adhkar and Islamic resources in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center items-center gap-3.5 max-w-sm sm:max-w-none mx-auto pt-2"
            >
              <button
                onClick={() => scrollToSection('mosque-directory')}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-slate-955 font-bold px-7 h-12 rounded-xl shadow-md active:scale-95 transition-all text-sm text-center flex items-center justify-center animate-pulse"
              >
                Explore Mosques
              </button>
              <Link
                to="/nearby-mosques"
                className="w-full sm:w-auto bg-teal-900/60 hover:bg-teal-900/90 text-white border border-teal-500/30 hover:border-teal-500/60 backdrop-blur-md px-7 h-12 rounded-xl font-bold active:scale-95 transition-all text-sm text-center flex items-center justify-center"
              >
                Find Nearby
              </Link>
              <Link
                to="/register-mosque"
                className="w-full sm:w-auto bg-teal-955/20 hover:bg-teal-900/30 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 backdrop-blur-md px-7 h-12 rounded-xl font-bold active:scale-95 transition-all text-sm text-center flex items-center justify-center"
              >
                Register Mosque
              </Link>
            </motion.div>
          </div>

          {/* Feature Pills Navigation */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2.5 pt-6 max-w-3xl mx-auto"
          >
            {[
              { id: 'mosque-directory', label: 'Nearby Mosques', icon: '🕌' },
              { id: 'prayer-times', label: 'Prayer Timings', icon: '🕐' },
              { id: 'featured-hadith', label: 'Daily Hadith', icon: '📖' },
              { link: '/adhkar/morning', label: 'Morning Adhkar', icon: '🤲' },
              { link: '/adhkar/evening', label: 'Evening Adhkar', icon: '🌙' },
              { id: 'discover-everything', label: 'Navigation', icon: '📍' }
            ].map((badge, idx) => (
              badge.link ? (
                <Link
                  key={idx}
                  to={badge.link}
                  className="flex items-center gap-1.5 bg-teal-900/45 hover:bg-teal-800/60 border border-teal-500/15 hover:border-teal-500/30 text-teal-100 text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
                >
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </Link>
              ) : (
                <button
                  key={idx}
                  onClick={() => scrollToSection(badge.id)}
                  className="flex items-center gap-1.5 bg-teal-900/45 hover:bg-teal-800/60 border border-teal-500/15 hover:border-teal-500/30 text-teal-100 text-xs px-3.5 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
                >
                  <span>{badge.icon}</span>
                  <span>{badge.label}</span>
                </button>
              )
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modern Floating Search Bar Container */}
      <div className="max-w-[1280px] mx-auto px-4 -mt-7 relative z-20">
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onSubmit={handleSearchSubmit}
          className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100/90 flex flex-col lg:flex-row gap-3.5 items-center justify-between"
        >
          {/* Mosque Name Search */}
          <div className="w-full relative">
            <Search className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Mosque Name (e.g. Hazratganj Masjid)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-11 pr-4 h-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 font-medium transition-all text-sm animate-pulse-slow"
              aria-label="Search by mosque name"
            />
            {/* Autocomplete Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-50 text-left"
                >
                  {suggestions.map((m) => (
                    <div
                      key={m._id}
                      className="px-4 py-3 hover:bg-teal-50/20 cursor-pointer transition-colors flex items-center justify-between group"
                      onMouseDown={() => handleSuggestionClick(m)}
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-xs group-hover:text-teal-700 transition-colors">{m.mosqueName}</div>
                        <div className="text-slate-400 text-[10px] font-semibold mt-0.5">{m.area}, {m.city}</div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-teal-600 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Area Filter */}
          <div className="w-full relative">
            <MapPin className="absolute left-3.5 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Area (e.g. Aminabad, Lucknow)..."
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full pl-11 pr-4 h-11 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 font-medium transition-all text-sm"
              aria-label="Filter mosques by area"
            />
          </div>

          {/* Search CTA Buttons */}
          <div className="flex w-full lg:w-auto gap-2.5 shrink-0">
            <button
              type="submit"
              className="flex-1 lg:flex-none h-11 px-6 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm flex items-center justify-center"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 h-11 rounded-xl font-semibold transition-all active:scale-95 text-sm flex items-center justify-center"
            >
              Clear
            </button>
          </div>
        </motion.form>
      </div>


      {/* 3. TODAY'S PRAYER TIMES SECTION (65% PRAYER TIMES / 35% ADHKAR) */}
      <section id="prayer-times" className="max-w-[1280px] mx-auto px-4 mt-[100px] text-left scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          
          {/* Left Column (65% - span 6 cols on lg) */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm flex flex-col justify-between hover:border-teal-500/10 transition-colors"
          >
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-1.5">
                    <span>🕌</span>
                    <span>Today's Prayer Times</span>
                  </h3>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5 uppercase tracking-wider">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>Lucknow, Uttar Pradesh, India</span>
                  </p>
                </div>
                {dates?.hijri && (
                  <div className="self-start sm:self-auto bg-teal-55 bg-teal-50 text-teal-900 border border-teal-100/50 px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs">
                    🌙 {dates.hijri.day} {dates.hijri.month.en} {dates.hijri.year} AH
                  </div>
                )}
              </div>

              {prayerTimings.Fajr ? (
                <div className="space-y-2">
                  {[
                    { name: 'Fajr', time: prayerTimings.Fajr, desc: 'Pre-dawn Prayer', icon: <Moon className="h-4.5 w-4.5 text-teal-600" /> },
                    { name: 'Sunrise', time: prayerTimings.Sunrise, desc: 'Sunrise Time', icon: <Sunrise className="h-4.5 w-4.5 text-amber-500" /> },
                    { name: 'Ishraq', time: calculateIshraqTime(prayerTimings.Sunrise), desc: 'Post-sunrise Prayer', icon: <Sun className="h-4.5 w-4.5 text-amber-500" /> },
                    { name: 'Dhuhr', time: prayerTimings.Dhuhr, desc: 'Midday Prayer', icon: <Sun className="h-4.5 w-4.5 text-emerald-600" /> },
                    { name: 'Asr', time: prayerTimings.Asr, desc: 'Afternoon Prayer', icon: <Sun className="h-4.5 w-4.5 text-emerald-600" /> },
                    { name: 'Maghrib', time: prayerTimings.Maghrib, desc: 'Post-sunset Prayer', icon: <Sunset className="h-4.5 w-4.5 text-amber-500" /> },
                    { name: 'Isha', time: prayerTimings.Isha, desc: 'Night Prayer', icon: <Moon className="h-4.5 w-4.5 text-teal-600" /> }
                  ].map((prayer) => (
                    <div 
                      key={prayer.name} 
                      className="flex items-center justify-between py-2.5 px-4 rounded-xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50 transition-all duration-200 group/row"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8.5 w-8.5 h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center transition-colors">
                          {prayer.icon}
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-800 group-hover/row:text-teal-700 transition-colors">{prayer.name}</div>
                          <div className="text-[10px] font-semibold text-slate-400 leading-none mt-0.5">{prayer.desc}</div>
                        </div>
                      </div>
                      <div className="font-black text-slate-900 text-sm sm:text-base tracking-tight pr-1">
                        {formatTime(prayer.time)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-slate-400 font-semibold text-xs">
                  Loading prayer times...
                </div>
              )}
            </div>

            {/* Disclaimer at bottom in English, Hindi, and Urdu */}
            <div className="text-xs text-slate-400 text-center mt-5 space-y-1.5 border-t border-slate-100 pt-3 leading-relaxed font-semibold italic">
              <p>EN: Prayer timings are approximate. Please keep a 2-minute safety buffer before Salah.</p>
              <p className="font-sans">HI: नमाज़ का समय अनुमानित है। कृपया नमाज़ शुरू करने से पहले 2 मिनट का सुरक्षा बफ़र रखें।</p>
              <p className="font-serif" dir="rtl">UR: نماز کے اوقات تخمینی ہیں۔ براہ کرم نماز شروع کرنے سے پہلے 2 منٹ کا حفاظتی وقفہ رکھیں۔</p>
            </div>
          </motion.div>

          {/* Right Column (35% - span 4 cols on lg) with Deep High-Contrast Gradients */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className={`lg:col-span-4 rounded-3xl p-6 shadow-sm border transition-all duration-300 group flex flex-col justify-between ${
              isEveningAdhkarTime() 
                ? 'bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 border-indigo-850 text-white hover:border-indigo-700/50' 
                : 'bg-gradient-to-br from-amber-950 via-amber-900 to-orange-950 border-amber-850 text-white hover:border-amber-700/50'
            }`}
          >
            <div className="space-y-5">
              {/* Header with Islamic Icon */}
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-4">
                <div className={`h-9 w-9 border rounded-lg flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform ${
                  isEveningAdhkarTime() ? 'bg-indigo-900/50 border-indigo-500/30 text-indigo-305' : 'bg-amber-900/50 border-amber-500/30 text-amber-305'
                }`}>
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">Today's Featured Adhkar</h3>
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mt-0.5">
                    {isEveningAdhkarTime() ? 'Evening Remembrance' : 'Morning Remembrance'}
                  </p>
                </div>
              </div>

              {/* Dynamic Content Details */}
              <div className="space-y-2">
                <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">
                  {isEveningAdhkarTime() ? 'Evening Adhkar' : 'Morning Adhkar'}
                </h4>
                <p className="text-slate-200/90 text-xs sm:text-sm leading-relaxed font-normal pt-1">
                  Read authentic daily adhkar from the Sunnah to begin or end your day with remembrance of Allah.
                </p>
              </div>

              {/* 3 Small Badges with High Contrast colors */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { label: 'Authentic', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                  { label: 'Arabic + Translation', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                  { label: 'Audio Available', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' }
                ].map((badge) => (
                  <span 
                    key={badge.label}
                    className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${badge.color}`}
                  >
                    <Check className="h-2.5 w-2.5" />
                    <span>{badge.label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-6">
              <Link
                to={isEveningAdhkarTime() ? '/adhkar/evening' : '/adhkar/morning'}
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md text-xs sm:text-sm group/btn"
              >
                <span>Read Today's Adhkar</span>
                <ArrowRight className="h-4 w-4 text-slate-950 transform group-hover/btn:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 4. FEATURED HADITH SECTION */}
      <section id="featured-hadith" className="max-w-[1280px] mx-auto px-4 mt-[100px] text-left scroll-mt-24">
        {loadingHadith ? (
          <SkeletonLoader variant="featured" />
        ) : hadithError ? (
          <div className="bg-white rounded-3xl border border-rose-100 p-8 text-center max-w-xl mx-auto shadow-sm">
            <span className="bg-rose-550 bg-rose-50 text-rose-800 px-3 py-1 rounded-full text-xs font-bold border border-rose-100 uppercase tracking-wider mb-3 inline-block">Hadith Error</span>
            <p className="text-slate-600 italic text-sm mb-4">"{hadithError}"</p>
            <button onClick={refreshHadith} className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-5 py-2 rounded-xl transition-all active:scale-95 text-xs flex items-center gap-2 mx-auto">
              <RefreshCw className="h-3.5 w-3.5" /> Try Again
            </button>
          </div>
        ) : hadith ? (
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm relative overflow-hidden flex flex-col justify-between max-h-[450px]"
          >
            {/* Header Content */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="bg-teal-55 bg-teal-50 text-teal-800 px-3.5 py-1.5 rounded-full text-[10px] font-bold border border-teal-100 uppercase tracking-widest">
                  Hadith of the Day
                </span>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1.5">
                  Collection: {hadith.collection_name} • Number: #{hadith.hadithnumber}
                </h3>
              </div>

              {/* Language Switcher */}
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/30">
                {[
                  { id: 'hi', label: 'हिन्दी (Hindi)' },
                  { id: 'ur', label: 'اردو (Urdu)' },
                  { id: 'en', label: 'English' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveLang(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeLang === tab.id 
                        ? 'bg-white text-teal-705 text-teal-700 shadow-xs border border-slate-200/10' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Arabic Script & Translation Container */}
            <div className="my-5 overflow-y-auto pr-2 space-y-4 max-h-[220px] scrollbar-thin">
              <p 
                className="text-right font-semibold text-lg sm:text-2xl text-slate-900 leading-loose tracking-wide font-serif"
                dir="rtl"
              >
                {hadith.arabic}
              </p>
              
              <p 
                className={`text-slate-650 text-slate-600 italic py-1 text-sm sm:text-base leading-relaxed ${
                  activeLang === 'ur' 
                    ? 'text-right pr-4 border-r-3 border-teal-500/30 font-serif leading-loose text-xl sm:text-2xl' 
                    : 'pl-4 border-l-3 border-teal-500/30 font-semibold'
                }`}
                dir={activeLang === 'ur' ? 'rtl' : 'ltr'}
              >
                "{getTranslationText()}"
              </p>
            </div>

            {/* Card Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyHadith}
                  className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 px-3.5 py-2 rounded-xl transition-all border border-slate-205 border-slate-200 font-bold text-xs"
                  title="Copy Hadith Text"
                >
                  {copiedHadith ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
                  <span>{copiedHadith ? "Copied!" : "Copy"}</span>
                </button>
                
                <button
                  onClick={handleShareHadith}
                  className="inline-flex items-center gap-1 bg-slate-50 hover:bg-slate-100 active:scale-95 text-slate-600 px-3.5 py-2 rounded-xl transition-all border border-slate-200 font-bold text-xs"
                  title="Share Hadith"
                >
                  <Share2 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Share</span>
                </button>

                <button
                  onClick={handleBookmarkHadith}
                  className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-xl transition-all border font-bold text-xs ${
                    isBookmarked 
                      ? 'bg-amber-50 border-amber-200 text-amber-755 text-amber-700' 
                      : 'bg-slate-50 border-slate-200 text-slate-655 text-slate-655 hover:bg-slate-100'
                  }`}
                  title="Bookmark Hadith"
                >
                  <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-700' : 'text-slate-500'}`} />
                  <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsHadithModalOpen(true)}
                  className="inline-flex items-center bg-teal-50 hover:bg-teal-100 text-teal-800 px-4 py-2 rounded-xl font-bold transition-all border border-teal-100 text-xs"
                >
                  Read More
                </button>
                <button
                  onClick={refreshHadith}
                  className="inline-flex items-center gap-1 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white px-4 py-2 rounded-xl transition-all shadow-sm font-bold text-xs"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Next Hadith</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* Hadith Read More Overlay Modal */}
        <AnimatePresence>
          {isHadithModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsHadithModalOpen(false)}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 relative z-10 overflow-y-auto max-h-[85vh] text-left"
              >
                <button 
                  onClick={() => setIsHadithModalOpen(false)}
                  className="absolute right-5 top-5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 p-2 rounded-full transition-colors active:scale-95"
                >
                  <X className="h-5 w-5" />
                </button>
                
                <h3 className="text-xl font-black text-slate-900 border-b border-slate-100 pb-4 pr-10">
                  Hadith Context & Narrators
                </h3>

                <div className="space-y-6 mt-6">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-teal-800 mb-2">Narrator & Chain</h4>
                    <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                      This Hadith is compiled in {hadith?.collection_name || "Sahih books"} under number {hadith?.hadithnumber}.
                      It carries the grading of <span className="text-emerald-700 font-bold uppercase">{hadith?.grade || "authentic"}</span>.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-teal-800 mb-2">Authenticity & Grading Note</h4>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed">
                      All hadiths displayed on Salah Directory are sourced from verified Sahih (authentic) collections. Gradings are evaluated by major Islamic scholars of Hadith science. Bookmarking this hadith stores the details locally on your device for offline reading.
                    </p>
                  </div>

                  <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-100/50">
                    <h4 className="text-sm font-extrabold text-teal-955 flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      <span>Applying this Sunnah</span>
                    </h4>
                    <p className="text-xs font-semibold text-teal-900/90 leading-relaxed">
                      "Make the Prophet's character your guide. Read the translation, ponder upon its guidance, and make it a habit to implement this teaching in your relationships, daily tasks, and community responsibilities."
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 text-right">
                  <button 
                    onClick={() => setIsHadithModalOpen(false)}
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 text-xs"
                  >
                    Close Dialog
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* 5. FEATURED MOSQUES SECTION (LIMIT EXACTLY 6) */}
      <section id="mosque-directory" className="max-w-[1280px] mx-auto px-4 mt-[100px] text-left scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Featured Mosques</h2>
            <p className="text-slate-400 text-xs font-semibold">Explore verified mosque profiles and active congregation notices.</p>
          </div>
          <Link 
            to="/nearby-mosques" 
            className="text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Mosques</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 h-64 animate-pulse">
                <div className="bg-slate-150 h-32 w-full"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : isOffline && mosques.length === 0 ? (
          <OfflineFallback />
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mosques.slice(0, 6).map((mosque) => (
                <motion.div
                  key={mosque._id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group"
                >
                  {/* Photo Header */}
                  <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                    <img
                      src={getImageUrl(mosque.mosqueImage)}
                      alt={mosque.mosqueName}
                      onError={(e) => { e.target.src = defaultMosque; }}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 bg-slate-900/90 text-white font-extrabold text-[9px] px-2 py-0.5 rounded shadow-sm">
                      {mosque.area}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1 group-hover:text-teal-700 transition-colors">
                        {mosque.mosqueName}
                      </h3>

                      <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 mr-1 flex-shrink-0" />
                        <span className="truncate">{mosque.address}, {mosque.city}</span>
                      </div>

                      <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                        <CheckCircle className="h-3 w-3 text-emerald-600" />
                        <span>Prayer Timings Available</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={mosque.googleMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-teal-650 hover:text-teal-850 flex items-center gap-1 transition-colors"
                      >
                        <Navigation className="h-3 w-3" />
                        <span>Navigate</span>
                      </a>

                      <Link
                        to={`/mosques/${mosque.slug || mosque._id}`}
                        className="inline-flex items-center gap-1 bg-slate-50 hover:bg-teal-700 text-slate-655 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
                      >
                        <span>View Details</span>
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center pt-2">
              <Link 
                to="/nearby-mosques"
                className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-teal-850 border border-slate-200 px-6 py-2.5 rounded-xl font-bold transition-all shadow-xs active:scale-95 text-xs group"
              >
                <span>Explore All Mosques in Finder</span>
                <ArrowRight className="h-4 w-4 text-teal-600 transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </section>



      {/* 7. DISCOVER EVERYTHING SECTION (COMPACT FEATURE INDEX GRID) */}
      <section id="discover-everything" className="max-w-[1280px] mx-auto px-4 mt-[100px] text-left">
        <div className="space-y-1 mb-8 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Everything Available on SalahDirectory</h2>
          <p className="text-slate-400 text-xs font-semibold">Access all directories, tools, and widgets directly in one comprehensive index.</p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {[
            { name: 'Nearby Mosques', desc: 'Find masjids near your current location', icon: <Compass className="h-5 w-5 text-teal-600" />, link: '/nearby-mosques' },
            { name: 'Prayer Timings', desc: 'Accurate local namaz timings', icon: <Clock className="h-5 w-5 text-amber-500" />, action: () => scrollToSection('prayer-times') },
            { name: 'Daily Hadith', desc: 'A new authentic Hadith everyday', icon: <BookOpen className="h-5 w-5 text-indigo-500" />, action: () => scrollToSection('featured-hadith') },
            { name: 'Morning Adhkar', desc: 'Protection duas recited after Fajr', icon: <Sunrise className="h-5 w-5 text-sky-500" />, link: '/adhkar/morning' },
            { name: 'Evening Adhkar', desc: 'Gratitude supplications after Asr', icon: <Sunset className="h-5 w-5 text-indigo-500" />, link: '/adhkar/evening' },
            { name: 'Prayer Duas', desc: 'Supplications before & after prayer', icon: <Heart className="h-5 w-5 text-rose-500" />, link: '/adhkar/prayer' },
            { name: 'Sleep Duas', desc: 'Supplications for peaceful sleep', icon: <Moon className="h-5 w-5 text-indigo-600" />, link: '/adhkar/sleep' },
            { name: 'Travel Duas', desc: 'Protection while travelling', icon: <Navigation className="h-5 w-5 text-sky-600" />, link: '/adhkar/travel' },
            { name: 'Food Duas', desc: 'Duas for before and after meals', icon: <Sparkles className="h-5 w-5 text-amber-500" />, link: '/adhkar/food' },
            { name: 'Wudu Duas', desc: 'Supplications during purification', icon: <Sun className="h-5 w-5 text-teal-600" />, link: '/adhkar/wudu' },
            { name: 'Mosque Navigation', desc: 'Get driving routes on Google Maps', icon: <MapPin className="h-5 w-5 text-emerald-600" />, link: '/nearby-mosques' },
            { name: 'Announcements', desc: 'Stay updated with local mosque boards', icon: <Bell className="h-5 w-5 text-amber-500" />, link: '/nearby-mosques' },
            { name: 'Favorites', desc: 'Bookmark preferred local mosques', icon: <Star className="h-5 w-5 text-yellow-500" />, link: '/nearby-mosques' },
            { name: 'Community', desc: 'Connect with local congregation events', icon: <Compass className="h-5 w-5 text-purple-500" />, link: '/nearby-mosques' }
          ].map((item, idx) => {
            const CardWrapper = item.link ? Link : 'div';
            return (
              <motion.div
                key={idx}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <CardWrapper
                  to={item.link || undefined}
                  onClick={item.action || undefined}
                  className="bg-white p-5 rounded-2xl border border-slate-200/60 hover:border-teal-500/20 shadow-xs hover:shadow-md cursor-pointer transition-all duration-300 group flex flex-col justify-between text-left h-full select-none"
                >
                  <div>
                    <div className="h-9 w-9 bg-slate-50 group-hover:bg-teal-50 rounded-xl flex items-center justify-center mb-4 border border-slate-100 transition-colors">
                      {item.icon}
                    </div>
                    <h3 className="font-extrabold text-slate-800 group-hover:text-teal-700 transition-colors text-sm mb-1 flex items-center gap-1">
                      <span>{item.name}</span>
                    </h3>
                    <p className="text-slate-400 text-xs leading-normal font-semibold">
                      {item.desc}
                    </p>
                  </div>
                  <div className="pt-4 text-right">
                    <span className="inline-flex items-center text-teal-650 group-hover:translate-x-0.5 transition-transform">
                      <ArrowRight className="h-3.5 w-3.5 text-teal-600" />
                    </span>
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 8. WHY SALAHDIRECTORY SECTION (4 VALUE CARDS WITH ROTATE ANIMS) */}


      {/* 9. MOSQUE ADMIN CTA (PREMIUM BANNER) */}
      <section className="max-w-[1280px] mx-auto px-4 mt-[100px]">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="bg-gradient-to-r from-teal-900 to-emerald-800 rounded-3xl p-6 sm:p-10 shadow-lg text-center relative overflow-hidden border border-teal-800/40 text-white"
        >
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Manage Your Mosque Digitally</h2>
            <p className="text-teal-105 text-teal-100/95 text-xs sm:text-sm font-normal leading-relaxed">
              Claim, register, and update your mosque profile in our directories. Keep timings, announcements, visual galleries, and community notices accurate.
            </p>
            
            {/* Features Bullet List */}
            <div className="flex flex-wrap justify-center gap-3 text-[10px] font-bold tracking-wider uppercase text-emerald-200 pb-2">
              <span className="bg-teal-950/40 border border-teal-800 px-3 py-1 rounded-md">✓ Update timings</span>
              <span className="bg-teal-950/40 border border-teal-800 px-3 py-1 rounded-md">✓ Announcements</span>
              <span className="bg-teal-950/40 border border-teal-800 px-3 py-1 rounded-md">✓ Visual Gallery</span>
              <span className="bg-teal-950/40 border border-teal-800 px-3 py-1 rounded-md">✓ Community events</span>
            </div>

            <div className="pt-1">
              <Link
                to="/register-mosque"
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-955 px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 text-xs"
              >
                <span>Register Mosque</span>
                <ArrowRight className="h-4 w-4 text-slate-900" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;
