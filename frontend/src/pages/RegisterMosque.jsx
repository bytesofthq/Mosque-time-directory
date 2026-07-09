import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Compass, 
  User, 
  Mail, 
  Lock, 
  Building, 
  MapPin, 
  Navigation, 
  Info, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

const RegisterMosque = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Admin Fields
    name: '',
    email: '',
    password: '',
    // Mosque Fields
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

  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'error' });

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
      // If the user manually edits the address text fields, clear the auto-detected coordinates
      // so that they will be re-geocoded on submit based on their new text.
      if (['address', 'area', 'city', 'state', 'pincode'].includes(name)) {
        updated.latitude = '';
        updated.longitude = '';
      }
      return updated;
    });
  };



  const detectLocation = () => {
    if (!navigator.geolocation) {
      return showAlert('Geolocation is not supported by your browser.');
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);

        let reverseGeocodeData = {};
        try {
          // Fetch address details from OpenStreetMap Nominatim API in English
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`);
          const data = await response.json();
          if (data) {
            const addr = data.address || {};
            
            // Street Address extraction
            let streetAddress = addr.road || addr.street || addr.residential || addr.path || '';
            if (!streetAddress && data.display_name) {
              const parts = data.display_name.split(',');
              streetAddress = parts[0]?.trim() || '';
            }

            // Area/Locality extraction
            let areaLocality = addr.suburb || addr.neighbourhood || addr.village || addr.hamlet || addr.town || addr.city_district || '';
            if (!areaLocality && data.display_name) {
              const parts = data.display_name.split(',');
              areaLocality = parts[1]?.trim() || parts[0]?.trim() || '';
            }

            reverseGeocodeData = {
              address: streetAddress,
              area: areaLocality,
              city: addr.city || addr.state_district || addr.county || addr.town || '',
              state: addr.state || '',
              pincode: addr.postcode || '',
            };
          }
        } catch (error) {
          console.error("Error fetching reverse geocode data:", error);
        }

        setFormData(prev => {
          const mosqueName = prev.mosqueName || 'Our Mosque';
          const locality = reverseGeocodeData.area || reverseGeocodeData.city || 'our local community';
          
          let generatedAbout = prev.aboutMasjid;
          if (!generatedAbout) {
             generatedAbout = `Welcome to ${mosqueName}. Located in the heart of ${locality}, our mosque serves as a spiritual center for daily prayers, community gatherings, and Islamic education. We strive to foster a welcoming environment for all community members, providing a peaceful space for worship and reflection.`;
          }

          return {
            ...prev,
            latitude: lat,
            longitude: lon,
            address: reverseGeocodeData.address || prev.address,
            area: reverseGeocodeData.area || prev.area,
            city: reverseGeocodeData.city || prev.city,
            state: reverseGeocodeData.state || prev.state,
            pincode: reverseGeocodeData.pincode || prev.pincode,
            googleMapLink: prev.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
            aboutMasjid: generatedAbout
          };
        });

        setGeoLoading(false);
        showAlert('Location details auto-filled successfully!', 'success');
      },
      (error) => {
        console.error('Error detecting location:', error);
        setGeoLoading(false);
        showAlert('Failed to detect location. Please enter details manually.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const resolveLocationFromAddress = async () => {
    // Only resolve if basic address fields are filled (address and city are minimum)
    if (!formData.address || !formData.city) return;

    const queries = [
      [formData.address, formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', '),
      [formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', '),
      [formData.city, formData.state, formData.pincode].filter(Boolean).join(', ')
    ];

    for (const q of queries) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&accept-language=en`);
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat).toFixed(6);
          const lon = parseFloat(data[0].lon).toFixed(6);
          
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lon,
            googleMapLink: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
          }));
          break;
        }
      } catch (error) {
        console.error(`Error resolving location for query "${q}":`, error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name || !formData.email || !formData.password) {
      return showAlert('Please fill out all Administrator details.');
    }
    if (!formData.mosqueName || !formData.address || !formData.area || !formData.city || !formData.state || !formData.pincode) {
      return showAlert('Please fill out all basic Mosque details.');
    }
    if (formData.password.length < 6) {
      return showAlert('Password must be at least 6 characters long.');
    }

    setLoading(true);

    // Geocoding based on address details if coordinates aren't already set
    let resolvedLat = formData.latitude || null;
    let resolvedLon = formData.longitude || null;

    if (!resolvedLat || !resolvedLon) {
      const queries = [
        [formData.address, formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', '),
        [formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', '),
        [formData.city, formData.state, formData.pincode].filter(Boolean).join(', '),
        [formData.city, formData.state].filter(Boolean).join(', ')
      ];

      for (const q of queries) {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1&accept-language=en`);
          const data = await response.json();
          if (data && data.length > 0) {
            resolvedLat = parseFloat(data[0].lat).toFixed(6);
            resolvedLon = parseFloat(data[0].lon).toFixed(6);
            break;
          }
        } catch (error) {
          console.error(`Geocoding error for query "${q}":`, error);
        }
      }
    }

    const mapLink = formData.googleMapLink || (resolvedLat && resolvedLon ? `https://www.google.com/maps/search/?api=1&query=${resolvedLat},${resolvedLon}` : '');

    if (!mapLink) {
      setLoading(false);
      return showAlert('Could not automatically resolve mosque coordinates or location. Please provide a Google Maps Link.');
    }

    const submissionData = {
      ...formData,
      latitude: resolvedLat,
      longitude: resolvedLon,
      googleMapLink: mapLink
    };

    const result = await register(submissionData);
    setLoading(false);

    if (result.success) {
      showAlert(result.message || 'Registration successful! Please check your email to verify your account.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } else {
      showAlert(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <div className="h-16 w-16 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center shadow-md shadow-teal-700/5 mx-auto mb-4">
            <Compass className="h-10 w-10 animate-pulse text-teal-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Register Your Mosque</h1>
          <p className="mt-2 text-sm text-slate-500 font-medium max-w-md mx-auto">
            Create an administrator account and register your congregation to update prayer timings, share photos, and post announcements.
          </p>
        </div>

        {alert.show && (
          <div className={`mb-6 p-4 rounded-xl flex items-start space-x-2.5 text-sm font-semibold transition-all shadow-sm ${
            alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}>
            {alert.type === 'error' ? <AlertCircle className="h-5 w-5 flex-shrink-0" /> : <CheckCircle2 className="h-5 w-5 flex-shrink-0" />}
            <span>{alert.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
            
            {/* COLUMN 1: ADMINISTRATOR DETAILS */}
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-teal-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                <User className="h-5 w-5 text-teal-600" />
                <span>1. Administrator Account</span>
              </h2>

              {/* Admin Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. Imam Ahmed"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
              </div>



              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="•••••••• (Min 6 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
              </div>
            </div>

            {/* COLUMN 2: MOSQUE DETAILS */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-lg font-bold text-teal-800 flex items-center gap-2">
                  <Building className="h-5 w-5 text-teal-600" />
                  <span>2. Mosque & Congregation</span>
                </h2>
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={geoLoading}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <MapPin className="h-4 w-4" />
                  {geoLoading ? 'Detecting Location...' : 'Use Auto Location'}
                </button>
              </div>

              {/* Mosque Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mosque Name</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="mosqueName"
                    required
                    placeholder="e.g. Jama Masjid Lucknow"
                    value={formData.mosqueName}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Street Address</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <MapPin className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    required
                    placeholder="e.g. 12, Chowk Road"
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={resolveLocationFromAddress}
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Area & City */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Area / Locality</label>
                  <input
                    type="text"
                    name="area"
                    required
                    placeholder="e.g. Aminabad"
                    value={formData.area}
                    onChange={handleInputChange}
                    onBlur={resolveLocationFromAddress}
                    className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="e.g. Lucknow"
                    value={formData.city}
                    onChange={handleInputChange}
                    onBlur={resolveLocationFromAddress}
                    className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* State & Pincode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="e.g. Uttar Pradesh"
                    value={formData.state}
                    onChange={handleInputChange}
                    onBlur={resolveLocationFromAddress}
                    className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    placeholder="e.g. 226001"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    onBlur={resolveLocationFromAddress}
                    className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Google Maps Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Google Maps Link (Optional)</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Navigation className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="googleMapLink"
                    placeholder="https://maps.google.com/?q=... (or leave blank to auto-generate)"
                    value={formData.googleMapLink}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* About Masjid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">About the Masjid (Optional)</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 pt-3.5 pointer-events-none">
                    <Info className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <textarea
                    name="aboutMasjid"
                    rows="3"
                    placeholder="History, facilities, educational classes, timings, etc..."
                    value={formData.aboutMasjid}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

          </div>

          {/* Submit Section */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-wider"
            >
              Cancel & Return Home
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-md shadow-teal-700/10 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center min-w-[150px]"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Submit Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterMosque;
