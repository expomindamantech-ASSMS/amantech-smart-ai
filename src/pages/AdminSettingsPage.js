// src/pages/AdminSettingsPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAppSettings, saveAppSettings } from '../services/parseService';
import { Card, Input } from '../components/ui';
import { Settings, Upload, Save, Image } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function AdminSettingsPage() {
  const { isAdmin } = useAuth();
  const nav = useNavigate();
  const [settings, setSettings] = useState({ appName: 'AmanTech Smart AI', tagline: "Ghana's Premier Education AI", logoBase64: '', supportEmail: 'support@amantechai.com', paystackKey: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) { nav('/dashboard'); return; }
    loadSettings();
  }, [isAdmin]);

  const loadSettings = async () => {
    const s = await getAppSettings();
    if (s) {
      setSettings(prev => ({
        ...prev,
        appName: s.get('appName') || prev.appName,
        tagline: s.get('tagline') || prev.tagline,
        logoBase64: s.get('logoBase64') || '',
        supportEmail: s.get('supportEmail') || prev.supportEmail,
      }));
    }
  };

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Logo must be under 2MB');
    const reader = new FileReader();
    reader.onload = (e) => setSettings(s => ({ ...s, logoBase64: e.target.result }));
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.svg', '.webp'] }, maxFiles: 1
  });

  const save = async () => {
    setSaving(true);
    try {
      await saveAppSettings(settings);
      toast.success('Settings saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center text-white shadow-sm"><Settings size={20} /></div>
        <div><h1 className="text-xl font-bold">App Settings</h1><p className="text-sm text-gray-500">Configure AmanTech Smart AI</p></div>
      </div>

      <Card className="p-5 space-y-5">
        {/* Logo Upload */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-3">App Logo</label>
          <div className="flex items-start gap-4">
            {settings.logoBase64 ? (
              <div className="relative">
                <img src={settings.logoBase64} alt="Logo" className="w-20 h-20 object-contain rounded-xl border border-gray-200 bg-gray-50" />
                <button onClick={() => setSettings(s => ({ ...s, logoBase64: '' }))}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">×</button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50">
                <Image size={24} className="text-gray-300" />
              </div>
            )}
            <div {...getRootProps()} className={`flex-1 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
              <input {...getInputProps()} />
              <div className="text-center">
                <Upload size={20} className="mx-auto mb-1 text-gray-300" />
                <p className="text-sm text-gray-500">{isDragActive ? 'Drop here...' : 'Upload AI Logo'}</p>
                <p className="text-xs text-gray-400">PNG, JPG, SVG · Max 2MB</p>
              </div>
            </div>
          </div>
        </div>

        <Input label="App Name" value={settings.appName} onChange={e => setSettings(s => ({ ...s, appName: e.target.value }))} />
        <Input label="Tagline" value={settings.tagline} onChange={e => setSettings(s => ({ ...s, tagline: e.target.value }))} />
        <Input label="Support Email" value={settings.supportEmail} onChange={e => setSettings(s => ({ ...s, supportEmail: e.target.value }))} />

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm font-semibold text-yellow-800 mb-2">🔑 API Keys Configuration</p>
          <p className="text-xs text-yellow-700">API keys should be set in your <code className="bg-yellow-100 px-1 rounded">.env</code> file or Vercel environment variables, not stored here. See deployment guide for details.</p>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
          {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </Card>
    </div>
  );
}
