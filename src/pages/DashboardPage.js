// src/pages/DashboardPage.js
import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  BookOpen, ClipboardList, Microscope, Gamepad2,
  CalendarDays, FileText, Image, Mic, Zap, Crown, Clock
} from 'lucide-react';
import { Card } from '../components/ui';

const FEATURES = [
  { path: '/lesson-plans', icon: <BookOpen size={22} />, label: 'Lesson Plans', desc: 'NaCCA-aligned lesson plans', color: 'from-blue-500 to-blue-700', emoji: '📚' },
  { path: '/assessments', icon: <ClipboardList size={22} />, label: 'Assessments', desc: 'Exam questions & marking schemes', color: 'from-purple-500 to-purple-700', emoji: '📝' },
  { path: '/research', icon: <Microscope size={22} />, label: 'Research & Projects', desc: 'AI-guided research assistant', color: 'from-teal-500 to-teal-700', emoji: '🔬' },
  { path: '/games', icon: <Gamepad2 size={22} />, label: 'Educational Games', desc: 'Curriculum-aligned games', color: 'from-orange-500 to-orange-700', emoji: '🎮' },
  { path: '/calendar', icon: <CalendarDays size={22} />, label: 'Calendar & Timetable', desc: 'School schedules & calendars', color: 'from-green-500 to-green-700', emoji: '📅' },
  { path: '/reports', icon: <FileText size={22} />, label: 'Report Cards', desc: 'Generate & download reports', color: 'from-yellow-500 to-orange-500', emoji: '📊' },
  { path: '/media', icon: <Image size={22} />, label: 'Images & Media', desc: 'Analyze & generate visuals', color: 'from-pink-500 to-rose-700', emoji: '🖼️' },
  { path: '/voice', icon: <Mic size={22} />, label: 'Voice Notes', desc: 'Record & transcribe audio', color: 'from-indigo-500 to-indigo-700', emoji: '🎙️' },
];

export default function DashboardPage() {
  const { user, subscription, isAdmin } = useAuth();
  const { openSubscription } = useOutletContext();
  const nav = useNavigate();

  const name = user?.get('name')?.split(' ')[0] || 'Teacher';
  const subActive = subscription?.active;
  const freeLeft = subscription?.freeRemaining ?? 0;
  const expiry = subscription?.expiry;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-5xl mx-auto space-y-6 fade-in">
      {/* Hero greeting */}
      <div className="rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a2540, #0f3460)' }}>
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-yellow-400 text-sm font-semibold mb-1">{greeting}, {name}! 👋</p>
            <h2 className="text-white text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Sora, sans-serif' }}>
              What are we creating<br className="hidden md:block" /> today?
            </h2>
            <p className="text-blue-200 text-sm mt-2">Your AI-powered Ghana education toolkit is ready.</p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2 bg-yellow-400/20 px-4 py-2 rounded-xl border border-yellow-400/30">
                <Crown size={16} className="text-yellow-400" />
                <span className="text-yellow-300 text-sm font-semibold">Admin · Unlimited Access</span>
              </div>
            ) : subActive && expiry ? (
              <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-xl border border-green-400/30">
                <Zap size={16} className="text-green-400" />
                <span className="text-green-300 text-sm font-semibold">Active until {new Date(expiry).toLocaleDateString('en-GH')}</span>
              </div>
            ) : freeLeft > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-blue-400/20 px-4 py-2 rounded-xl border border-blue-400/30">
                  <Clock size={16} className="text-blue-300" />
                  <span className="text-blue-200 text-sm font-semibold">{freeLeft} free requests remaining</span>
                </div>
                <button onClick={openSubscription}
                  className="w-full bg-yellow-400 text-blue-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-yellow-300 transition-all">
                  ⚡ Upgrade Now
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-red-500/20 px-4 py-2 rounded-xl border border-red-400/30">
                  <span className="text-red-300 text-sm font-semibold">Free trial ended</span>
                </div>
                <button onClick={openSubscription}
                  className="w-full bg-yellow-400 text-blue-900 font-bold text-sm px-4 py-2 rounded-xl hover:bg-yellow-300 transition-all">
                  ⚡ Subscribe to Continue
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Ghana flag bar */}
        <div className="flex h-1.5">
          <div className="flex-1 bg-red-600" />
          <div className="flex-1 bg-yellow-400" />
          <div className="flex-1 bg-green-600" />
        </div>
      </div>

      {/* Feature grid */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-4">AI Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURES.map(f => (
            <Card
              key={f.path}
              className="p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              onClick={() => nav(f.path)}
            >
              <div className={`w-11 h-11 bg-gradient-to-br ${f.color} rounded-xl flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform shadow-sm`}>
                {f.icon}
              </div>
              <h4 className="font-bold text-gray-800 text-sm">{f.label}</h4>
              <p className="text-gray-500 text-xs mt-0.5 leading-tight">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick tips */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-3">💡 Ghana Curriculum Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { tip: 'Use the Lesson Plan tool to generate NaCCA-aligned plans in minutes instead of hours.' },
            { tip: 'The Assessment tool supports BECE and WASSCE question formats with auto-marking schemes.' },
            { tip: 'Report Cards follow GES continuous assessment format with Ghana grading system.' },
          ].map((t, i) => (
            <div key={i} className="bg-blue-50 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
              {t.tip}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
