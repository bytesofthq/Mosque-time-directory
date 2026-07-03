import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
  Users, 
  Search, 
  UserPlus, 
  Key, 
  Lock, 
  Unlock, 
  Building,
  X,
  Compass
} from 'lucide-react';

const AdminUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [mosques, setMosques] = useState([]); // for dropdown selection
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    mosqueId: ''
  });

  const [resetPasswordInput, setResetPasswordInput] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/admins', {
        params: { search, page, limit: 8 }
      });
      setAdmins(response.data.admins);
      setTotalPages(response.data.pages);
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all mosques to find those without admins assigned
  const fetchAllMosques = async () => {
    try {
      const response = await api.get('/admin/mosques', {
        params: { limit: 100 } // Fetch all to show in select dropdown
      });
      setMosques(response.data.mosques);
    } catch (error) {
      console.error('Error fetching mosques for dropdown:', error);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [page, search]);

  useEffect(() => {
    if (isCreateOpen) {
      fetchAllMosques();
    }
  }, [isCreateOpen]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      password: '',
      mosqueId: ''
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenReset = (admin) => {
    setSelectedAdmin(admin);
    setResetPasswordInput('');
    setIsResetOpen(true);
  };

  const validateCreateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email address is required';
    if (!formData.mobile.trim()) errors.mobile = 'Mobile number is required';
    if (!formData.password.trim()) errors.password = 'Initial password is required';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (!formData.mosqueId) errors.mosqueId = 'Please assign a mosque';
    return errors;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = validateCreateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitLoading(true);
    try {
      await api.post('/admin/admins', formData);
      setIsCreateOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      alert(error.response?.data?.message || 'Failed to create and assign admin');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (resetPasswordInput.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.put(`/admin/admins/${selectedAdmin._id}/reset-password`, {
        newPassword: resetPasswordInput
      });
      setIsResetOpen(false);
      alert('Password reset successfully!');
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    const nextStatus = !currentStatus;
    const confirmMsg = `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} this admin account? ${
      !nextStatus ? 'Deactivated admins cannot log in to the system.' : ''
    }`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/admin/admins/${adminId}/status`, {
        isActive: nextStatus
      });
      fetchAdmins();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  // Filter out mosques that already have an admin assigned (unless it was already assigned to this user, but since this is create mode, all newly created users need a fresh mosque).
  // In `mosques`, we hold a list of all mosques. Each mosque has `admin` object (which is user or null).
  const availableMosques = mosques.filter(m => !m.admin);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            <span>Manage Mosque Admins</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">Create accounts for Mosque Admins and toggle activation statuses.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-teal-700/10 flex items-center justify-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Create Admin</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center max-w-md">
        <Search className="h-5 w-5 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Search admin name, email, or mobile..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-transparent focus:outline-none text-slate-700 text-sm font-medium"
        />
      </div>

      {/* Tabular index of Mosque Admins */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent"></div>
        </div>
      ) : admins.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No Admins Found</h3>
          <p className="text-xs text-slate-400 font-medium">Create a new mosque admin using the button above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-400 text-left text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Admin Name</th>
                  <th scope="col" className="px-6 py-4">Email / Mobile</th>
                  <th scope="col" className="px-6 py-4">Assigned Mosque</th>
                  <th scope="col" className="px-6 py-4">Account Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700 bg-white">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{admin.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{admin.email}</div>
                      <div className="text-xs text-slate-400 font-bold">{admin.mobile}</div>
                    </td>
                    <td className="px-6 py-4">
                      {admin.mosqueId ? (
                        <div className="flex items-center text-teal-700">
                          <Building className="h-4 w-4 mr-1 text-teal-600/70" />
                          <span className="font-bold">{admin.mosqueId.mosqueName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">None Assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        admin.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {admin.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold">
                      <div className="flex items-center justify-center space-x-2.5">
                        <button
                          onClick={() => handleToggleStatus(admin._id, admin.isActive)}
                          className={`p-2 rounded-lg transition-all ${
                            admin.isActive 
                              ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700' 
                              : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                          title={admin.isActive ? 'Deactivate User' : 'Activate User'}
                        >
                          {admin.isActive ? <Unlock className="h-4.5 w-4.5" /> : <Lock className="h-4.5 w-4.5" />}
                        </button>
                        
                        <button
                          onClick={() => handleOpenReset(admin)}
                          className="p-2 text-teal-600 hover:bg-teal-50 hover:text-teal-800 rounded-lg transition-all"
                          title="Reset Password"
                        >
                          <Key className="h-4.5 w-4.5" />
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

      {/* CREATE MOSQUE ADMIN MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-teal-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Create Mosque Admin</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-teal-200 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                />
                {formErrors.name && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                />
                {formErrors.email && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number *</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                />
                {formErrors.mobile && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.mobile}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Initial Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                />
                {formErrors.password && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Assign Mosque *</label>
                <select
                  name="mosqueId"
                  value={formData.mosqueId}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                >
                  <option value="">-- Choose Unassigned Mosque --</option>
                  {availableMosques.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.mosqueName} ({m.city})
                    </option>
                  ))}
                </select>
                {formErrors.mosqueId && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.mosqueId}</p>}
                
                {availableMosques.length === 0 && (
                  <p className="text-amber-600 text-xs font-semibold mt-1.5 leading-relaxed">
                    Note: There are no unassigned mosques available. Please create a mosque first before registers an admin.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || availableMosques.length === 0}
                  className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md disabled:opacity-50"
                >
                  {submitLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Register Admin'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-teal-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Reset Password</h3>
              <button onClick={() => setIsResetOpen(false)} className="text-teal-200 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
              <p className="text-sm font-semibold text-slate-500">
                You are resetting the password for admin <strong className="text-slate-700">{selectedAdmin.name}</strong> ({selectedAdmin.email}).
              </p>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
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
                    'Reset Password'
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

export default AdminUsers;
