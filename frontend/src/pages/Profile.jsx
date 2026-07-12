import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';
import { User, Mail, Phone, Lock, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, updateProfileState } = useAuth();
  
  // Profile update state
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    mobile: ''
  });
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [loading, setLoading] = useState(false);

  // Initialize fields on load
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || ''
      });
    }
  }, [user]);

  const showAlert = (message, type = 'error') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'warning') {
      toast.warning(message);
    } else {
      toast.error(message);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim() || (!profileData.email.trim() && !profileData.mobile.trim())) {
      return showAlert('Please configure your name, and at least one of Email or Mobile number.');
    }

    setLoading(true);
    try {
      const response = await api.put('/auth/profile', profileData);
      updateProfileState(response.data);
      showAlert('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert(error.response?.data?.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmNewPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return showAlert('Please fill in all password fields.');
    }

    if (newPassword.length < 6) {
      return showAlert('New password must be at least 6 characters.');
    }

    if (newPassword !== confirmNewPassword) {
      return showAlert('Passwords do not match. Please verify your new password.');
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      showAlert('Password changed successfully!', 'success');
    } catch (error) {
      console.error('Error changing password:', error);
      showAlert(error.response?.data?.message || 'Failed to change password. Make sure current password is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <User className="h-5 w-5 text-teal-600" />
          <span>My Profile & Settings</span>
        </h2>
        <p className="text-slate-500 text-xs font-semibold mt-1">Configure profile details and login passwords.</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* EDIT PROFILE CARD */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-6">
              <User className="h-4.5 w-4.5 text-teal-600" />
              <span>Personal Details</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-lg text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Email Address (Optional if Mobile provided)</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-lg text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>

              {/* OR Divider */}
              <div className="relative my-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <span className="relative px-3 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  OR
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Mobile Number (Optional if Email provided)</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="mobile"
                    value={profileData.mobile}
                    onChange={handleProfileChange}
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-lg text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-teal-700/5 transition-all disabled:opacity-50"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* CHANGE PASSWORD CARD */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-6">
              <Lock className="h-4.5 w-4.5 text-teal-600" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Current Password</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-lg text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">New Password</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Min 6 characters"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-lg text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Confirm New Password</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    className="block w-full pl-9 pr-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-lg text-sm font-semibold text-slate-700"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-teal-700/5 transition-all disabled:opacity-50"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
