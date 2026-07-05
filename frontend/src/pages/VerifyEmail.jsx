import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Compass, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Verification token is missing. Please check your verification link.');
        return;
      }

      try {
        const response = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(response.data.message || 'Your email has been verified successfully!');
      } catch (error) {
        console.error('Email verification failed:', error);
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#0f766e_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Logo */}
        <div className="text-center">
          <div className="h-16 w-16 bg-teal-50 text-teal-700 rounded-3xl flex items-center justify-center shadow-md shadow-teal-700/5 mx-auto mb-4">
            <Compass className="h-10 w-10 text-teal-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Salah Directory</h2>
        </div>

        {/* Card */}
        <div className="mt-8 bg-white py-8 px-6 shadow-xl shadow-slate-200/50 border border-slate-100 sm:rounded-3xl sm:px-10">
          
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <Loader2 className="h-12 w-12 text-teal-600 animate-spin" />
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800">Verifying Email</h3>
                <p className="text-sm text-slate-500 font-medium">{message}</p>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
              <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">Email Verified!</h3>
                <p className="text-sm text-slate-500 font-semibold max-w-sm">{message}</p>
              </div>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-md shadow-teal-700/10 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>Go to Login</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
              <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">Verification Failed</h3>
                <p className="text-sm text-red-600 font-semibold max-w-sm">{message}</p>
              </div>
              <div className="w-full space-y-3">
                <button
                  onClick={() => navigate('/register-mosque')}
                  className="w-full bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm py-3.5 px-4 rounded-xl shadow-md shadow-teal-700/10 hover:shadow-lg transition-all active:scale-95 flex items-center justify-center"
                >
                  Register Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-sm py-3 px-4 rounded-xl border border-slate-200 transition-all active:scale-95"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
