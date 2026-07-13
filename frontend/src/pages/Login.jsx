import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Compass, User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepMeSignedIn, setKeepMeSignedIn] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect straight to dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'ROOT_ADMIN') {
        navigate('/admin');
      } else if (user.role === 'MOSQUE_ADMIN') {
        navigate('/mosque-admin');
      }
    }
  }, [user, navigate]);

  const showAlert = (message, type = 'error') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'warning') {
      toast.warning(message);
    } else {
      toast.error(message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      return showAlert('Please enter both username and password.');
    }

    setLoading(true);
    const result = await login(username, password, keepMeSignedIn);
    setLoading(false);

    if (!result.success) {
      showAlert(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center shadow-md shadow-teal-700/5">
            <Compass className="h-10 w-10 animate-pulse text-teal-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
          Admin Portal Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-semibold">
          Manage your mosque details, timings, and announcements
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          


          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Keep me signed in Checkbox */}
            <div className="flex items-center">
              <input
                id="keepMeSignedIn"
                type="checkbox"
                checked={keepMeSignedIn}
                onChange={(e) => setKeepMeSignedIn(e.target.checked)}
                className="rounded border-slate-300 text-teal-700 focus:ring-teal-700 h-4.5 w-4.5 cursor-pointer"
              />
              <label htmlFor="keepMeSignedIn" className="ml-2 block text-xs font-bold text-slate-500 select-none cursor-pointer">
                Keep me signed in
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 rounded-xl shadow-md bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-teal-700/20 hover:shadow-lg hover:shadow-teal-700/30 transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          {/* Sign Up Option */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-500">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register-mosque')}
              className="text-teal-600 hover:text-teal-700 font-extrabold"
            >
              Register as Mosque Admin
            </button>
          </div>

          {/* Directory Return Option */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-wider"
            >
              Back to Public Directory
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
