import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useLocation } from '../hooks/useLocation';
import { 
  Building, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  MapPin, 
  ExternalLink,
  X,
  PlusCircle,
  Eye,
  Clock,
  Compass,
  Navigation,
  Calculator
} from 'lucide-react';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

const AdminMosques = () => {
  const { detectLocation: triggerDetectLocation, loading: geoLoading } = useLocation();
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleDetectLocation = async () => {
    const loc = await triggerDetectLocation();
    if (loc) {
      setFormData(prev => ({
        ...prev,
        latitude: String(loc.latitude),
        longitude: String(loc.longitude),
        address: loc.road || loc.formattedAddress || prev.address,
        area: loc.locality || loc.suburb || loc.neighbourhood || prev.area,
        city: loc.city || loc.town || prev.city,
        state: loc.state || prev.state,
        pincode: loc.postalCode || prev.pincode,
        googleMapLink: loc.googleMapsUrl || prev.googleMapLink
      }));
    }
  };
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTimingsModalOpen, setIsTimingsModalOpen] = useState(false);
  
  // Selected items for edit/delete/preview/timings
  const [currentMosque, setCurrentMosque] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [selectedMosqueForTimings, setSelectedMosqueForTimings] = useState(null);
  const [timingsData, setTimingsData] = useState({
    Fajr: { azan: '', jamaat: '' },
    Zuhr: { azan: '', jamaat: '' },
    Asr: { azan: '', jamaat: '' },
    Maghrib: { azan: '', jamaat: '' },
    Isha: { azan: '', jamaat: '' },
    Jumma: { azan: '', khutbah: '' }
  });

  const [timingsLoading, setTimingsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  const fetchUnassignedUsers = async (excludeMosqueId = '') => {
    try {
      const response = await api.get('/admin/unassigned-users', {
        params: { excludeMosqueId }
      });
      setUnassignedUsers(response.data);
    } catch (error) {
      console.error('Error fetching unassigned users:', error);
    }
  };

  const detectLocation = async () => {
    setGeoLoading(true);
    try {
      const coords = await getCurrentLocation();
      const lat = coords.latitude.toFixed(6);
      const lon = coords.longitude.toFixed(6);

      const addressData = await reverseGeocode(lat, lon);

      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lon,
        address: addressData.road || prev.address,
        area: addressData.locality || prev.area,
        city: addressData.city || prev.city,
        state: addressData.state || prev.state,
        pincode: addressData.postcode || prev.pincode,
        googleMapLink: prev.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
      }));

      toast.success('Location details auto-filled successfully!');
    } catch (error) {
      console.error('Error detecting location:', error);
      toast.error(error.message || 'Failed to detect location. Please enter details manually.');
    } finally {
      setGeoLoading(false);
    }
  };
  
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
    username: '',
    password: '',
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

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [userEditedUsername, setUserEditedUsername] = useState(false);

  // Live username suggestion when mosqueName changes (only on Create mode!)
  useEffect(() => {
    if (currentMosque || !formData.mosqueName.trim() || userEditedUsername) return;

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
  }, [formData.mosqueName, userEditedUsername, currentMosque]);

  // Live username uniqueness validation when username changes
  useEffect(() => {
    if (!formData.username.trim()) {
      setUsernameAvailable(null);
      return;
    }

    if (currentMosque && formData.username.toLowerCase().trim() === (currentMosque.username || '').toLowerCase().trim()) {
      setUsernameAvailable(true);
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
  }, [formData.username, currentMosque]);

  const fetchMosques = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/mosques', {
        params: { search, page, limit: 8 }
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
  }, [page, search]);

  const handleOpenCreate = () => {
    setCurrentMosque(null);
    setUserEditedUsername(false);
    setUsernameAvailable(null);
    setFormData({
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
      username: '',
      password: '',
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
    setFormErrors({});
    setSelectedFile(null);
    setFilePreview('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mosque) => {
    setCurrentMosque(mosque);
    setUserEditedUsername(true); // Don't overwrite existing username with suggestion
    setUsernameAvailable(true);
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
      username: mosque.username || '',
      password: '',
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
    setFormErrors({});
    setSelectedFile(null);
    setFilePreview(mosque.mosqueImage || '');
    setIsModalOpen(true);
  };

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleOpenPreview = (mosque) => {
    setCurrentMosque(mosque);
    setIsPreviewOpen(true);
  };

  const handleOpenTimings = async (mosque) => {
    setSelectedMosqueForTimings(mosque);
    setTimingsLoading(true);
    setIsTimingsModalOpen(true);
    try {
      const response = await api.get(`/admin/mosques/${mosque._id}/timings`);
      if (response.data) {
        const t = response.data;
        setTimingsData({
          Fajr: { azan: t.Fajr?.azan || '', jamaat: t.Fajr?.jamaat || '' },
          Zuhr: { azan: t.Zuhr?.azan || '', jamaat: t.Zuhr?.jamaat || '' },
          Asr: { azan: t.Asr?.azan || '', jamaat: t.Asr?.jamaat || '' },
          Maghrib: { azan: t.Maghrib?.azan || '', jamaat: t.Maghrib?.jamaat || '' },
          Isha: { azan: t.Isha?.azan || '', jamaat: t.Isha?.jamaat || '' },
          Jumma: { azan: t.Jumma?.azan || '', khutbah: t.Jumma?.khutbah || '' }
        });
      }
    } catch (error) {
      console.error('Error fetching mosque timings:', error);
      // Initialize with empty defaults if none exist
      setTimingsData({
        Fajr: { azan: '', jamaat: '' },
        Zuhr: { azan: '', jamaat: '' },
        Asr: { azan: '', jamaat: '' },
        Maghrib: { azan: '', jamaat: '' },
        Isha: { azan: '', jamaat: '' },
        Jumma: { azan: '', khutbah: '' }
      });
    } finally {
      setTimingsLoading(false);
    }
  };

  const handleTimingChange = (prayer, field, value) => {
    setTimingsData((prev) => ({
      ...prev,
      [prayer]: {
        ...prev[prayer],
        [field]: value
      }
    }));
  };

  const handleTimingsSubmit = async (e) => {
    e.preventDefault();
    setTimingsLoading(true);
    try {
      await api.put(`/admin/mosques/${selectedMosqueForTimings._id}/timings`, timingsData);
      setIsTimingsModalOpen(false);
      toast.success('Prayer timings updated successfully!');
    } catch (error) {
      console.error('Error updating mosque timings:', error);
      toast.error(error.response?.data?.message || 'Failed to update prayer timings.');
    } finally {
      setTimingsLoading(false);
    }
  };

  const autoCalculateTimings = () => {
    if (!selectedMosqueForTimings?.latitude || !selectedMosqueForTimings?.longitude) {
      toast.warning('Mosque location coordinates are missing. Cannot calculate timings.');
      return;
    }

    try {
      const coordinates = new Coordinates(selectedMosqueForTimings.latitude, selectedMosqueForTimings.longitude);
      const params = CalculationMethod.MuslimWorldLeague();
      const date = new Date();
      const prayerTimes = new PrayerTimes(coordinates, date, params);

      const formatTime = (dateObj) => {
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };

      const formatJamaat = (dateObj, addMinutes) => {
        const jDate = new Date(dateObj.getTime() + addMinutes * 60000);
        return formatTime(jDate);
      };

      setTimingsData({
        Fajr: { azan: formatTime(prayerTimes.fajr), jamaat: formatJamaat(prayerTimes.fajr, 20) },
        Zuhr: { azan: formatTime(prayerTimes.dhuhr), jamaat: formatJamaat(prayerTimes.dhuhr, 20) },
        Asr: { azan: formatTime(prayerTimes.asr), jamaat: formatJamaat(prayerTimes.asr, 20) },
        Maghrib: { azan: formatTime(prayerTimes.maghrib), jamaat: formatJamaat(prayerTimes.maghrib, 10) },
        Isha: { azan: formatTime(prayerTimes.isha), jamaat: formatJamaat(prayerTimes.isha, 20) },
        Jumma: { azan: '01:00 PM', khutbah: '01:30 PM' }
      });

      toast.success('Prayer timings auto-calculated successfully! Remember to save changes.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to calculate timings.');
    }
  };

  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const validateForm = () => {
    const errors = {};
    if (!formData.mosqueName.trim()) errors.mosqueName = 'Mosque name is required';
    if (!formData.area.trim()) errors.area = 'Area/Neighborhood is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (usernameAvailable === false) {
      errors.username = 'Username is already taken';
    }

    if (!currentMosque) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    } else {
      if (formData.password && formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
    }

    return errors;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleFormChange = (e) => {
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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitLoading(true);
    try {
      let mosqueId;
      if (currentMosque) {
        // Edit Operation
        await api.put(`/admin/mosques/${currentMosque._id}`, formData);
        mosqueId = currentMosque._id;
      } else {
        // Create Operation
        const response = await api.post('/admin/mosques', formData);
        mosqueId = response.data._id;
      }

      // If an image file was selected, upload it
      if (selectedFile) {
        const uploadData = new FormData();
        uploadData.append('image', selectedFile);
        await api.post(`/admin/mosques/${mosqueId}/upload-image`, uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      toast.success(currentMosque ? 'Mosque details updated successfully!' : 'Mosque created successfully!');
      setIsModalOpen(false);
      fetchMosques();
    } catch (error) {
      console.error('Error saving mosque:', error);
      toast.error(error.response?.data?.message || 'Error occurred while saving mosque details');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/admin/mosques/${deleteId}`);
      toast.success('Mosque deleted successfully!');
      setIsDeleteOpen(false);
      fetchMosques();
    } catch (error) {
      console.error('Error deleting mosque:', error);
      toast.error('Failed to delete mosque. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Building className="h-5 w-5 text-teal-600" />
            <span>Manage Mosques</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">Add, update, or remove mosques inside the directory database.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-teal-700/10 flex items-center justify-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Mosque</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center max-w-md">
        <Search className="h-5 w-5 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Search by name, area, or city..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-transparent focus:outline-none text-slate-700 text-sm font-medium"
        />
      </div>

      {/* Tabular index of mosques */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent"></div>
        </div>
      ) : mosques.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto">
          <Building className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No Mosques Found</h3>
          <p className="text-xs text-slate-400 font-medium">Create a new mosque using the Add Mosque button above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-400 text-left text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Mosque Name</th>
                  <th scope="col" className="px-6 py-4">Location (Area, City)</th>
                  <th scope="col" className="px-6 py-4">Imam / Contact</th>
                  <th scope="col" className="px-6 py-4">Admin Assigned</th>
                  <th scope="col" className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700 bg-white">
                {mosques.map((mosque) => (
                  <tr key={mosque._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{mosque.mosqueName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-500">
                        <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                        <span>{mosque.area}, {mosque.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{mosque.contact?.imamName || '--'}</div>
                      <div className="text-xs text-slate-400 font-bold">{mosque.contact?.imamMobile || '--'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {mosque.admin ? (
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            mosque.admin.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {mosque.admin.name} ({mosque.admin.isActive ? 'Active' : 'Inactive'})
                          </span>
                          <span className="block text-[10px] font-bold uppercase text-slate-400">
                            {mosque.admin.role || 'MOSQUE_ADMIN'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs font-bold italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenPreview(mosque)}
                          className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-all"
                          title="View detail summary"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleOpenTimings(mosque)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 rounded-lg transition-all"
                          title="Configure Prayer Timings"
                        >
                          <Clock className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(mosque)}
                          className="p-2 text-teal-600 hover:bg-teal-50 hover:text-teal-800 rounded-lg transition-all"
                          title="Edit Mosque"
                        >
                          <Edit2 className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(mosque._id)}
                          className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all"
                          title="Delete Mosque"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-3.5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 font-extrabold uppercase">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 px-3.5 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE & EDIT MOSQUE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="h-16 flex items-center justify-between px-6 bg-teal-800 text-white flex-shrink-0">
              <h3 className="font-bold text-lg">
                {currentMosque ? `Edit Mosque: ${currentMosque.mosqueName}` : 'Add New Mosque'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-teal-200 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Form Scrollable */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* SECTION 1: Basic Details */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">1. Basic Details</h4>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={geoLoading}
                    className="bg-teal-700 hover:bg-teal-800 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 active:scale-95 disabled:opacity-50"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    {geoLoading ? 'Detecting Location...' : 'Use Auto Location'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Mosque Name *</label>
                    <input
                      type="text"
                      name="mosqueName"
                      value={formData.mosqueName}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                    />
                    {formErrors.mosqueName && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.mosqueName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Neighborhood / Area *</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleFormChange}
                      placeholder="e.g. Aminabad"
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                    />
                    {formErrors.area && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.area}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Full Street Address *</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleFormChange}
                    rows="2"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                  ></textarea>
                  {formErrors.address && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.address}</p>}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                    />
                    {formErrors.city && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">State *</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                    />
                    {formErrors.state && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.state}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                    />
                    {formErrors.pincode && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.pincode}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Google Maps Link *</label>
                    <input
                      type="text"
                      name="googleMapLink"
                      value={formData.googleMapLink}
                      onChange={handleFormChange}
                      placeholder="https://maps.app.goo.gl/..."
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                    />
                    {formErrors.googleMapLink && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.googleMapLink}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Latitude (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Longitude (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleFormChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5">Mosque Profile Image</label>
                  <div className="flex items-center space-x-4">
                    {filePreview && (
                      <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
                        <img 
                          src={filePreview.startsWith('http') ? filePreview : filePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl border border-dashed border-slate-300 cursor-pointer hover:bg-slate-100 transition-colors">
                      <PlusCircle className="h-5 w-5 text-teal-600 mb-1" />
                      <span className="text-xs font-bold">Select Mosque Image File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Contact Details */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">2. Contact Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Imam Name</label>
                    <input
                      type="text"
                      name="imamName"
                      value={formData.contact.imamName}
                      onChange={handleContactChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Imam Contact Mobile</label>
                    <input
                      type="text"
                      name="imamMobile"
                      value={formData.contact.imamMobile}
                      onChange={handleContactChange}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Facilities Checkboxes */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">3. Available Facilities</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'parking', label: 'Parking Space' },
                    { key: 'wuduArea', label: 'Wudu Area' },
                    { key: 'ladiesPrayer', label: 'Ladies Prayer' },
                    { key: 'wheelchairAccess', label: 'Wheelchair Access' },
                    { key: 'madrasa', label: 'Madrasa Classes' },
                    { key: 'library', label: 'Library' }
                  ].map((facility) => (
                    <label key={facility.key} className="flex items-center space-x-2 bg-slate-50 p-3 rounded-xl border border-slate-100 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name={facility.key}
                        checked={formData.facilities[facility.key]}
                        onChange={handleFacilityChange}
                        className="rounded border-slate-300 text-teal-700 focus:ring-teal-700 h-4.5 w-4.5"
                      />
                      <span className="text-xs font-bold text-slate-600">{facility.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* SECTION 4: Description */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">4. Detailed Description</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">About Masjid</label>
                  <textarea
                    name="aboutMasjid"
                    value={formData.aboutMasjid}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Provide description regarding historical background, capacities, and general schedules..."
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                  ></textarea>
                </div>
              </div>

              {/* SECTION 5: Login Credentials */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">5. Admin Login Credentials</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Username *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleFormChange}
                        placeholder="e.g. jamamasjid"
                        className="w-full pr-10 px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        {checkingUsername ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
                        ) : usernameAvailable === true ? (
                          <span className="text-emerald-600 font-bold text-sm">✓</span>
                        ) : usernameAvailable === false ? (
                          <span className="text-rose-600 font-bold text-sm">✗</span>
                        ) : null}
                      </div>
                    </div>
                    {formErrors.username && <p className="text-rose-600 text-xs font-semibold mt-1">{formErrors.username}</p>}
                    {usernameAvailable === true && <p className="text-emerald-600 text-[10px] font-bold mt-0.5">Username is unique and available</p>}
                    {usernameAvailable === false && <p className="text-rose-600 text-[10px] font-bold mt-0.5">Username is already taken</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">
                      {currentMosque ? 'Password (Leave blank to keep current)' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder={currentMosque ? '••••••••' : 'Min 6 characters'}
                      className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                    />
                    {formErrors.password && <p className="text-rose-600 text-xs font-semibold mt-1">{formErrors.password}</p>}
                  </div>
                </div>
              </div>

              {/* Form Actions footer (scrolls with form if needed) */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-700 text-white font-extrabold text-sm hover:bg-teal-800 shadow-md shadow-teal-700/10 flex items-center justify-center transition-all disabled:opacity-50"
                >
                  {submitLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Save Mosque'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              Are you absolutely sure you want to delete this mosque? This action is permanent and will cascade delete all associated prayer timings, announcements, and deactivate assigned mosque administrators.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md shadow-red-600/10 transition-colors"
              >
                Delete Mosque
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW DETAILS MODAL */}
      {isPreviewOpen && currentMosque && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-800 text-base">{currentMosque.mosqueName}</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-sm font-medium">
              <div>
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Address</span>
                <p className="text-slate-700">{currentMosque.address}</p>
                <p className="text-slate-500 mt-0.5">
                  {currentMosque.area}, {currentMosque.city}, {currentMosque.state} - {currentMosque.pincode}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Google Maps Directions</span>
                <a
                  href={currentMosque.googleMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:underline flex items-center gap-1 mt-0.5 font-bold"
                >
                  <span>Open Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 py-2 border-t border-b border-slate-50">
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Imam Name</span>
                  <p className="text-slate-700">{currentMosque.contact?.imamName || '--'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">Imam Mobile</span>
                  <p className="text-slate-700">{currentMosque.contact?.imamMobile || '--'}</p>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-bold block uppercase tracking-wider">About Masjid</span>
                <p className="text-slate-600 leading-relaxed italic">
                  {currentMosque.aboutMasjid || 'No description provided.'}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRAYER TIMINGS MODAL */}
      {isTimingsModalOpen && selectedMosqueForTimings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="h-16 flex items-center justify-between px-6 bg-teal-800 text-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-lg">
                  Configure Prayer Timings: {selectedMosqueForTimings.mosqueName}
                </h3>
              </div>
              <button onClick={() => setIsTimingsModalOpen(false)} className="text-teal-200 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Form Scrollable */}
            <form onSubmit={handleTimingsSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Auto calculate timings helper */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Calculator className="h-5 w-5 text-teal-600" />
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Auto-Calculate Times</h5>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                      Calculate prayer times using mosque geolocation coordinates.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={autoCalculateTimings}
                  className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-sm transition-all active:scale-95"
                >
                  Calculate Now
                </button>
              </div>

              {timingsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Fajr', key: 'Fajr', hasAzan: true },
                    { label: 'Zuhr', key: 'Zuhr', hasAzan: true },
                    { label: 'Asr', key: 'Asr', hasAzan: true },
                    { label: 'Maghrib', key: 'Maghrib', hasAzan: true },
                    { label: 'Isha', key: 'Isha', hasAzan: true }
                  ].map((p) => (
                    <div key={p.key} className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                      <span className="font-extrabold text-slate-700 text-sm">{p.label}</span>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Azaan Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 05:15 AM"
                          value={timingsData[p.key]?.azan || ''}
                          onChange={(e) => handleTimingChange(p.key, 'azan', e.target.value)}
                          className="w-full px-3.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jamaat Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 05:45 AM"
                          value={timingsData[p.key]?.jamaat || ''}
                          onChange={(e) => handleTimingChange(p.key, 'jamaat', e.target.value)}
                          className="w-full px-3.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                        />
                      </div>
                    </div>
                  ))}

                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <span className="font-extrabold text-emerald-900 text-sm">Jumma (Friday)</span>
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Azaan Time</label>
                      <input
                        type="text"
                        placeholder="e.g. 12:45 PM"
                        value={timingsData.Jumma?.azan || ''}
                        onChange={(e) => handleTimingChange('Jumma', 'azan', e.target.value)}
                        className="w-full px-3.5 py-1.5 rounded-lg border border-emerald-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Khutbah/Jamaat</label>
                      <input
                        type="text"
                        placeholder="e.g. 01:15 PM"
                        value={timingsData.Jumma?.khutbah || ''}
                        onChange={(e) => handleTimingChange('Jumma', 'khutbah', e.target.value)}
                        className="w-full px-3.5 py-1.5 rounded-lg border border-emerald-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3 bg-white flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsTimingsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={timingsLoading}
                  className="px-6 py-2.5 rounded-xl bg-teal-700 text-white font-extrabold text-sm hover:bg-teal-800 shadow-md shadow-teal-700/10 flex items-center justify-center transition-all disabled:opacity-50"
                >
                  {timingsLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Save Timings'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMosques;
