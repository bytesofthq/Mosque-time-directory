import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { BACKEND_URL } from '../utils/api';
import { Search, MapPin, ArrowRight, Compass, Navigation } from 'lucide-react';
import defaultMosque from '../assets/default_mosque.png';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryQ = searchParams.get('q') || '';
  const queryArea = searchParams.get('area') || '';
  const queryPage = parseInt(searchParams.get('page')) || 1;

  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Local inputs to allow user to modify search on this page
  const [searchVal, setSearchVal] = useState(queryQ);
  const [areaVal, setAreaVal] = useState(queryArea);

  // Suggestions states
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Sync inputs with URL parameters if they change
  useEffect(() => {
    setSearchVal(queryQ);
    setAreaVal(queryArea);
  }, [queryQ, queryArea]);

  // Debounce search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchVal);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchVal]);

  // Fetch suggestions
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

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await api.get('/public/mosques', {
        params: { 
          search: queryQ, 
          area: queryArea, 
          page: queryPage, 
          limit: 6 
        }
      });
      setMosques(response.data.mosques);
      setTotalPages(response.data.pages);
      setTotalResults(response.data.total || response.data.mosques.length);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [queryQ, queryArea, queryPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setSearchParams({
      q: searchVal,
      area: areaVal,
      page: 1
    });
  };

  const handleClear = () => {
    setSearchVal('');
    setAreaVal('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSearchParams({
      q: '',
      area: '',
      page: 1
    });
  };

  const handleSuggestionClick = (mosque) => {
    setSearchVal(mosque.mosqueName);
    setShowSuggestions(false);
    setSearchParams({
      q: mosque.mosqueName,
      area: areaVal,
      page: 1
    });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({
      q: queryQ,
      area: queryArea,
      page: newPage
    });
  };

  // Helper to determine the image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return defaultMosque;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `${BACKEND_URL}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Search Bar Header */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 text-white py-12 px-4 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-center mb-6">
            Search Directory
          </h1>
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-4xl mx-auto bg-white p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 items-center justify-between text-slate-800"
          >
            {/* Mosque Name Search */}
            <div className="w-full relative">
              <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Mosque Name..."
                value={searchVal}
                onChange={(e) => {
                  setSearchVal(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium"
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto divide-y divide-slate-50 text-left">
                  {suggestions.map((m) => (
                    <div
                      key={m._id}
                      className="px-4 py-3 hover:bg-teal-50/40 cursor-pointer transition-colors flex items-center justify-between group"
                      onMouseDown={() => handleSuggestionClick(m)}
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">{m.mosqueName}</div>
                        <div className="text-slate-400 text-xs font-semibold">{m.area}, {m.city}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Area Search */}
            <div className="w-full relative">
              <MapPin className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter by Area (e.g. Aminabad)..."
                value={areaVal}
                onChange={(e) => setAreaVal(e.target.value)}
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
      </div>

      {/* Main Results Container */}
      <div className="max-w-7xl mx-auto px-4 mt-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-700">
            {loading ? (
              'Searching for mosques...'
            ) : (
              <>
                Found <span className="text-teal-700">{totalResults}</span> {totalResults === 1 ? 'mosque' : 'mosques'} matching your criteria
              </>
            )}
          </h2>
          {(queryQ || queryArea) && (
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/50">
              Filtered search
            </span>
          )}
        </div>

        {loading ? (
          /* Loading Skeletal State */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-96 animate-pulse">
                <div className="bg-slate-200 h-48 w-full"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-slate-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6 animate-pulse"></div>
                  <div className="h-10 bg-slate-200 rounded w-1/3 pt-4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : mosques.length === 0 ? (
          /* Empty Search State */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center max-w-lg mx-auto mt-8">
            <div className="h-16 w-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <Compass className="h-8 w-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Mosques Found</h3>
            <p className="text-slate-500 font-medium mb-6">
              We couldn't find any mosques matching your keywords. Please try adjusting your spelling or filters.
            </p>
            <button
              onClick={handleClear}
              className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            >
              Clear Search & Show All
            </button>
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
                      onError={(e) => { e.target.src = defaultMosque; }}
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
                  disabled={queryPage === 1}
                  onClick={() => handlePageChange(Math.max(queryPage - 1, 1))}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-slate-600 text-sm font-bold px-3 py-1 bg-teal-50 border border-teal-100 text-teal-800 rounded-lg">
                  Page {queryPage} of {totalPages}
                </span>
                <button
                  disabled={queryPage === totalPages}
                  onClick={() => handlePageChange(Math.min(queryPage + 1, totalPages))}
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

export default SearchResults;
