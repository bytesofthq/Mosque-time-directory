import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Search, MapPin, ArrowRight, Compass, Navigation } from 'lucide-react';

const Home = () => {
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      return 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800'; // Sleek fallback Mosque photo
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
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
          <p className="text-teal-100 text-lg max-w-xl mx-auto font-medium">
            Search across local congregations for verified Jamaat times, community announcements, and directions.
          </p>
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
    </div>
  );
};

export default Home;
