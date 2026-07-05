import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, LayoutDashboard, User } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-teal-700 hover:text-teal-800 transition-colors">
              <img 
                src={logo} 
                alt="Salah Directory Logo" 
                className="w-auto object-contain" 
                style={{ height: '40px' }} 
              />
              <span className="font-extrabold text-xl tracking-tight">
                Salah<span className="text-secondary-600">Directory</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-slate-600 hover:text-teal-700 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
            >
              Home
            </Link>

            <Link
              to="/nearby-mosques"
              className="text-slate-600 hover:text-teal-700 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
            >
              Find Nearby
            </Link>

            {!user && (
              <Link
                to="/register-mosque"
                className="text-slate-600 hover:text-teal-700 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
              >
                Register your mosque
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to={user.role === 'ROOT_ADMIN' ? '/admin' : '/mosque-admin'}
                  className="flex items-center space-x-1 bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-teal-200/55"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-slate-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-teal-700 text-white hover:bg-teal-800 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-teal-700/20 hover:shadow-lg transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
