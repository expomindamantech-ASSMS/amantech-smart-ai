// src/pages/MediaPage.js
import React, { useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { analyzeImage } from '../services/aiService';
import { saveEntry } from '../services/parseService';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Card, Textarea, AIResult, Loader } from '../components/ui';
import { Image, Upload, Sparkles, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

export default function MediaPage() {
  const { openSubscription } = useOutletContext();
  const { use } = useFeatureAccess();
  const [imgBase64, setImgBase64] = useState('');
  const [imgPreview, setImgPreview] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((files) => {
    const file = files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Image must be under 5MB');
    const reader = new FileReader();
    reader.onload = (e) => {
      const full = e.target.result;
      setImgPreview(full);
      setImgBase64(full.split(',')[1]);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] }, maxFiles: 1
  });

  const analyze = async () => {
    if (!imgBase64) return toast.error('Please upload an image first');
    setLoading(true); setResult('');
    try {
      const res = await use(() => analyzeImage(prompt || 'Analyze this educational image. Describe what you see and explain how it relates to Ghana education curriculum. Suggest how it can be used in teaching.', imgBase64), openSubscription);
      if (res) { setResult(res); await saveEntry('image_analysis', res, { prompt }); toast.success('Analysis complete!'); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const PROMPTS = [
    'Explain what this diagram shows and how to teach it to JHS students',
    'Identify the topic in this image and generate 5 exam questions about it',
    'Describe this image and suggest related NaCCA curriculum activities',
    'What subject area does this image relate to? How can it be used in class?',
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-700 rounded-xl flex items-center justify-center text-white shadow-sm"><Image size={20} /></div>
        <div><h1 className="text-xl font-bold">Images & Media</h1><p className="text-sm text-gray-500">Upload images for AI analysis and educational use</p></div>
      </div>

      <Card className="p-5 space-y-4">
        {/* Upload zone */}
        {!imgPreview ? (
          <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-pink-400 bg-pink-50' : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50/50'}`}>
            <input {...getInputProps()} />
            <Upload size={32} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500 text-sm font-medium">{isDragActive ? 'Drop image here...' : 'Drag & drop an image, or click to upload'}</p>
            <p className="text-gray-400 text-xs mt-1">JPG, PNG, GIF, WEBP · Max 5MB</p>
          </div>
        ) : (
          <div className="relative">
            <img src={imgPreview} alt="Uploaded" className="w-full max-h-64 object-contain rounded-xl border border-gray-200 bg-gray-50" />
            <button onClick={() => { setImgPreview(''); setImgBase64(''); setResult(''); }}
              className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 text-gray-500 hover:text-red-500">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Quick prompt suggestions */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">Quick prompts:</p>
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((p, i) => (
              <button key={i} onClick={() => setPrompt(p)}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-pink-100 hover:text-pink-700 rounded-full transition-all text-gray-600">
                {p.slice(0, 40)}...
              </button>
            ))}
          </div>
        </div>

        <Textarea label="Custom instruction (optional)" value={prompt} onChange={e => setPrompt(e.target.value)}
          placeholder="What would you like to know about this image?" rows={3} />

        <button onClick={analyze} disabled={loading || !imgBase64}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-700 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Analyzing...' : 'Analyze Image with AI'}
        </button>
      </Card>

      {loading && <Loader text="Analyzing your image..." />}
      {result && <AIResult content={result} title="Image Analysis" />}
    </div>
  );
}
