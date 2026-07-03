import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Megaphone, Trash2, Calendar, Building, MapPin, X } from 'lucide-react';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Delete state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await api.get('/announcements/all', {
        params: { page, limit: 10 }
      });
      setAnnouncements(response.data.announcements);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [page]);

  const handleOpenDelete = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/announcements/all/${deleteId}`);
      setIsDeleteOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Failed to delete announcement');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-teal-600 animate-bounce" />
          <span>All Announcements</span>
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1">
          Monitor and manage announcements posted by individual Mosque Admins.
        </p>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto">
          <Megaphone className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No Announcements Found</h3>
          <p className="text-xs text-slate-400 font-medium">Any announcements posted by Mosque Admins will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-400 text-left text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Announcement Info</th>
                  <th scope="col" className="px-6 py-4">Origin Mosque</th>
                  <th scope="col" className="px-6 py-4">Date Posted</th>
                  <th scope="col" className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700 bg-white">
                {announcements.map((ann) => (
                  <tr key={ann._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3 max-w-md">
                        {ann.image && (
                          <div className="h-12 w-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={ann.image.startsWith('http') ? ann.image : `http://localhost:5000${ann.image}`}
                              alt={ann.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800 leading-tight">{ann.title}</div>
                          <div className="text-xs text-slate-400 font-semibold line-clamp-2 mt-1">{ann.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {ann.mosqueId ? (
                        <div>
                          <div className="flex items-center text-teal-700 font-bold">
                            <Building className="h-4 w-4 mr-1 text-teal-600/70" />
                            <span>{ann.mosqueId.mosqueName}</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5 flex items-center font-semibold">
                            <MapPin className="h-3.5 w-3.5 mr-0.5" />
                            <span>{ann.mosqueId.city}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-red-500 italic text-xs font-bold">Orphaned / Mosque Deleted</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold">
                      <button
                        onClick={() => handleOpenDelete(ann._id)}
                        className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-all"
                        title="Delete Announcement"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
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

export default AdminAnnouncements;
