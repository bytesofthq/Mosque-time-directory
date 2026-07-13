import React, { useState, useEffect } from 'react';
import api, { BACKEND_URL } from '../utils/api';
import { getCurrentLocation, reverseGeocode, forwardGeocode } from '../utils/location';
import { useAuth } from '../hooks/useAuth';
import { 
  Building, 
  Clock, 
  Megaphone, 
  Image as ImageIcon, 
  MapPin, 
  Phone, 
  User, 
  Compass, 
  Navigation, 
  Info, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import defaultMosque from '../assets/default_mosque.png';

const MosqueDashboard = () => {
  const { user, updateProfileState } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mosque Creation Form State
  const [formData, setFormData] = useState({
    mosqueName: '',
    address: '',
    area: '',
    city: '',
    state: '',
    pincode: '',
    googleMapLink: '',
    latitude: '',
    longitude: '',
    aboutMasjid: ''
  });

  const [formLoading, setFormLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'error' });

  useEffect(() => {
    if (!user?.mosqueId) {
      setLoading(false);
      return;
    }

    const fetchMyMosqueData = async () => {
      try {
        const response = await api.get('/mosque/my-mosque');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching own mosque details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyMosqueData();
  }, [user?.mosqueId]);

  const showAlert = (message, type = 'error') => {
    setAlert({ show: true, message, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'error' });
    }, 6000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (['address', 'area', 'city', 'state', 'pincode'].includes(name)) {
        updated.latitude = '';
        updated.longitude = '';
      }
      return updated;
    });
  };

  const detectLocation = async () => {
    setGeoLoading(true);
    try {
      const coords = await getCurrentLocation();
      const lat = coords.latitude.toFixed(6);
      const lon = coords.longitude.toFixed(6);

      const addressData = await reverseGeocode(lat, lon);

      setFormData(prev => {
        const mName = prev.mosqueName || 'Our Mosque';
        const locality = addressData.area || addressData.locality || addressData.city || 'our local community';
        
        let generatedAbout = prev.aboutMasjid;
        if (!generatedAbout) {
           generatedAbout = `Welcome to ${mName}. Located in the heart of ${locality}, our mosque serves as a spiritual center for daily prayers, community gatherings, and Islamic education.`;
        }

        return {
          ...prev,
          latitude: lat,
          longitude: lon,
          address: addressData.road || prev.address,
          area: addressData.locality || prev.area,
          city: addressData.city || prev.city,
          state: addressData.state || prev.state,
          pincode: addressData.postcode || prev.pincode,
          googleMapLink: prev.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
          aboutMasjid: generatedAbout
        };
      });

      showAlert('Location details auto-filled successfully!', 'success');
    } catch (error) {
      console.error('Error detecting location:', error);
      showAlert(error.message || 'Failed to detect location. Please enter details manually.');
    } finally {
      setGeoLoading(false);
    }
  };

  const resolveLocationFromAddress = async () => {
    if (!formData.address || !formData.city) return;

    const queries = [
      [formData.address, formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', '),
      [formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', '),
      [formData.city, formData.state, formData.pincode].filter(Boolean).join(', ')
    ];

    for (const q of queries) {
      try {
        const result = await forwardGeocode(q);
        if (result) {
          setFormData(prev => ({
            ...prev,
            latitude: result.latitude,
            longitude: result.longitude,
            googleMapLink: `https://www.google.com/maps/search/?api=1&query=${result.latitude},${result.longitude}`
          }));
          break;
        }
      } catch (error) {
        console.error(`Error resolving location for query "${q}":`, error);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mosqueName || !formData.address || !formData.area || !formData.city || !formData.state || !formData.pincode) {
      return showAlert('Please fill out all basic Mosque details.');
    }

    setFormLoading(true);

    let resolvedLat = formData.latitude || null;
    let resolvedLon = formData.longitude || null;

    if (!resolvedLat || !resolvedLon) {
      const queries = [
        [formData.address, formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', '),
        [formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', '),
        [formData.city, formData.state, formData.pincode].filter(Boolean).join(', ')
      ];

      for (const q of queries) {
        try {
          const result = await forwardGeocode(q);
          if (result) {
            resolvedLat = result.latitude;
            resolvedLon = result.longitude;
            break;
          }
        } catch (error) {
          console.error(`Geocoding error:`, error);
        }
      }
    }

    const mapLink = formData.googleMapLink || (resolvedLat && resolvedLon ? `https://www.google.com/maps/search/?api=1&query=${resolvedLat},${resolvedLon}` : '');

    if (!mapLink) {
      setFormLoading(false);
      return showAlert('Could not automatically resolve mosque coordinates. Please provide a Google Maps Link.');
    }

    try {
      const response = await api.post('/mosque/my-mosque', {
        ...formData,
        latitude: resolvedLat,
        longitude: resolvedLon,
        googleMapLink: mapLink
      });

      showAlert('Mosque registered successfully!', 'success');
      
      // Update local storage and authentication context with new user state (having mosqueId)
      updateProfileState(response.data.user);
    } catch (err) {
      console.error('Error creating mosque:', err);
      showAlert(err.response?.data?.message || 'Error saving mosque details.');
    } finally {
      setFormLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  // If user does not have a mosque assigned, show creation wizard
  if (!user?.mosqueId) {
    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        <div className="text-center mb-8">
          <div className="h-14 w-14 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center shadow-md shadow-teal-700/5 mx-auto mb-3">
            <Building className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create & Register Your Mosque</h2>
          <p className="mt-1.5 text-xs text-slate-500 font-semibold max-w-md mx-auto">
            Provide details about your mosque to publish it to the directory.
          </p>
        </div>

        {alert.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-start space-x-2.5 text-sm font-semibold transition-all border ${
            alert.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
          }`}>
            {alert.type === 'error' ? <AlertCircle className="h-5 w-5 flex-shrink-0" /> : <CheckCircle2 className="h-5 w-5 flex-shrink-0" />}
            <span>{alert.message}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100">
          
          {/* Geolocation Button */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <Compass className="h-4.5 w-4.5 text-teal-600" />
              <span>Mosque Details</span>
            </h3>
            <button
              type="button"
              onClick={detectLocation}
              disabled={geoLoading}
              className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <MapPin className="h-4 w-4" />
              {geoLoading ? 'Detecting Location...' : 'Use Auto Location'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Mosque Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Mosque Name *</label>
              <input
                type="text"
                name="mosqueName"
                required
                placeholder="e.g. Jama Masjid Lucknow"
                value={formData.mosqueName}
                onChange={handleInputChange}
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Street Address *</label>
              <input
                type="text"
                name="address"
                required
                placeholder="e.g. 12, Chowk Road"
                value={formData.address}
                onChange={handleInputChange}
                onBlur={resolveLocationFromAddress}
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
              />
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Area / Locality *</label>
              <input
                type="text"
                name="area"
                required
                placeholder="e.g. Aminabad"
                value={formData.area}
                onChange={handleInputChange}
                onBlur={resolveLocationFromAddress}
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">City *</label>
              <input
                type="text"
                name="city"
                required
                placeholder="e.g. Lucknow"
                value={formData.city}
                onChange={handleInputChange}
                onBlur={resolveLocationFromAddress}
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">State *</label>
              <input
                type="text"
                name="state"
                required
                placeholder="e.g. Uttar Pradesh"
                value={formData.state}
                onChange={handleInputChange}
                onBlur={resolveLocationFromAddress}
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Pincode *</label>
              <input
                type="text"
                name="pincode"
                required
                placeholder="e.g. 226001"
                value={formData.pincode}
                onChange={handleInputChange}
                onBlur={resolveLocationFromAddress}
                className="block w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
              />
            </div>

            {/* Google Map Link */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Google Maps Link</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Navigation className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="url"
                  name="googleMapLink"
                  placeholder="https://maps.google.com/?q=... (optional, auto-generated from address)"
                  value={formData.googleMapLink}
                  onChange={handleInputChange}
                  className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                />
              </div>
            </div>

            {/* About Masjid */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">About Masjid (Optional)</label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 pt-3 pointer-events-none">
                  <Info className="h-4 w-4 text-slate-400" />
                </div>
                <textarea
                  name="aboutMasjid"
                  rows="3"
                  placeholder="History, timings, Quran classes, facilities, etc..."
                  value={formData.aboutMasjid}
                  onChange={handleInputChange}
                  className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm resize-none"
                ></textarea>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={formLoading}
              className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center min-w-[140px]"
            >
              {formLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Register Mosque'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Default Dashboard widgets if mosque is already assigned
  const { mosque, timings, announcements } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      {mosque && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
          <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 shadow-inner flex-shrink-0">
            <img
              src={getImageUrl(mosque.mosqueImage)}
              alt={mosque.mosqueName}
              onError={(e) => { e.target.src = defaultMosque; }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-grow space-y-1">
            <h2 className="text-2xl font-bold text-slate-800">Assalamu Alaikum!</h2>
            <p className="text-slate-500 text-sm font-semibold">
              You are managing <strong className="text-teal-700 font-bold">{mosque.mosqueName}</strong> ({mosque.area}, {mosque.city}) with username: <span className="bg-teal-50 border border-teal-150 px-2 py-0.5 rounded text-xs text-teal-800 font-mono font-bold">{mosque.username}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Link 
          to="/mosque-admin/my-mosque" 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4"
        >
          <div className="bg-teal-50 p-3.5 rounded-xl text-teal-600 shadow-inner">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Mosque</span>
            <span className="font-bold text-slate-700 text-sm">Edit Profile</span>
          </div>
        </Link>

        <Link 
          to="/mosque-admin/timings" 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4"
        >
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600 shadow-inner">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Namaz Times</span>
            <span className="font-bold text-slate-700 text-sm">Update Timings</span>
          </div>
        </Link>

        <Link 
          to="/mosque-admin/announcements" 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4"
        >
          <div className="bg-amber-50 p-3.5 rounded-xl text-amber-600 shadow-inner">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Announcements</span>
            <span className="font-bold text-slate-700 text-sm">{(announcements || []).length} Posted</span>
          </div>
        </Link>

        <Link 
          to="/mosque-admin/gallery" 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4"
        >
          <div className="bg-violet-50 p-3.5 rounded-xl text-violet-600 shadow-inner">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Gallery</span>
            <span className="font-bold text-slate-700 text-sm">Change Image</span>
          </div>
        </Link>
      </div>

      {/* Mosque Mini Overview */}
      {mosque && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Left Card: Main Details */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-50 pb-3">Mosque Details Card</h3>
            <div className="space-y-4 text-sm font-medium">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Address</span>
                  <p className="text-slate-700 font-bold">{mosque.address}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{mosque.area}, {mosque.city}, {mosque.pincode}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 pt-3 border-t border-slate-50">
                <User className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Imam Name</span>
                  <p className="text-slate-700 font-bold">{mosque.contact?.imamName || 'Not Set'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-3 border-t border-slate-50">
                <Phone className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Imam Mobile</span>
                  <p className="text-slate-700 font-bold">{mosque.contact?.imamMobile || 'Not Set'}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-3 border-t border-slate-50">
                <User className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-xs font-bold uppercase">Mosque Username</span>
                  <p className="text-slate-700 font-bold font-mono">{mosque.username}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Quick Prayer Summary */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-base border-b border-slate-50 pb-3 flex justify-between items-center">
              <span>Namaz Jamaat Times</span>
              <Link to="/mosque-admin/timings" className="text-teal-700 hover:text-teal-800 text-xs font-bold uppercase">Edit</Link>
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'Fajr', val: timings?.Fajr?.jamaat },
                { label: 'Zuhr', val: timings?.Zuhr?.jamaat },
                { label: 'Asr', val: timings?.Asr?.jamaat },
                { label: 'Maghrib', val: timings?.Maghrib?.jamaat },
                { label: 'Isha', val: timings?.Isha?.jamaat },
                { label: 'Jumma', val: timings?.Jumma?.khutbah }
              ].map((p) => (
                <div key={p.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-500 text-xs uppercase">{p.label}</span>
                  <span className="font-extrabold text-slate-700">{p.val || '--:--'}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default MosqueDashboard;
