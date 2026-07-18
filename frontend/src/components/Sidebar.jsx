import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  MapPin,
  Users,
  Megaphone,
  User,
  LogOut,
  Compass,
  Clock,
  Image as ImageIcon,
  Building,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate('/login');
  };

  // Define sidebar links based on user role
  const getLinks = () => {
    if (user?.role === 'ROOT_ADMIN') {
      return [
        { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { path: '/admin/mosques', name: 'Mosques', icon: <Building className="h-5 w-5" /> },
        { path: '/admin/users', name: 'User Management', icon: <Users className="h-5 w-5" /> },
        { path: '/admin/announcements', name: 'Announcements', icon: <Megaphone className="h-5 w-5" /> },
        { path: '/admin/profile', name: 'Profile', icon: <User className="h-5 w-5" /> },
      ];
    } else if (user?.role === 'ADMIN') {
      return [
        { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { path: '/admin/mosques', name: 'My Mosques', icon: <Building className="h-5 w-5" /> },
        { path: '/admin/profile', name: 'Profile', icon: <User className="h-5 w-5" /> },
      ];
    } else if (user && user.role === 'MOSQUE_ADMIN') {
      const baseLinks = [
        { path: '/mosque-admin', name: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> }
      ];

      if (user.mosqueId) {
        baseLinks.push(
          { path: '/mosque-admin/my-mosque', name: 'My Mosque', icon: <Building className="h-5 w-5" /> },
          { path: '/mosque-admin/timings', name: 'Prayer Timings', icon: <Clock className="h-5 w-5" /> },
          { path: '/mosque-admin/announcements', name: 'Announcements', icon: <Megaphone className="h-5 w-5" /> },
          { path: '/mosque-admin/gallery', name: 'Gallery', icon: <ImageIcon className="h-5 w-5" /> }
        );
      }

      baseLinks.push({ path: '/mosque-admin/profile', name: 'Profile', icon: <User className="h-5 w-5" /> });
      return baseLinks;
    }
    return [];
  };

  const links = getLinks();

  const getRoleLabel = () => {
    if (user?.role === 'ROOT_ADMIN') return 'Sole Root Admin';
    if (user?.role === 'ADMIN') return 'Admin';
    return 'Mosque Admin';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-teal-900 text-slate-100 flex flex-col h-full border-r border-teal-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-teal-950 border-b border-teal-800">
          <div className="flex items-center space-x-2">
            <Compass className="h-7 w-7 text-emerald-400" />
            <span className="font-black text-lg tracking-wide text-white">
              Salah<span className="text-emerald-400">Directory</span>
            </span>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:bg-teal-800 hover:text-white lg:hidden focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Close sidebar"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Admin Quick Info */}
        <div className="p-5 border-b border-teal-800 bg-teal-950/40">
          <p className="text-xs text-teal-400 uppercase tracking-widest font-extrabold mb-1">
            {getRoleLabel()}
          </p>
          <p className="font-semibold text-white truncate text-sm">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                  : 'text-teal-100 hover:bg-teal-800/60 hover:text-white'
                }`
              }
            >
              {link.icon}
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-teal-800 bg-teal-950/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-teal-200 hover:text-white hover:bg-red-600/80 rounded-xl transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
