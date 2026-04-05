// src/components/layout/Layout.js
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getMyNotifications, markNotificationRead } from '../../services/parseService';
import SubscriptionModal from '../SubscriptionModal';
import {
  Brain, LayoutDashboard, BookOpen, ClipboardList, Microscope,
  Gamepad2, CalendarDays, FileText, Image, Mic, Bell, LogOut,
  Menu, X, Settings, Users, Crown, ChevronRight
} from 'lucide-react';

const NAV = [
  { path: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { path: '/lesson-plans', icon: <BookOpen size={18} />, label: 'Lesson Plans' },
  { path: '/assessments', icon: <ClipboardList size={18} />, label: 'Assessments' },
  { path: '/research', icon: <Microscope size={18} />, label: 'Research & Projects' },
  { path: '/games', icon: <Gamepad2 size={18} />, label: 'Educational Games' },
  { path: '/calendar', icon: <CalendarDays size={18} />, label: 'Calendar & Timetable' },
  { path: '/reports', icon: <FileText size={18} />, label: 'Report Cards' },
  { path: '/media', icon: <Image size={18} />, label: 'Images & Media' },
  { path: '/voice', icon: <Mic size={18} />, label: 'Voice Notes' },
];

const ADMIN_NAV = [
  { path: '/admin', icon: <Users size={18} />, label: 'Admin Dashboard' },
  { path: '/admin/settings', icon: <Settings size={18} />, label: 'App Settings' },
];

export default function Layout() {
  const { user, subscription, isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [showSub, setShowSub] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const items = await getMyNotifications();
      setNotifications(items);
    } catch {}
  };

  const handleLogout = async () => {
    await logout();
    nav('/auth');
  };

  const unread = notifications.filter(n => !n.get('read')).length;
  const subActive = subscription?.active;
  const freeLeft = subscription?.freeRemaining ?? 0;

  const subLabel = isAdmin ? '∞ Admin' : 
    subscription?.expiry ? `Until ${new Date(subscription.expiry).toLocaleDateString('en-GH')}` :
    `${freeLeft} free left`;

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 z-40 transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ background: 'linear-gradient(180deg, #0a2540 0%, #0f3460 100%)' }}>
        
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm leading-tight" style={{ fontFamily: 'Sora, sans-serif' }}>AmanTech Smart AI</h1>
              <p className="text-yellow-400 text-xs">Ghana Education AI</p>
            </div>
            <button className="ml-auto lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* User info */}
        <div className="p-4 mx-3 mt-3 mb-1 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-blue-900 font-bold text-sm">
              {user?.get('name')?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">{user?.get('name') || 'User'}</p>
              <p className="text-white/50 text-xs truncate">{user?.get('email')}</p>
            </div>
            {isAdmin && <Crown size={14} className="text-yellow-400 shrink-0" />}
          </div>
          <div className={`mt-2 flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg ${subActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${subActive ? 'bg-green-400' : 'bg-red-400'}`} />
            {subLabel}
            {!isAdmin && !subActive && freeLeft > 0 && (
              <button onClick={() => setShowSub(true)} className="ml-auto text-yellow-400 hover:text-yellow-300 underline">Upgrade</button>
            )}
            {!isAdmin && freeLeft <= 0 && !subscription?.expiry && (
              <button onClick={() => setShowSub(true)} className="ml-auto text-yellow-400 hover:text-yellow-300 underline">Subscribe</button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          {NAV.map(item => (
            <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm transition-all group ${
                  isActive ? 'bg-yellow-400 text-blue-900 font-semibold' : 'text-white/70 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-60 transition-opacity" />
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="px-3 py-2 mt-3 mb-1">
                <p className="text-white/30 text-xs uppercase font-semibold tracking-wider">Admin</p>
              </div>
              {ADMIN_NAV.map(item => (
                <NavLink key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-sm transition-all ${
                      isActive ? 'bg-yellow-400/20 text-yellow-300 font-semibold' : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-400/10 text-sm transition-all">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <button className="lg:hidden text-gray-500 hover:text-gray-800" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="hidden lg:block" />

            <div className="flex items-center gap-2">
              {/* Subscription badge */}
              {!isAdmin && !subActive && (
                <button onClick={() => setShowSub(true)}
                  className="hidden sm:flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-yellow-100 transition-all">
                  ⚡ Upgrade Plan
                </button>
              )}

              {/* Notifications */}
              <div className="relative">
                <button onClick={() => setShowNotif(s => !s)}
                  className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-all">
                  <Bell size={18} className="text-gray-600" />
                  {unread > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
                {showNotif && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 fade-in overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-800 text-sm">Notifications</h4>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-8">No notifications</p>
                      ) : notifications.map(n => (
                        <div key={n.id}
                          onClick={async () => { await markNotificationRead(n.id); loadNotifications(); setShowNotif(false); }}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${!n.get('read') ? 'bg-blue-50/50' : ''}`}
                        >
                          <p className="text-sm text-gray-700">{n.get('message')}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString('en-GH')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet context={{ openSubscription: () => setShowSub(true) }} />
        </main>
      </div>

      <SubscriptionModal open={showSub} onClose={() => setShowSub(false)} freeRemaining={freeLeft} />
    </div>
  );
}
