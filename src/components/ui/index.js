// src/components/ui/index.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2, Download, Copy, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { downloadAsPDF, downloadAsText } from '../../utils/downloadUtils';
import toast from 'react-hot-toast';

// ─── BUTTON ───────────────────────────────────────────────────────────────────
export const Btn = ({ children, variant = 'primary', size = 'md', loading, icon, onClick, type = 'button', disabled, className = '' }) => {
  const base = 'inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 cursor-pointer select-none border-0 outline-none';
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };
  const variants = {
    primary: 'bg-navy text-white hover:bg-navy-light shadow-md hover:shadow-lg active:scale-95',
    gold: 'bg-gold text-navy hover:bg-gold-light shadow-md hover:shadow-lg active:scale-95',
    outline: 'bg-transparent border-2 border-navy text-navy hover:bg-navy hover:text-white',
    ghost: 'bg-transparent text-text-muted hover:bg-border hover:text-text',
    danger: 'bg-red text-white hover:opacity-90',
    success: 'bg-green text-navy hover:opacity-90'
  };
  const styles = {
    '--navy': '#0a2540', '--navy-light': '#0f3460', '--gold': '#f5a623',
    '--gold-light': '#fbbf24', '--border': '#e2e8f0', '--text-muted': '#64748b', '--text': '#1a1a2e',
    '--red': '#ef476f', '--green': '#06d6a0'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${sizes[size]} ${variants[variant]} ${disabled || loading ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      style={styles}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      {children}
    </button>
  );
};

// ─── CARD ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', style }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`} style={style}>
    {children}
  </div>
);

// ─── INPUT ────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <input
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm transition-all ${error ? 'border-red-400' : ''} ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

// ─── SELECT ───────────────────────────────────────────────────────────────────
export const Select = ({ label, children, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <select
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm bg-white transition-all ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

// ─── TEXTAREA ─────────────────────────────────────────────────────────────────
export const Textarea = ({ label, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
    <textarea
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 text-sm resize-y min-h-[100px] transition-all ${className}`}
      {...props}
    />
  </div>
);

// ─── LOADER ───────────────────────────────────────────────────────────────────
export const Loader = ({ text = 'Generating...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-4 border-gray-100 border-t-yellow-400 animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-blue-900 rounded-full" />
      </div>
    </div>
    <p className="text-sm text-gray-500 font-medium animate-pulse">{text}</p>
  </div>
);

// ─── AI RESULT ────────────────────────────────────────────────────────────────
export const AIResult = ({ content, title = 'Result' }) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 border border-gray-100 rounded-2xl overflow-hidden shadow-sm fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">✨ {title}</span>
        <div className="flex gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
          >
            {copied ? <CheckCheck size={13} className="text-green-500" /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={() => downloadAsPDF(content, title)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-all"
          >
            <Download size={13} />
            PDF
          </button>
          <button
            onClick={() => downloadAsText(content, title)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
          >
            <Download size={13} />
            TXT
          </button>
        </div>
      </div>
      {/* Content */}
      <div className="p-5 bg-white max-h-[600px] overflow-y-auto">
        <div className="markdown-content prose max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
export const Badge = ({ children, color = 'gray' }) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    gold: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>
      {children}
    </span>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-lg text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, label, value, color = 'blue', trend }) => {
  const colors = {
    blue: 'from-blue-500 to-blue-700',
    gold: 'from-yellow-400 to-yellow-600',
    green: 'from-green-400 to-green-600',
    red: 'from-red-400 to-red-600',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
