import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Compass, 
  User, 
  Mail, 
  Lock, 
  Phone,
  AlertCircle, 
  CheckCircle2
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

  const showAlert = (message, type = 'error') => {
    setAlert({ show: true, message, type });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'error' });
    }, 6000);
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

    if (!formData.name || !formData.email || !formData.password) {
      return showAlert('Please fill out all required details.');
    }
    if (formData.password.length < 6) {
      return showAlert('Password must be at least 6 characters long.');
    }

    setLoading(true);

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
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
          
          {/* Custom Alert Messages */}
          {alert.show && (
            <div className={`mb-6 p-4 rounded-xl flex items-start space-x-2.5 text-sm font-semibold transition-all border ${
              alert.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
            }`}>
              {alert.type === 'error' ? <AlertCircle className="h-5 w-5 flex-shrink-0" /> : <CheckCircle2 className="h-5 w-5 flex-shrink-0" />}
              <span>{alert.message}</span>
            </div>
          )}

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
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-800 placeholder-slate-400 transition-all font-medium text-sm"
                />
              </div>
            </div>

            {/* Mobile Field */}
            <div>
              <label htmlFor="mobile" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Mobile Number (Optional)
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
    </div>
  );
};

export default RegisterMosque;
