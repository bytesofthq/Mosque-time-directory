import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Compass, 
  User, 
  Mail, 
  Lock, 
  Phone, 
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
    mobile: '',
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      return showAlert('Geolocation is not supported by your browser.');
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setGeoLoading(false);
        showAlert('Location detected successfully!', 'success');
      },
      (error) => {
        console.error('Error detecting location:', error);
        setGeoLoading(false);
        showAlert('Failed to detect location. Please enter coordinates manually.');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name || !formData.email || !formData.mobile || !formData.password) {
      return showAlert('Please fill out all Administrator details.');
    }
    if (!formData.mosqueName || !formData.address || !formData.area || !formData.city || !formData.state || !formData.pincode || !formData.googleMapLink) {
      return showAlert('Please fill out all basic Mosque details.');
    }
    if (formData.password.length < 6) {
      return showAlert('Password must be at least 6 characters long.');
    }

    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      showAlert('Registration successful! Redirecting...', 'success');
      setTimeout(() => {
        navigate('/mosque-admin');
      }, 1500);
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

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Mobile Number</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="mobile"
                    required
                    placeholder="e.g. 9876543210"
                    value={formData.mobile}
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
              <h2 className="text-lg font-bold text-teal-800 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Building className="h-5 w-5 text-teal-600" />
                <span>2. Mosque & Congregation</span>
              </h2>

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
                    className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Google Maps Link */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Google Maps Link</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Navigation className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <input
                    type="url"
                    name="googleMapLink"
                    required
                    placeholder="https://maps.google.com/?q=..."
                    value={formData.googleMapLink}
                    onChange={handleInputChange}
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              {/* Geolocation Coordinates */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Coordinates (Optional)</label>
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={geoLoading}
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors flex items-center gap-1 active:scale-95 disabled:opacity-50"
                  >
                    {geoLoading ? 'Detecting...' : 'Detect Coordinates'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    placeholder="Latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                  />
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    placeholder="Longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    className="block w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
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
