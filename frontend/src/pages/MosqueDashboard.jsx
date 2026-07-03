import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Building, Clock, Megaphone, Image as ImageIcon, MapPin, Phone, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const MosqueDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyMosqueData = async () => {
      try {
        const response = await api.get('/mosque/my-mosque');
        setData(response.data);
      } catch (error) {
        console.error('Error fetching own mosque details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyMosqueData();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800';
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:5000${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-red-50 border border-red-150 p-6 rounded-2xl text-center max-w-md mx-auto">
        <h3 className="font-bold text-red-800 text-lg">No Mosque Assigned</h3>
        <p className="text-red-700 text-sm font-semibold mt-1">
          Your account is currently not assigned to any mosque. Please contact the Root Admin.
        </p>
      </div>
    );
  }

  const { mosque, timings, announcements } = data;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
        <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100 shadow-inner flex-shrink-0">
          <img
            src={getImageUrl(mosque.mosqueImage)}
            alt={mosque.mosqueName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-grow space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">Assalamu Alaikum!</h2>
          <p className="text-slate-500 text-sm font-semibold">
            You are managing <strong className="text-teal-700 font-bold">{mosque.mosqueName}</strong> ({mosque.area}, {mosque.city}).
          </p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Link 
          to="/mosque-admin/my-mosque" 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4"
        >
          <div className="bg-teal-50 p-3.5 rounded-xl text-teal-600 shadow-inner">
            <Building className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Mosque</span>
            <span className="font-bold text-slate-700 text-sm">Edit Profile</span>
          </div>
        </Link>

        <Link 
          to="/mosque-admin/timings" 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4"
        >
          <div className="bg-emerald-50 p-3.5 rounded-xl text-emerald-600 shadow-inner">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Namaz Times</span>
            <span className="font-bold text-slate-700 text-sm">Update Timings</span>
          </div>
        </Link>

        <Link 
          to="/mosque-admin/announcements" 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4"
        >
          <div className="bg-amber-50 p-3.5 rounded-xl text-amber-600 shadow-inner">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Announcements</span>
            <span className="font-bold text-slate-700 text-sm">{announcements.length} Posted</span>
          </div>
        </Link>

        <Link 
          to="/mosque-admin/gallery" 
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4"
        >
          <div className="bg-violet-50 p-3.5 rounded-xl text-violet-600 shadow-inner">
            <ImageIcon className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Gallery</span>
            <span className="font-bold text-slate-700 text-sm">Change Image</span>
          </div>
        </Link>
      </div>

      {/* Mosque Mini Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Card: Main Details */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm space-y-5">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-50 pb-3">Mosque Details Card</h3>
          <div className="space-y-4 text-sm font-medium">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-xs font-bold uppercase">Address</span>
                <p className="text-slate-700 font-bold">{mosque.address}</p>
                <p className="text-slate-500 text-xs mt-0.5">{mosque.area}, {mosque.city}, {mosque.pincode}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 pt-3 border-t border-slate-50">
              <User className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-xs font-bold uppercase">Imam Name</span>
                <p className="text-slate-700 font-bold">{mosque.contact?.imamName || 'Not Set'}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 pt-3 border-t border-slate-50">
              <Phone className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block text-xs font-bold uppercase">Imam Mobile</span>
                <p className="text-slate-700 font-bold">{mosque.contact?.imamMobile || 'Not Set'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Quick Prayer Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-base border-b border-slate-50 pb-3 flex justify-between items-center">
            <span>Namaz Jamaat Times</span>
            <Link to="/mosque-admin/timings" className="text-teal-700 hover:text-teal-800 text-xs font-bold uppercase">Edit</Link>
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            {[
              { label: 'Fajr', val: timings?.Fajr?.jamaat },
              { label: 'Zuhr', val: timings?.Zuhr?.jamaat },
              { label: 'Asr', val: timings?.Asr?.jamaat },
              { label: 'Maghrib', val: timings?.Maghrib?.jamaat },
              { label: 'Isha', val: timings?.Isha?.jamaat },
              { label: 'Jumma', val: timings?.Jumma?.jamaat }
            ].map((p) => (
              <div key={p.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                <span className="font-bold text-slate-500 text-xs uppercase">{p.label}</span>
                <span className="font-extrabold text-slate-700">{p.val || '--:--'}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MosqueDashboard;
