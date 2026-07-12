import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Building, MapPin, Phone, User, CheckCircle2, AlertCircle } from 'lucide-react';


const MyMosqueDetails = () => {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'error' });

  // Form states
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
    aboutMasjid: '',
    contact: { imamName: '', imamMobile: '' },
    facilities: {
      parking: false,
      wuduArea: false,
      ladiesPrayer: false,
      wheelchairAccess: false,
      madrasa: false,
      library: false
    }
  });

  const fetchMosqueDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get('/mosque/my-mosque');
      const { mosque } = response.data;
      if (mosque) {
        setFormData({
          mosqueName: mosque.mosqueName || '',
          address: mosque.address || '',
          area: mosque.area || '',
          city: mosque.city || '',
          state: mosque.state || '',
          pincode: mosque.pincode || '',
          googleMapLink: mosque.googleMapLink || '',
          latitude: mosque.latitude || '',
          longitude: mosque.longitude || '',
          aboutMasjid: mosque.aboutMasjid || '',
          contact: {
            imamName: mosque.contact?.imamName || '',
            imamMobile: mosque.contact?.imamMobile || ''
          },
          facilities: {
            parking: mosque.facilities?.parking || false,
            wuduArea: mosque.facilities?.wuduArea || false,
            ladiesPrayer: mosque.facilities?.ladiesPrayer || false,
            wheelchairAccess: mosque.facilities?.wheelchairAccess || false,
            madrasa: mosque.facilities?.madrasa || false,
            library: mosque.facilities?.library || false
          }
        });
      }
    } catch (error) {
      console.error('Error fetching mosque details:', error);
      showAlert('Failed to load mosque details. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMosqueDetails();
  }, []);

  const showAlert = (message, type = 'error') => {
    setAlert({ show: true, message, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'error' });
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        [name]: value
      }
    }));
  };

  const handleFacilityChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [name]: checked
      }
    }));
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
    
    if (!formData.mosqueName.trim() || !formData.address.trim() || !formData.area.trim() || !formData.city.trim() || !formData.pincode.trim()) {
      return showAlert('Please fill in all mandatory fields (*).');
    }

    setSubmitLoading(true);

    // Geocoding based on address details
    let resolvedLat = null;
    let resolvedLon = null;
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

    const mapLink = (formData.googleMapLink && formData.googleMapLink.trim()) || 
      (resolvedLat && resolvedLon ? `https://www.google.com/maps/search/?api=1&query=${resolvedLat},${resolvedLon}` : '');

    if (!mapLink) {
      setSubmitLoading(false);
      return showAlert('Could not automatically resolve mosque coordinates or location. Please provide a Google Maps Link.');
    }

    const submissionData = {
      ...formData,
      latitude: resolvedLat ? parseFloat(resolvedLat) : null,
      longitude: resolvedLon ? parseFloat(resolvedLon) : null,
      googleMapLink: mapLink
    };

    try {
      await api.put('/mosque/my-mosque', submissionData);
      showAlert('Mosque details updated successfully!', 'success');
      fetchMosqueDetails();
    } catch (error) {
      console.error('Error updating mosque details:', error);
      showAlert(error.response?.data?.message || 'Failed to update mosque details.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Building className="h-5 w-5 text-teal-600" />
          <span>My Mosque Details</span>
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1">Configure and display mosque information, facilities, and contact details.</p>
      </div>


      {/* Alert Block */}
      {alert.show && (
        <div className={`p-4 rounded-xl flex items-start space-x-2.5 text-sm font-semibold transition-all shadow-sm ${
          alert.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
        }`}>
          {alert.type === 'error' ? (
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Main Form Box */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: Basic details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">1. Basic Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mosque Name *</label>
                <input
                  type="text"
                  name="mosqueName"
                  value={formData.mosqueName}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Area / Neighborhood *</label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                  onBlur={resolveLocationFromAddress}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Full Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                onBlur={resolveLocationFromAddress}
                rows="2"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
              ></textarea>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  onBlur={resolveLocationFromAddress}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  onBlur={resolveLocationFromAddress}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  onBlur={resolveLocationFromAddress}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Google Maps Link (Optional)</label>
                <input
                  type="text"
                  name="googleMapLink"
                  placeholder="Leave blank to auto-generate from address"
                  value={formData.googleMapLink}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Contact info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">2. Contact Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Imam Name</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="imamName"
                    value={formData.contact.imamName}
                    onChange={handleContactChange}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-lg text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Imam Contact Mobile</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="imamMobile"
                    value={formData.contact.imamMobile}
                    onChange={handleContactChange}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-lg text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Facilities Checklist */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">3. Facilities Checklist</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'parking', label: 'Parking Area' },
                { key: 'wuduArea', label: 'Wudu Facilities' },
                { key: 'ladiesPrayer', label: 'Ladies Prayer Hall' },
                { key: 'wheelchairAccess', label: 'Wheelchair Access' },
                { key: 'madrasa', label: 'Madrasa Classes' },
                { key: 'library', label: 'Islamic Library' }
              ].map((item) => (
                <label key={item.key} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name={item.key}
                    checked={formData.facilities[item.key]}
                    onChange={handleFacilityChange}
                    className="rounded border-slate-300 text-teal-700 focus:ring-teal-700 h-4.5 w-4.5"
                  />
                  <span className="text-xs font-bold text-slate-600">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SECTION 4: About description */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">4. Detailed Description</h3>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">About Masjid</label>
              <textarea
                name="aboutMasjid"
                value={formData.aboutMasjid}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                placeholder="Briefly state historical backgrounds, visitor capacities, educational classes, and weekly programs..."
              ></textarea>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={submitLoading}
              className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-md shadow-teal-700/10 transition-all disabled:opacity-50"
            >
              {submitLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                'Save Details'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MyMosqueDetails;
