import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, 
  Search, 
  UserPlus, 
  Key, 
  Lock, 
  Unlock, 
  X,
  Edit2,
  Trash2,
  Mail
} from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
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

  useEffect(() => {
    fetchAdmins();
  }, [page, search]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      username: '',
      email: '',
      password: ''
    });
    setFormErrors({});
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name || '',
      username: admin.username || '',
      email: admin.email || '',
      password: '' // blank by default
    });
    setFormErrors({});
    setIsEditOpen(true);
  };

  const handleOpenReset = (admin) => {
    setSelectedAdmin(admin);
    setResetPasswordInput('');
    setIsResetOpen(true);
  };

  const validateCreateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.password.trim()) errors.password = 'Initial password is required';
    if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    return errors;
  };

  const validateEditForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.username.trim()) errors.username = 'Username is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (formData.password && formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
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
      toast.success('Root Admin created successfully!');
      setIsCreateOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error.response?.data?.message || 'Failed to create root admin');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        name: formData.name,
        username: formData.username,
        email: formData.email
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      await api.put(`/admin/admins/${selectedAdmin._id}`, payload);
      toast.success('Root Admin details updated successfully!');
      setIsEditOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error(error.response?.data?.message || 'Failed to update root admin details');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteUser = async (adminId) => {
    if (adminId === currentUser?._id) {
      toast.error('You cannot delete your own root admin account.');
      return;
    }

    if (!window.confirm('Are you sure you want to permanently delete this root admin account? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/admins/${adminId}`);
      toast.success('Root Admin account deleted successfully!');
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error(error.response?.data?.message || 'Failed to delete root admin account');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (id === currentUser?._id) {
      toast.error('You cannot deactivate your own root admin account.');
      return;
    }

    try {
      const response = await api.put(`/admin/admins/${id}/status`, { isActive: !currentStatus });
      toast.success(response.data.message);
      fetchAdmins();
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error(error.response?.data?.message || 'Failed to change admin status');
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!resetPasswordInput || resetPasswordInput.length < 6) {
      toast.warning('Please enter a valid password (min 6 characters)');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.put(`/admin/admins/${selectedAdmin._id}/reset-password`, { newPassword: resetPasswordInput });
      toast.success(`Password for '${selectedAdmin.name}' reset successfully!`);
      setIsResetOpen(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            <span>Manage Root Admins</span>
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Create, update, and manage accounts for Root Administrators.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-teal-700/10 flex items-center justify-center gap-2 transition-all active:scale-95 self-start sm:self-auto"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Create Root Admin</span>
        </button>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center max-w-md">
        <Search className="h-5 w-5 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Search by name, username, or email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full bg-transparent focus:outline-none text-slate-700 text-sm font-medium"
        />
      </div>

      {/* Grid Index */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent"></div>
        </div>
      ) : admins.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No Root Admins Found</h3>
          <p className="text-xs text-slate-400 font-medium">Create a new root admin using the button above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-400 text-left text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Full Name</th>
                  <th scope="col" className="px-6 py-4">Username</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4">Account Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700 bg-white">
                {admins.map((admin) => {
                  const isSelf = admin._id === currentUser?._id;
                  return (
                    <tr key={admin._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">
                          {admin.name} {isSelf && <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100 ml-1">You</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600 font-bold">{admin.username}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600 font-medium">{admin.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          admin.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {admin.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleToggleStatus(admin._id, admin.isActive)}
                            disabled={isSelf}
                            title={isSelf ? "You cannot deactivate yourself" : (admin.isActive ? "Deactivate User" : "Activate User")}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSelf 
                                ? 'bg-slate-50 text-slate-350 border-slate-100 cursor-not-allowed opacity-50' 
                                : admin.isActive
                                ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                            }`}
                          >
                            {admin.isActive ? <Unlock className="h-4.5 w-4.5" /> : <Lock className="h-4.5 w-4.5" />}
                          </button>

                          <button
                            onClick={() => handleOpenReset(admin)}
                            title="Reset Password"
                            className="p-1.5 rounded-lg border bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 transition-all"
                          >
                            <Key className="h-4.5 w-4.5" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(admin)}
                            title="Edit Admin Details"
                            className="p-1.5 rounded-lg border bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 transition-all"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(admin._id)}
                            disabled={isSelf}
                            title={isSelf ? "You cannot delete yourself" : "Delete Account"}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSelf 
                                ? 'bg-slate-50 text-slate-350 border-slate-100 cursor-not-allowed opacity-50' 
                                : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                            }`}
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
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

      {/* CREATE ROOT ADMIN MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-teal-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Create Root Admin</h3>
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
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                />
                {formErrors.name && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Username *</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                />
                {formErrors.username && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.username}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Email Address *</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                  />
                </div>
                {formErrors.email && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Initial Password *</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                />
                {formErrors.password && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.password}</p>}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4.5 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 rounded-lg bg-teal-700 text-white font-extrabold text-xs hover:bg-teal-800 shadow-md shadow-teal-700/10 flex items-center justify-center transition-all disabled:opacity-50"
                >
                  {submitLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ROOT ADMIN MODAL */}
      {isEditOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-teal-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Edit Root Admin Details</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-teal-200 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                />
                {formErrors.name && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Username *</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                />
                {formErrors.username && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.username}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Email Address *</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                  />
                </div>
                {formErrors.email && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Change Password (Optional)</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Leave blank to keep current"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                />
                {formErrors.password && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.password}</p>}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4.5 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 rounded-lg bg-teal-700 text-white font-extrabold text-xs hover:bg-teal-800 shadow-md shadow-teal-700/10 flex items-center justify-center transition-all disabled:opacity-50"
                >
                  {submitLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    'Save Changes'
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
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-teal-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Reset Password</h3>
              <button onClick={() => setIsResetOpen(false)} className="text-teal-200 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                Set a new password for the admin account of <strong className="text-slate-700">{selectedAdmin.name}</strong>.
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="px-4.5 py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 rounded-lg bg-teal-700 text-white font-extrabold text-xs hover:bg-teal-800 shadow-md shadow-teal-700/10 flex items-center justify-center transition-all disabled:opacity-50"
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
