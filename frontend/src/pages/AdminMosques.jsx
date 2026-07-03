import React, { useState, useEffect } from 'react';
import api from '../utils/api';
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
  Eye
} from 'lucide-react';

const AdminMosques = () => {
  const [mosques, setMosques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Selected items for edit/delete/preview
  const [currentMosque, setCurrentMosque] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  
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

  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

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
    setIsModalOpen(true);
  };

  const handleOpenEdit = (mosque) => {
    setCurrentMosque(mosque);
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
    setFormErrors({});
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

  const validateForm = () => {
    const errors = {};
    if (!formData.mosqueName.trim()) errors.mosqueName = 'Mosque name is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    if (!formData.area.trim()) errors.area = 'Area/Neighborhood is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pincode.trim()) errors.pincode = 'Pincode is required';
    if (!formData.googleMapLink.trim()) errors.googleMapLink = 'Google Maps link is required';
    return errors;
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
      if (currentMosque) {
        // Edit Operation
        await api.put(`/admin/mosques/${currentMosque._id}`, formData);
      } else {
        // Create Operation
        await api.post('/admin/mosques', formData);
      }
      setIsModalOpen(false);
      fetchMosques();
    } catch (error) {
      console.error('Error saving mosque:', error);
      alert(error.response?.data?.message || 'Error occurred while saving mosque details');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/admin/mosques/${deleteId}`);
      setIsDeleteOpen(false);
      fetchMosques();
    } catch (error) {
      console.error('Error deleting mosque:', error);
      alert('Failed to delete mosque. Please try again.');
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          mosque.admin.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {mosque.admin.name} ({mosque.admin.isActive ? 'Active' : 'Deactive'})
                        </span>
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
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">1. Basic Details</h4>
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

    </div>
  );
};

export default AdminMosques;
