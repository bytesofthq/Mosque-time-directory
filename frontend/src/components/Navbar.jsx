import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 shadow-sm bg-white/80 backdrop-blur-md border-b border-slate-100">
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

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-4">
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
                  <span>Logout</span>
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

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-teal-700 focus:outline-none p-1.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white shadow-lg">
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block text-slate-600 hover:text-teal-700 hover:bg-slate-50 px-3 py-2.5 rounded-xl text-base font-semibold transition-colors"
            >
              Home
            </Link>

            <Link
              to="/nearby-mosques"
              onClick={() => setIsOpen(false)}
              className="block text-slate-600 hover:text-teal-700 hover:bg-slate-50 px-3 py-2.5 rounded-xl text-base font-semibold transition-colors"
            >
              Find Nearby
            </Link>

            {!user && (
              <Link
                to="/register-mosque"
                onClick={() => setIsOpen(false)}
                className="block text-slate-600 hover:text-teal-700 hover:bg-slate-50 px-3 py-2.5 rounded-xl text-base font-semibold transition-colors"
              >
                Register your mosque
              </Link>
            )}

            {user ? (
              <div className="pt-2 border-t border-slate-100 mt-2 space-y-2 px-3">
                <Link
                  to={user.role === 'ROOT_ADMIN' ? '/admin' : '/mosque-admin'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center space-x-2 bg-teal-50 text-teal-700 hover:bg-teal-100 py-3 rounded-xl text-sm font-semibold transition-all border border-teal-200/55"
                >
                  <LayoutDashboard className="h-4.5 w-4.5" />
                  <span>Dashboard</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 text-slate-600 hover:text-red-600 py-3 rounded-xl text-sm font-semibold hover:bg-red-50/50 transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 mt-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-teal-700 text-white hover:bg-teal-800 py-3 rounded-xl text-sm font-bold shadow-md shadow-teal-700/20 transition-all"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
