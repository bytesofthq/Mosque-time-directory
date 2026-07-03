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
  Building
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define sidebar links based on user role
  const getLinks = () => {
    if (user?.role === 'ROOT_ADMIN') {
      return [
        { path: '/admin', name: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { path: '/admin/mosques', name: 'Mosques', icon: <Building className="h-5 w-5" /> },
        { path: '/admin/users', name: 'Users', icon: <Users className="h-5 w-5" /> },
        { path: '/admin/announcements', name: 'Announcements', icon: <Megaphone className="h-5 w-5" /> },
        { path: '/admin/profile', name: 'Profile', icon: <User className="h-5 w-5" /> },
      ];
    } else if (user?.role === 'MOSQUE_ADMIN') {
      return [
        { path: '/mosque-admin', name: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { path: '/mosque-admin/my-mosque', name: 'My Mosque', icon: <Building className="h-5 w-5" /> },
        { path: '/mosque-admin/timings', name: 'Prayer Timings', icon: <Clock className="h-5 w-5" /> },
        { path: '/mosque-admin/announcements', name: 'Announcements', icon: <Megaphone className="h-5 w-5" /> },
        { path: '/mosque-admin/gallery', name: 'Gallery', icon: <ImageIcon className="h-5 w-5" /> },
        { path: '/mosque-admin/profile', name: 'Profile', icon: <User className="h-5 w-5" /> },
      ];
    }
    return [];
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-teal-900 text-slate-100 flex flex-col min-h-screen border-r border-teal-800 shadow-xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 bg-teal-950 border-b border-teal-800">
        <div className="flex items-center space-x-2">
          <Compass className="h-7 w-7 text-emerald-400" />
          <span className="font-black text-lg tracking-wide text-white">
            Mosque<span className="text-emerald-400">Hub</span>
          </span>
        </div>
      </div>

      {/* Admin Quick Info */}
      <div className="p-5 border-b border-teal-800 bg-teal-950/40">
        <p className="text-xs text-teal-400 uppercase tracking-widest font-extrabold mb-1">
          {user?.role === 'ROOT_ADMIN' ? 'Root Admin' : 'Mosque Admin'}
        </p>
        <p className="font-semibold text-white truncate text-sm">{user?.name}</p>
        <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
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
  );
};

export default Sidebar;
