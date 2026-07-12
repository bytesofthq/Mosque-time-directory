import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { BACKEND_URL } from '../utils/api';
import { 
  Compass, 
  MapPin, 
  ArrowRight, 
  Navigation, 
  AlertCircle,
  Footprints,
  Clock
} from 'lucide-react';
import defaultMosque from '../assets/default_mosque.png';

const NearbyMosques = () => {
  const [coordinates, setCoordinates] = useState(null);
  const [radius, setRadius] = useState(500); // Default radius: 500 meters
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  // Get user's location
  const getUserLocation = () => {
    setLoading(true);
    setError('');
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (err) => {
        console.error('Error getting location:', err);
        setError('Permission denied or failed to retrieve your location. Please enable location permissions.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Trigger geolocation on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Fetch nearby mosques when coordinates or radius changes
  useEffect(() => {
    if (!coordinates) return;

    const fetchNearby = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await api.get('/public/mosques-nearby', {
          params: {
            lat: coordinates.lat,
            lng: coordinates.lng,
            radius: radius
          }
        });
        setMosques(response.data);
      } catch (err) {
        console.error('Error fetching nearby mosques:', err);
        setError('Failed to load nearby mosques. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [coordinates, radius]);

  const formatDistance = (meters) => {
    if (!meters && meters !== 0) return '';
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(2)} km`;
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '';
    const mins = Math.ceil(seconds / 60);
    return `${mins} min`;
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 text-white py-14 px-4 text-center relative overflow-hidden shadow-md">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <MapPin className="h-14 w-14 mx-auto text-amber-400 mb-3 animate-bounce" />
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 drop-shadow-md">
            Find Mosque Nearby
          </h1>
          <p className="text-teal-100 text-base max-w-xl mx-auto font-medium">
            Locate mosques around you based on your current physical location and filter by distance.
          </p>
          {coordinates && (
            <div className="mt-3 text-xs text-emerald-300 font-bold bg-teal-900/40 border border-teal-700/30 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>My Location: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 sm:px-6 lg:px-8 relative z-20">
        <div className="bg-white p-5 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Search Radius:</span>
            <select
              value={radius}
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 hover:border-teal-500 text-slate-700 font-bold py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-sm transition-all"
            >
              <option value={100}>100 Meters</option>
              <option value={200}>200 Meters</option>
              <option value={300}>300 Meters</option>
              <option value={500}>500 Meters</option>
              <option value={1000}>1 Kilometer</option>
            </select>
          </div>

          <button
            onClick={getUserLocation}
            disabled={loading}
            className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Compass className={`h-4.5 w-4.5 ${loading && !coordinates ? 'animate-spin' : ''}`} />
            <span>Refresh Location</span>
          </button>
        </div>
      </div>

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
        ) : error ? (
          /* Error State */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-150 p-12 text-center max-w-lg mx-auto">
            <div className="h-14 w-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Location Error</h3>
            <p className="text-slate-500 font-semibold text-sm leading-relaxed mb-6">
              {error}
            </p>
            <button
              onClick={getUserLocation}
              className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
            >
              Try Again
            </button>
          </div>
        ) : mosques.length === 0 ? (
          /* Empty Proximity State */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center max-w-lg mx-auto">
            <div className="h-16 w-16 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <Compass className="h-8 w-8 animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Mosques Found</h3>
            <p className="text-slate-500 font-semibold text-sm leading-relaxed">
              We couldn't locate any registered mosques within {radius < 1000 ? `${radius}m` : '1km'} of your position. Try selecting a larger search radius.
            </p>
          </div>
        ) : (
          /* Nearby Mosque Grid */
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
                  <div className="absolute top-4 right-4 bg-teal-800/95 backdrop-blur-sm text-emerald-400 font-bold text-xs px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                    <Footprints className="h-3.5 w-3.5" />
                    <span>{formatDistance(mosque.distance)} walk</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-teal-700 transition-colors">
                    {mosque.mosqueName}
                  </h3>
                  
                  {/* Walking Details Row */}
                  <div className="flex items-center gap-3.5 mt-2 bg-slate-50 border border-slate-100 p-2 px-3 rounded-xl w-fit">
                    <div className="flex items-center gap-1 text-slate-600 text-xs font-bold">
                      <Footprints className="h-4 w-4 text-teal-600" />
                      <span>{formatDistance(mosque.distance)}</span>
                    </div>
                    <div className="h-3 w-px bg-slate-200" />
                    <div className="flex items-center gap-1 text-slate-600 text-xs font-bold">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{formatDuration(mosque.duration)} Walk</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-slate-500 text-sm mt-3 font-medium">
                    <MapPin className="h-4 w-4 text-slate-400 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{mosque.address}</span>
                  </div>

                  <p className="text-slate-400 text-xs mt-1.5 font-semibold uppercase tracking-wider">
                    {mosque.area}, {mosque.city}
                  </p>

                  <p className="text-slate-500 text-sm mt-4 line-clamp-2 leading-relaxed flex-grow">
                    {mosque.aboutMasjid || "No description provided for this masjid yet."}
                  </p>

                  {/* View Details CTA */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <a 
                      href={coordinates ? `https://www.google.com/maps/dir/?api=1&origin=${coordinates.lat},${coordinates.lng}&destination=${mosque.latitude},${mosque.longitude}&travelmode=walking` : mosque.googleMapLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      <span>Navigate</span>
                    </a>
                    
                    <Link
                      to={`/mosques/${mosque.slug || mosque._id}`}
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
        )}
      </div>
    </div>
  );
};

export default NearbyMosques;
