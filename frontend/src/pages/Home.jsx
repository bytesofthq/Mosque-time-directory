import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { BACKEND_URL } from '../utils/api';
import { Search, MapPin, ArrowRight, Compass, Navigation, BookOpen } from 'lucide-react';

const Home = () => {
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [prayerTimings, setPrayerTimings] = useState({});
  const [dates, setDates] = useState({});
  const [hadith, setHadith] = useState(null);
  const [hadithLang, setHadithLang] = useState('hi');

  const fetchMosques = async () => {
    setLoading(true);
    try {
      const response = await api.get('/public/mosques', {
        params: { search, area, page, limit: 6 }
      });
      setMosques(response.data.mosques);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching mosques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMosques();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchMosques();
  };

  const handleClear = () => {
    setSearch('');
    setArea('');
    setPage(1);
    // Trigger search after state clear
    setTimeout(() => {
      fetchMosques();
    }, 0);
  };

  // Helper to determine the image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return `${BACKEND_URL}/uploads/default_mosque.png`;
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

      console.log(data.data.timings);
      console.log(data.data.date);

      setPrayerTimings(data.data.timings);
      setDates(data.data.date);

    } catch (error) {
      console.error(error);
    }
  };

  const fetchHadith = async () => {
    try {
      const response = await api.get('/public/hadith-of-the-day');
      setHadith(response.data);
    } catch (error) {
      console.error('Error fetching Hadith of the day:', error);
    }
  };

  fetchPrayerTimes();
  fetchHadith();
}, []);

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

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Hero Banner Section */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 text-white py-16 px-4 text-center relative overflow-hidden shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <Compass className="h-14 w-14 mx-auto text-amber-400 mb-4 animate-bounce" />
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-md">
            Find Your Nearest Mosque & Prayer Timings
          </h1>
          <p className="text-teal-100 text-lg max-w-xl mx-auto font-medium mb-6">
            Search across local congregations for verified Jamaat times, community announcements, and directions.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register-mosque"
              className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
            >
              Register your mosque
            </Link>
            <Link
              to="/nearby-mosques"
              className="inline-flex items-center bg-teal-900/60 hover:bg-teal-900/80 text-white border border-teal-500/35 backdrop-blur-sm px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 text-sm"
            >
              Find Mosque Nearby
            </Link>
          </div>
        </div>
      </div>

      {/* Search & Filter Container */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 sm:px-6 lg:px-8 relative z-20">
        <form
          onSubmit={handleSearchSubmit}
          className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          {/* Mosque Name Search */}
          <div className="w-full relative">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Mosque Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium"
            />
          </div>

          {/* Area Search */}
          <div className="w-full relative">
            <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by Area (e.g. Aminabad, Hazratganj)..."
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium"
            />
          </div>

          {/* Buttons */}
          <div className="flex w-full md:w-auto gap-3">
            <button
              type="submit"
              className="flex-1 md:flex-none bg-teal-700 hover:bg-teal-800 text-white px-7 py-3 rounded-xl font-bold transition-all shadow-md shadow-teal-700/20 active:scale-95"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-5 py-3 rounded-xl font-semibold transition-all active:scale-95"
            >
              Clear
            </button>
          </div>
        </form>
      </div>

      {/* Daily Lucknow Prayer Times Widget */}
      {prayerTimings.Fajr && (
        <div className="max-w-7xl mx-auto px-4 mt-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100/80 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Compass className="h-5.5 w-5.5 text-teal-600 animate-spin-slow" />
                  <span>Today's Lucknow Prayer Times (Aladhan)</span>
                </h2>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">
                  Lucknow, India (Hanfi) — {dates?.gregorian?.date}
                </p>
              </div>
              {dates?.hijri && (
                <div className="self-start md:self-auto bg-teal-50/80 text-teal-800 px-4 py-2 rounded-xl text-xs font-bold border border-teal-100/70">
                  {dates.hijri.day} {dates.hijri.month.en} {dates.hijri.year} AH
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
              {[
                { name: 'Fajr', time: prayerTimings.Fajr, color: 'from-orange-500/10 to-amber-500/10 text-amber-800 border-amber-200/40' },
                { name: 'Sunrise', time: prayerTimings.Sunrise, color: 'from-sky-500/10 to-blue-500/10 text-sky-800 border-sky-200/40' },
                { name: 'Dhuhr', time: prayerTimings.Dhuhr, color: 'from-emerald-500/10 to-teal-500/10 text-emerald-800 border-emerald-200/40' },
                { name: 'Asr', time: prayerTimings.Asr, color: 'from-indigo-500/10 to-purple-500/10 text-indigo-800 border-indigo-200/40' },
                { name: 'Maghrib', time: prayerTimings.Maghrib, color: 'from-rose-500/10 to-red-500/10 text-rose-800 border-rose-200/40' },
                { name: 'Isha', time: prayerTimings.Isha, color: 'from-slate-600/10 to-slate-800/10 text-slate-800 border-slate-200/40' },
                { name: 'Sunset', time: prayerTimings.Sunset, color: 'from-red-500/10 to-rose-500/10 text-red-800 border-red-200/40' }
              ].map((prayer) => (
                <div key={prayer.name} className={`bg-gradient-to-br ${prayer.color} p-4 rounded-xl text-center border shadow-sm transition-all duration-300 hover:translate-y-[-2px]`}>
                  <span className="block text-xs font-bold uppercase tracking-wider opacity-85 mb-1.5">{prayer.name}</span>
                  <span className="block text-lg font-black">{formatTime(prayer.time)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hadith of the Day Widget */}
      {hadith && (
        <div className="max-w-7xl mx-auto px-4 mt-8 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 relative overflow-hidden">
            {/* Decorative Book Icon */}
            <div className="absolute right-0 top-0 opacity-[0.03] text-teal-800 pointer-events-none">
              <BookOpen className="h-64 w-64 -mr-12 -mt-12" />
            </div>

            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <span className="bg-teal-50 text-teal-800 px-3 py-1 rounded-full text-xs font-bold border border-teal-100 uppercase tracking-wider">
                    Hadith of the Day
                  </span>
                  <h2 className="text-sm font-bold text-slate-400 mt-2">
                    {hadith.reference}
                  </h2>
                </div>
                {/* Language Select Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                  {[
                    { id: 'hi', label: 'हिन्दी (Hindi)' },
                    { id: 'ur', label: 'اردو (Urdu)' },
                    { id: 'en', label: 'English' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setHadithLang(tab.id)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        hadithLang === tab.id 
                          ? 'bg-white text-teal-700 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p 
                  className={`text-slate-700 leading-relaxed font-semibold italic text-lg sm:text-xl ${
                    hadithLang === 'ur' ? 'text-right font-nastaliq leading-loose' : ''
                  }`}
                  dir={hadithLang === 'ur' ? 'rtl' : 'ltr'}
                >
                  "{hadith.text[hadithLang]}"
                </p>
                <div className="pt-2 flex justify-between items-center text-xs font-bold text-slate-400">
                  <span>— {hadith.narrator}</span>
                  <span className="uppercase tracking-wider">Sahih al-Bukhari</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mosque Cards Listing */}
      <div className="max-w-7xl mx-auto px-4 mt-12 sm:px-6 lg:px-8">
        {loading ? (
          /* Loading Skeletal State */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-96 animate-pulse">
                <div className="bg-slate-200 h-48 w-full"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                  <div className="h-10 bg-slate-200 rounded w-1/3 pt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : mosques.length === 0 ? (
          /* Empty Search State */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center max-w-lg mx-auto mt-8">
            <div className="h-16 w-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <Compass className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Mosques Found</h3>
            <p className="text-slate-500 font-medium">
              We couldn't find any mosques matching your keywords. Please try adjusting your spelling or filters.
            </p>
          </div>
        ) : (
          /* Main Mosque Grid */
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mosques.map((mosque) => (
                <div
                  key={mosque._id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:translate-y-[-4px] border border-slate-100/90 overflow-hidden flex flex-col transition-all duration-300 group"
                >
                  {/* Image Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={getImageUrl(mosque.mosqueImage)}
                      alt={mosque.mosqueName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-teal-800/95 backdrop-blur-sm text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-full shadow-md">
                      {mosque.area}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-teal-700 transition-colors">
                      {mosque.mosqueName}
                    </h3>

                    <div className="flex items-center text-slate-500 text-sm mt-2 font-medium">
                      <MapPin className="h-4 w-4 text-slate-400 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{mosque.address}</span>
                    </div>

                    <p className="text-slate-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">
                      {mosque.city}, {mosque.state} - {mosque.pincode}
                    </p>

                    <p className="text-slate-500 text-sm mt-4 line-clamp-2 leading-relaxed">
                      {mosque.aboutMasjid || "No description provided for this masjid yet."}
                    </p>

                    {/* View Details CTA */}
                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={mosque.googleMapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>Navigate</span>
                      </a>

                      <Link
                        to={`/mosques/${mosque._id}`}
                        className="inline-flex items-center space-x-1.5 bg-teal-50 hover:bg-teal-700 text-teal-700 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200"
                      >
                        <span>View Details</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-3 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-slate-600 text-sm font-bold px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded-lg">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mosque Admin Register CTA */}
      <div className="max-w-7xl mx-auto px-4 mt-16 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-3xl p-8 sm:p-12 shadow-xl text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white mb-4">Are you a Mosque Administrator?</h2>
            <p className="text-teal-100 text-base mb-8 font-medium">
              Register your mosque to manage prayer timings, post announcements, share gallery photos, and keep your congregation updated.
            </p>
            <Link
              to="/register-mosque"
              className="inline-flex items-center bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-md active:scale-95 text-lg"
            >
              Register your mosque
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
