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
  Mail,
  ShieldAlert,
  CheckSquare,
  Square,
  Clock,
  Laptop
} from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

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
        params: { search, role: roleFilter, page, limit: 10 }
      });
      setAdmins(response.data.admins || []);
      setTotalPages(response.data.pages || 1);
      setSelectedIds([]);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to fetch user accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [page, search, roleFilter]);

  const handleSelectAll = () => {
    if (selectedIds.length === admins.length) {
      setSelectedIds([]);
    } else {
      const selectable = admins.filter(a => a._id !== currentUser?._id && a.role !== 'ROOT_ADMIN').map(a => a._id);
      setSelectedIds(selectable);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected users? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.post('/admin/users/bulk-delete', { ids: selectedIds });
      toast.success(res.data.message || 'Users deleted successfully');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to bulk delete users');
    }
  };

  const handleBulkActivate = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await api.post('/admin/users/bulk-activate', { ids: selectedIds });
      toast.success(res.data.message || 'Users activated successfully');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to bulk activate users');
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await api.post('/admin/users/bulk-deactivate', { ids: selectedIds });
      toast.success(res.data.message || 'Users deactivated successfully');
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to bulk deactivate users');
    }
  };

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
      password: ''
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
    if (!selectedAdmin) return;
    const errors = validateEditForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitLoading(true);
    try {
      await api.put(`/admin/admins/${selectedAdmin._id}`, formData);
      toast.success('Admin updated successfully!');
      setIsEditOpen(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error(error.response?.data?.message || 'Failed to update admin details');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    if (!resetPasswordInput.trim() || resetPasswordInput.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setSubmitLoading(true);
    try {
      await api.put(`/admin/admins/${selectedAdmin._id}/reset-password`, {
        newPassword: resetPasswordInput
      });
      toast.success(`Password for ${selectedAdmin.name} reset successfully!`);
      setIsResetOpen(false);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await api.put(`/admin/admins/${id}/status`, {
        isActive: !currentStatus
      });
      toast.success(response.data.message);
      fetchAdmins();
    } catch (error) {
      console.error('Error changing status:', error);
      toast.error(error.response?.data?.message || 'Failed to change status');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this root admin account?')) return;
    try {
      await api.delete(`/admin/admins/${id}`);
      toast.success('Root Admin deleted successfully');
      fetchAdmins();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const renderLastLogin = (lastLogin) => {
    if (!lastLogin || (!lastLogin.date && !lastLogin.timestamp)) {
      return <span className="text-slate-400 italic text-xs">Never logged in</span>;
    }
    const day = lastLogin.day || '';
    const date = lastLogin.date || '';
    const time = lastLogin.time || '';
    const browser = lastLogin.browser || '';
    const os = lastLogin.os || '';

    const dateStr = [day, date, time].filter(Boolean).join(' ');
    const deviceStr = [browser, os].filter(Boolean).join(' on ');

    return (
      <div className="text-xs">
        <div className="font-bold text-slate-700 flex items-center gap-1">
          <Clock className="h-3 w-3 text-teal-600" />
          <span>{dateStr}</span>
        </div>
        {deviceStr && (
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
            <Laptop className="h-3 w-3 text-slate-400" />
            <span>{deviceStr}</span>
          </div>
        )}
      </div>
    );
  };

  const renderRoleBadge = (role) => {
    switch (role) {
      case 'ROOT_ADMIN':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-200 uppercase">Sole Root Admin</span>;
      case 'ADMIN':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 uppercase">Admin</span>;
      case 'MOSQUE_ADMIN':
        return <span className="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-teal-200 uppercase">Mosque Admin</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-slate-200 uppercase">User</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Users className="h-7 w-7 text-teal-700" />
            <span>User & Admin Management</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Manage all platform users, assign roles, audit last logins, and execute bulk management operations.
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

      {/* Controls Bar: Search, Role Filter, Bulk Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, username, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="">All Roles</option>
            <option value="ROOT_ADMIN">Root Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="MOSQUE_ADMIN">Mosque Admin</option>
            <option value="USER">Regular User</option>
          </select>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 w-full md:w-auto bg-slate-50 p-2 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600 px-2">{selectedIds.length} Selected</span>
            <button
              onClick={handleBulkActivate}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-all"
            >
              Bulk Activate
            </button>
            <button
              onClick={handleBulkDeactivate}
              className="bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-all"
            >
              Bulk Suspend
            </button>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-all"
            >
              Bulk Delete
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent"></div>
        </div>
      ) : admins.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm max-w-md mx-auto">
          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">No Accounts Found</h3>
          <p className="text-xs text-slate-400 font-medium">Try adjusting search query or filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50 text-slate-400 text-left text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-4 w-10 text-center">
                    <button onClick={handleSelectAll} className="text-slate-400 hover:text-teal-600">
                      {selectedIds.length === admins.length && admins.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-teal-600" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-4">User Details</th>
                  <th scope="col" className="px-6 py-4">Role</th>
                  <th scope="col" className="px-6 py-4">Last Login</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700 bg-white">
                {admins.map((admin) => {
                  const isSelf = admin._id === currentUser?._id;
                  const isRoot = admin.role === 'ROOT_ADMIN';
                  const isSelected = selectedIds.includes(admin._id);

                  return (
                    <tr key={admin._id} className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-teal-50/30' : ''}`}>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          disabled={isSelf || isRoot}
                          checked={isSelected}
                          onChange={() => handleSelectRow(admin._id)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{admin.name}</span>
                            {isSelf && <span className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100 font-extrabold">You</span>}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">@{admin.username} • {admin.email || 'No Email'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderRoleBadge(admin.role)}
                      </td>
                      <td className="px-6 py-4">
                        {renderLastLogin(admin.lastLogin)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          admin.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                        }`}>
                          {admin.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-xs font-bold">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleToggleStatus(admin._id, admin.isActive)}
                            disabled={isSelf || isRoot}
                            title={isSelf || isRoot ? "Root Admin status cannot be toggled" : (admin.isActive ? "Deactivate User" : "Activate User")}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSelf || isRoot
                                ? 'bg-slate-50 text-slate-350 border-slate-100 cursor-not-allowed opacity-50' 
                                : admin.isActive
                                ? 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
                            }`}
                          >
                            {admin.isActive ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </button>

                          <button
                            onClick={() => handleOpenReset(admin)}
                            title="Reset Password"
                            className="p-1.5 rounded-lg border bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 transition-all"
                          >
                            <Key className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(admin)}
                            title="Edit User Details"
                            className="p-1.5 rounded-lg border bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 transition-all"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteUser(admin._id)}
                            disabled={isSelf || isRoot}
                            title={isSelf || isRoot ? "Root Admin account cannot be deleted" : "Delete Account"}
                            className={`p-1.5 rounded-lg border transition-all ${
                              isSelf || isRoot 
                                ? 'bg-slate-50 text-slate-350 border-slate-100 cursor-not-allowed opacity-50' 
                                : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
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
                    className="w-full pl-10 pr-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
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
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                />
                {formErrors.password && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.password}</p>}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {submitLoading ? 'Creating...' : 'Create Account'}
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
            <div className="px-6 py-4 bg-amber-600 text-white flex justify-between items-center">
              <h3 className="font-bold text-base">Reset Password</h3>
              <button onClick={() => setIsResetOpen(false)} className="text-amber-200 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleResetSubmit} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                Reset password for <strong className="text-slate-800">{selectedAdmin.name}</strong> (@{selectedAdmin.username})
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-600 text-sm font-medium text-slate-700 bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsResetOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {submitLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MODAL */}
      {isEditOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-teal-800 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">Edit User Details</h3>
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
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                />
                {formErrors.email && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">New Password (Optional)</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Leave blank to keep unchanged"
                  value={formData.password}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 text-sm font-medium text-slate-700 bg-white"
                />
                {formErrors.password && <p className="text-red-500 text-xs font-semibold mt-1">{formErrors.password}</p>}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {submitLoading ? 'Saving...' : 'Save Changes'}
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
