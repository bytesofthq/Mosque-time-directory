import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { getCurrentLocation, reverseGeocode } from '../utils/location';
import { 
  Compass, 
  User, 
  Building,
  MapPin,
  Lock, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import { useLocation } from '../hooks/useLocation';

const RegisterMosque = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { detectLocation: triggerDetectLocation, loading: geoLoading } = useLocation();

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    mosqueName: '',
    city: '',
    area: '',
    address: '',
    state: '',
    pincode: '',
    googleMapLink: '',
    latitude: '',
    longitude: ''
  });

  const [loading, setLoading] = useState(false);
  const [showLocationDetails, setShowLocationDetails] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [userEditedUsername, setUserEditedUsername] = useState(false);

  const showAlert = (message, type = 'error') => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  // Live username suggestion when mosqueName changes
  useEffect(() => {
    if (!formData.mosqueName.trim() || userEditedUsername) return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.get('/auth/suggest-username', {
          params: { mosqueName: formData.mosqueName }
        });
        setFormData(prev => ({ ...prev, username: response.data.username }));
        setUsernameAvailable(true);
      } catch (err) {
        console.error('Error suggesting username:', err);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.mosqueName, userEditedUsername]);

  // Live username uniqueness validation when username changes
  useEffect(() => {
    if (!formData.username.trim()) {
      setUsernameAvailable(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const response = await api.get('/auth/validate-username', {
          params: { username: formData.username }
        });
        setUsernameAvailable(response.data.available);
      } catch (err) {
        console.error('Error validating username:', err);
      } finally {
        setCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.username]);

  const handleDetectLocation = async () => {
    const loc = await triggerDetectLocation();
    if (loc) {
      const isRealAddress = loc.formattedAddress && !loc.formattedAddress.startsWith('Lat:');
      const addressVal = isRealAddress 
        ? loc.formattedAddress 
        : (loc.road || [loc.area || loc.neighbourhood || loc.locality, loc.city].filter(Boolean).join(', '));
      
      const areaVal = loc.area || loc.neighbourhood || loc.locality || loc.suburb || loc.village || '';
      const cityVal = loc.city || loc.town || loc.district || '';
      const stateVal = loc.state || '';
      const pincodeVal = loc.postalCode || loc.postcode || '';

      setFormData(prev => ({
        ...prev,
        latitude: String(loc.latitude),
        longitude: String(loc.longitude),
        address: addressVal || prev.address,
        area: areaVal || prev.area,
        city: cityVal || prev.city,
        state: stateVal || prev.state,
        pincode: pincodeVal || prev.pincode,
        googleMapLink: loc.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`
      }));
      setShowLocationDetails(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'username') {
      setUserEditedUsername(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.mosqueName.trim() || !formData.city.trim() || !formData.area.trim() || !formData.username.trim() || !formData.password) {
      return showAlert('All fields are required.');
    }

    if (formData.password.length < 6) {
      return showAlert('Password must be at least 6 characters long.');
    }

    if (usernameAvailable === false) {
      return showAlert('Username is already taken. Please choose another.');
    }

    setLoading(true);

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      showAlert('Registration successful! Redirecting to login...', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } else {
      showAlert(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center shadow-md shadow-teal-700/5">
            <Compass className="h-10 w-10 animate-pulse text-teal-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
          Join as Mosque Admin
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-semibold max-w-sm mx-auto">
          Register your mosque details and create login credentials to manage prayer timings.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Mosque Information</h3>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={geoLoading}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                >
                  <Compass className="h-3.5 w-3.5" />
                  {geoLoading ? 'Detecting...' : 'Use Auto Location'}
                </button>
              </div>
              
              {/* Mosque Name Field */}
              <div>
                <label htmlFor="mosqueName" className="block text-xs font-bold text-slate-500 mb-1.5">
                  Mosque Name *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    id="mosqueName"
                    name="mosqueName"
                    type="text"
                    required
                    placeholder="e.g. Al Noor Masjid"
                    value={formData.mosqueName}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white"
                  />
                </div>
              </div>

              {/* City and Area fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-xs font-bold text-slate-500 mb-1.5">
                    City *
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <MapPin className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      required
                      placeholder="e.g. Lucknow"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="area" className="block text-xs font-bold text-slate-500 mb-1.5">
                    Area / Neighborhood *
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <MapPin className="h-4.5 w-4.5 text-slate-400" />
                    </div>
                    <input
                      id="area"
                      name="area"
                      type="text"
                      required
                      placeholder="e.g. Indira Nagar"
                      value={formData.area}
                      onChange={handleInputChange}
                      className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Toggle optional address details */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowLocationDetails(!showLocationDetails)}
                  className="text-xs text-teal-700 hover:text-teal-800 font-extrabold focus:outline-none flex items-center gap-1 select-none"
                >
                  {showLocationDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span>{showLocationDetails ? 'Hide coordinates & address details' : 'Add coordinates & address details (Optional)'}</span>
                </button>
              </div>

              {/* Optional fields block */}
              {showLocationDetails && (
                <div className="space-y-4 pt-2 border-t border-slate-200/60 transition-all">
                  
                  {/* Road Address */}
                  <div>
                    <label htmlFor="address" className="block text-xs font-bold text-slate-500 mb-1.5">
                      Street Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="e.g. 12/4 Sector C"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white"
                    />
                  </div>

                  {/* State & Pincode */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="state" className="block text-xs font-bold text-slate-500 mb-1.5">
                        State
                      </label>
                      <input
                        id="state"
                        name="state"
                        type="text"
                        placeholder="e.g. Uttar Pradesh"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="pincode" className="block text-xs font-bold text-slate-500 mb-1.5">
                        Pincode
                      </label>
                      <input
                        id="pincode"
                        name="pincode"
                        type="text"
                        placeholder="e.g. 226016"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Coordinates: Latitude & Longitude */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="block text-xs font-bold text-slate-500 mb-1.5">
                        Latitude
                      </label>
                      <input
                        id="latitude"
                        name="latitude"
                        type="text"
                        placeholder="e.g. 26.8467"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-xs font-bold text-slate-500 mb-1.5">
                        Longitude
                      </label>
                      <input
                        id="longitude"
                        name="longitude"
                        type="text"
                        placeholder="e.g. 80.9462"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Google Maps Link */}
                  <div>
                    <label htmlFor="googleMapLink" className="block text-xs font-bold text-slate-500 mb-1.5">
                      Google Maps Link
                    </label>
                    <input
                      id="googleMapLink"
                      name="googleMapLink"
                      type="url"
                      placeholder="https://maps.google.com/..."
                      value={formData.googleMapLink}
                      onChange={handleInputChange}
                      className="block w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white"
                    />
                  </div>

                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Admin Account Credentials</h3>

              {/* Admin Name Field */}
              <div>
                <label htmlFor="name" className="block text-xs font-bold text-slate-500 mb-1.5">
                  Full Name *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Imam Ahmed"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white"
                  />
                </div>
              </div>

              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-xs font-bold text-slate-500 mb-1.5">
                  Choose Username *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="e.g. alnoor"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`block w-full pl-11 pr-10 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white ${
                      usernameAvailable === true 
                        ? 'border-emerald-200 focus:ring-emerald-500' 
                        : usernameAvailable === false 
                        ? 'border-rose-200 focus:ring-rose-500' 
                        : 'border-slate-200 focus:ring-teal-600'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    {checkingUsername ? (
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    ) : usernameAvailable === true ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : usernameAvailable === false ? (
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                    ) : null}
                  </div>
                </div>
                {usernameAvailable === false && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1">Username is already taken. Please try another.</p>
                )}
                {usernameAvailable === true && (
                  <p className="text-[11px] text-emerald-600 font-bold mt-1">Username is unique and available.</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-slate-500 mb-1.5">
                  Password *
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || checkingUsername || usernameAvailable === false}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-md bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-teal-700/20 hover:shadow-lg hover:shadow-teal-700/30 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Register Mosque & Admin'
                )}
              </button>
            </div>
          </form>

          {/* Login redirection */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-extrabold">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterMosque;