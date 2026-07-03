import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Building, Users, Megaphone, ShieldAlert, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalMosques: 0, activeAdmins: 0, totalAnnouncements: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Mosques',
      value: stats.totalMosques,
      icon: <Building className="h-6 w-6 text-teal-600" />,
      bg: 'bg-teal-50',
      border: 'border-teal-100',
    },
    {
      title: 'Active Mosque Admins',
      value: stats.activeAdmins,
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Total Announcements',
      value: stats.totalAnnouncements,
      icon: <Megaphone className="h-6 w-6 text-amber-600" />,
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assalamu Alaikum, {user?.name}!</h2>
          <p className="text-slate-500 text-sm font-semibold mt-1">Welcome to the Mosque Directory Root Administrator portal.</p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-100 px-4 py-2 rounded-xl">
          <Clock className="h-4 w-4" />
          <span>Session Active</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-white p-6 rounded-2xl shadow-sm border ${card.border} flex items-center justify-between hover:shadow-md transition-shadow`}
          >
            <div className="space-y-2">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-wider block">
                {card.title}
              </span>
              <span className="text-3xl font-extrabold text-slate-800 block">
                {card.value}
              </span>
            </div>
            <div className={`${card.bg} p-4 rounded-xl flex items-center justify-center shadow-inner`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Admin Operations Notice */}
      <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-6 flex items-start gap-4">
        <div className="bg-amber-100 text-amber-800 p-3 rounded-xl flex-shrink-0">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-amber-950 text-base">System Operator Notice</h3>
          <p className="text-amber-900 text-sm leading-relaxed mt-1 font-medium">
            As a Root Administrator, you hold full capability privileges over this deployment. You can construct and modify individual mosque records, configure user profiles, change passwords, and manage mosque administrators. Please handle all deletions with caution as changes immediately reflect on the public website.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
