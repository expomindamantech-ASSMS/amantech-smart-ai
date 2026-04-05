// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import LessonPlansPage from './pages/LessonPlansPage';
import AssessmentsPage from './pages/AssessmentsPage';
import ResearchPage from './pages/ResearchPage';
import GamesPage from './pages/GamesPage';
import CalendarPage from './pages/CalendarPage';
import ReportsPage from './pages/ReportsPage';
import MediaPage from './pages/MediaPage';
import VoicePage from './pages/VoicePage';
import AdminPage from './pages/AdminPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0a2540, #0f3460)' }}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white font-semibold">Loading AmanTech Smart AI...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/auth" replace />;
};

function AppRoutes() {
  const { user } = useAuth();

  // PWA install prompt
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.__deferredPrompt = e;
    });
  }, []);

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/auth'} />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/lesson-plans" element={<LessonPlansPage />} />
        <Route path="/assessments" element={<AssessmentsPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/voice" element={<VoicePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'Sora, sans-serif', fontSize: '14px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
            success: { iconTheme: { primary: '#06d6a0', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef476f', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
