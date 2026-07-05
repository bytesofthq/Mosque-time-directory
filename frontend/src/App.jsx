import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import MosqueDetail from './pages/MosqueDetail';
import Login from './pages/Login';
import RegisterMosque from './pages/RegisterMosque';
import NearbyMosques from './pages/NearbyMosques';
import VerifyEmail from './pages/VerifyEmail';
import SearchResults from './pages/SearchResults';

// Root Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminMosques from './pages/AdminMosques';
import AdminUsers from './pages/AdminUsers';
import AdminAnnouncements from './pages/AdminAnnouncements';

// Mosque Admin Pages
import MosqueDashboard from './pages/MosqueDashboard';
import MyMosqueDetails from './pages/MyMosqueDetails';
import PrayerTimings from './pages/PrayerTimings';
import Announcements from './pages/Announcements';
import Gallery from './pages/Gallery';

// Reusable/Shared Pages
import Profile from './pages/Profile';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ========================================== */}
          {/* PUBLIC CLIENT PORTAL ROUTES */}
          {/* ========================================== */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="mosques/:id" element={<MosqueDetail />} />
            <Route path="register-mosque" element={<RegisterMosque />} />
            <Route path="nearby-mosques" element={<NearbyMosques />} />
            <Route path="search" element={<SearchResults />} />
          </Route>

          {/* ========================================== */}
          {/* AUTHENTICATION PORTAL */}
          {/* ========================================== */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* ========================================== */}
          {/* ROOT ADMIN DASHBOARD PANEL */}
          {/* ========================================== */}
          <Route path="/admin" element={<DashboardLayout allowedRoles={['ROOT_ADMIN']} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="mosques" element={<AdminMosques />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* ========================================== */}
          {/* MOSQUE ADMIN DASHBOARD PANEL */}
          {/* ========================================== */}
          <Route path="/mosque-admin" element={<DashboardLayout allowedRoles={['MOSQUE_ADMIN']} />}>
            <Route index element={<MosqueDashboard />} />
            <Route path="my-mosque" element={<MyMosqueDetails />} />
            <Route path="timings" element={<PrayerTimings />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
