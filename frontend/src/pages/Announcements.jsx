import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api, { BACKEND_URL } from '../utils/api';
import { Megaphone, Search, Plus, Edit2, Trash2, Calendar, X, Upload } from 'lucide-react';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected item
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/announcements/my-mosque');
      setAnnouncements(response.data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreate = () => {
    setCurrentAnnouncement(null);
    setFormData({ title: '', description: '' });
    setImageFile(null);
    setImagePreview('');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ann) => {
    setCurrentAnnouncement(ann);
    setFormData({
      title: ann.title || '',
      description: ann.description || ''
    });
    setImageFile(null);
    setImagePreview(ann.image ? (ann.image.startsWith('http') ? ann.image : `${BACKEND_URL}${ann.image}`) : '');
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description text is required';
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitLoading(true);

    // Build FormData since we are uploading files
    const dataToSend = new FormData();
    dataToSend.append('title', formData.title);
    dataToSend.append('description', formData.description);
    if (imageFile) {
      dataToSend.append('image', imageFile);
    }

    try {
      if (currentAnnouncement) {
        // Edit Mode
        await api.put(`/announcements/my-mosque/${currentAnnouncement._id}`, dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create Mode
        await api.post('/announcements/my-mosque', dataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      toast.success(currentAnnouncement ? 'Announcement updated successfully!' : 'Announcement created successfully!');
      setIsModalOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      toast.error(error.response?.data?.message || 'Failed to save announcement. Make sure image format is correct.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/announcements/my-mosque/${deleteId}`);
      toast.success('Announcement deleted successfully!');
      setIsDeleteOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast.error('Failed to delete announcement');
    }
  };

  // Filter announcements dynamically by search query
  const filteredAnnouncements = announcements.filter((ann) =>
    ann.title.toLowerCase().includes(search.toLowerCase()) ||
    ann.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-teal-600" />
            <span>Manage Announcements</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">Publish news, notices, and updates regarding masjid activities.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-teal-700/10 flex items-center justify-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Add Announcement</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center max-w-md">
        <Search className="h-5 w-5 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Filter announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent focus:outline-none text-slate-700 text-sm font-medium"
        />
      </div>

      {/* Grid of Announcements */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent"></div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto">
          <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No Announcements Found</h3>
          <p className="text-xs text-slate-400 font-medium">Create your first update using the Add Announcement button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredAnnouncements.map((ann) => (
            <div key={ann._id} className="bg-white rounded-2xl border border-slate-100 hover:border-teal-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
              
              {/* Main Content Info */}
              <div className="p-6 space-y-4">
                
                {/* Header Date */}
                <div className="flex items-center text-xs font-bold text-slate-400 space-x-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>

                {/* Announcement Image preview if exists */}
                {ann.image && (
                  <div className="h-40 w-full bg-slate-50 rounded-xl overflow-hidden shadow-inner border border-slate-100">
                    <img
                      src={ann.image.startsWith('http') ? ann.image : `${BACKEND_URL}${ann.image}`}
                      alt={ann.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <h3 className="font-bold text-slate-800 text-lg leading-snug">{ann.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed whitespace-pre-wrap">
                  {ann.description}
                </p>
              </div>

              {/* Actions footer */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleOpenEdit(ann)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-teal-200 text-teal-700 hover:bg-teal-50 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleOpenDelete(ann._id)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-teal-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {currentAnnouncement ? 'Edit Announcement' : 'Add Announcement'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-teal-200 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                />
                {formErrors.title && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.title}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-semibold text-slate-700"
                  placeholder="Details of the announcement..."
                ></textarea>
                {formErrors.description && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.description}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Image Attachment (Optional)</label>
                <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-4 cursor-pointer relative bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <Upload className="h-8 w-8 text-slate-400 mb-2" />
                  <span className="text-xs font-bold text-slate-500">Choose Image File</span>
                  <span className="text-[10px] text-slate-400 mt-1">JPEG, PNG, WEBP max 5MB</span>
                </div>
                
                {imagePreview && (
                  <div className="mt-4 relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white p-1 rounded-full shadow"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md disabled:opacity-50"
                >
                  {submitLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Publish'
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
              Are you sure you want to delete this announcement? This action is permanent and cannot be undone.
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
                Delete Announcement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Announcements;
