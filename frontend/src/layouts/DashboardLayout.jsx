import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="text-slate-500 font-semibold animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center px-8 justify-between">
          <h1 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            {user.role === 'ROOT_ADMIN' ? 'Root Admin Console' : 'Mosque Admin Portal'}
          </h1>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-slate-700 hidden sm:inline">{user.name}</span>
            <div className="h-8 w-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-sm shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Pane */}
        <main className="flex-grow p-6 sm:p-8 overflow-y-auto bg-slate-50/50">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
