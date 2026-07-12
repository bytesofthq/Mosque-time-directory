import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import { 
  Compass, 
  User, 
  Mail, 
  Lock, 
  Phone,
  AlertCircle, 
  CheckCircle2,
  X
} from 'lucide-react';

const RegisterMosque = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'error' });
  const [toast, setToast] = useState({ show: false, message: '' });

  const showAlert = (message, type = 'error') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'warning') {
      toast.warning(message);
    } else {
      toast.error(message);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || (!formData.email.trim() && !formData.mobile.trim()) || !formData.password) {
      return showAlert('Name, password, and at least one of Email or Mobile number are required.');
    }
    if (formData.password.length < 6) {
      return showAlert('Password must be at least 6 characters long.');
    }

    setLoading(true);

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      showToast('✅ Please check your email to verify your account');
      showAlert(result.message || 'Registration successful! Please check your email to verify your account.', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } else {
      showAlert(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-slide-in-right">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl shadow-2xl p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-800">{toast.message}</p>
                <p className="text-xs text-emerald-600 mt-0.5 font-medium">
                  📧 Check your inbox and spam folder
                </p>
              </div>
              <button
                onClick={() => setToast({ show: false, message: '' })}
                className="text-emerald-600 hover:text-emerald-800 transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center shadow-md shadow-teal-700/5">
            <Compass className="h-10 w-10 animate-pulse text-teal-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
          Join as Mosque Admin
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-semibold max-w-sm mx-auto">
          Register your account, then set up your mosque profile and manage prayer timings.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          


          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Imam Ahmed"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Email Address (Optional if Mobile provided)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
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

            {/* Mobile Field */}
            <div>
              <label htmlFor="mobile" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Mobile Number (Optional if Email provided)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Phone className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={handleInputChange}
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
                  <Lock className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                />
              </div>
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
                  'Register Account'
                )}
              </button>
            </div>
          </form>

          {/* Login redirection */}
          <div className="mt-6 text-center text-xs font-semibold text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-extrabold">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Custom CSS for Toast Animation */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
};

export default RegisterMosque;