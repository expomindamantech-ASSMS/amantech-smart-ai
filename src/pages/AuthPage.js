// src/pages/AuthPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, logIn } from '../services/parseService';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, BookOpen, Brain, Zap } from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const nav = useNavigate();

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (mode === 'signup' && form.password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      if (mode === 'login') {
        await logIn(form.email, form.password);
      } else {
        if (!form.name.trim()) return toast.error('Enter your name');
        await signUp(form.name, form.email, form.password);
      }
      refreshUser();
      nav('/dashboard');
      toast.success(mode === 'login' ? 'Welcome back! 👋' : 'Account created! Welcome 🎉');
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #0a2540 0%, #0f3460 50%, #1a1a4e 100%)' }}>
      {/* Left panel - desktop only */}
      <div className="hidden lg:flex flex-1 flex-col justify-center items-start p-16 text-white">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain size={28} className="text-white" />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 800 }} className="text-2xl">AmanTech Smart AI</h1>
              <p className="text-yellow-400 text-sm font-medium">Ghana's Premier Education AI</p>
            </div>
          </div>
          <h2 style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700 }} className="text-4xl leading-tight mb-4">
            Empowering Ghana's<br />
            <span className="text-yellow-400">Education Future</span>
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed mb-8">
            AI-powered tools built specifically for Ghana's NaCCA curriculum, 
            supporting teachers and students across every grade level.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { icon: <BookOpen size={18} />, text: 'NaCCA-aligned lesson plans & exam questions' },
            { icon: <Zap size={18} />, text: 'BECE & WASSCE preparation tools' },
            { icon: <Brain size={18} />, text: 'AI research assistant, games & report cards' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-blue-100">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-400">{f.icon}</div>
              <span className="text-sm">{f.text}</span>
            </div>
          ))}
        </div>
        <div className="mt-12 flex items-center gap-4">
          <div className="flex -space-x-2">
            {['🧑🏾‍🏫','👩🏿‍🎓','👨🏽‍🎓','👩🏾‍🏫'].map((e,i) => (
              <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-blue-900 flex items-center justify-center text-base">{e}</div>
            ))}
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Trusted by 1000+ educators</p>
            <p className="text-blue-300 text-xs">across Ghana</p>
          </div>
        </div>
      </div>

      {/* Right panel - auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl" style={{ fontFamily: 'Sora, sans-serif' }}>AmanTech Smart AI</h1>
              <p className="text-yellow-400 text-xs">Ghana Education AI Platform</p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Tabs */}
            <div className="flex bg-white/10 rounded-xl p-1 mb-8">
              {['login','signup'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${mode === m ? 'bg-yellow-400 text-blue-900' : 'text-white/70 hover:text-white'}`}>
                  {m === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-1.5">Full Name</label>
                  <input
                    name="name" value={form.name} onChange={handle} required
                    placeholder="e.g. Kwame Mensah"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-white/80 text-sm font-medium block mb-1.5">Email Address</label>
                <input
                  name="email" type="email" value={form.email} onChange={handle} required
                  placeholder="you@example.com"
                  className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition-all"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm font-medium block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    name="password" type={show ? 'text' : 'password'} value={form.password} onChange={handle} required
                    placeholder="••••••••"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-yellow-400 transition-all"
                  />
                  <button type="button" onClick={() => setShow(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="text-white/80 text-sm font-medium block mb-1.5">Confirm Password</label>
                  <input
                    name="confirm" type="password" value={form.confirm} onChange={handle} required
                    placeholder="••••••••"
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-yellow-400 transition-all"
                  />
                </div>
              )}

              {mode === 'signup' && (
                <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-3 text-yellow-300 text-xs">
                  🎁 Free trial: <strong>5 AI requests</strong> after signup. Subscribe from <strong>GH₵7/day</strong> to continue.
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-blue-900 font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
                {loading && <div className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="text-center text-white/40 text-xs mt-6">
            © 2025 AmanTech Smart AI · Built for Ghana's Education
          </p>
        </div>
      </div>
    </div>
  );
}
