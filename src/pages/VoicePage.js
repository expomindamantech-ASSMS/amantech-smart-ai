// src/pages/VoicePage.js
import React, { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { callAI } from '../services/aiService';
import { saveEntry } from '../services/parseService';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Card, AIResult, Loader } from '../components/ui';
import { Mic, MicOff, Square, Play, Sparkles, FileAudio } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoicePage() {
  const { openSubscription } = useOutletContext();
  const { use } = useFeatureAccess();
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [transcript, setTranscript] = useState('');
  const [action, setAction] = useState('summarize');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const timer = useRef(null);
  const recognition = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      chunks.current = [];
      mediaRecorder.current.ondataavailable = e => chunks.current.push(e.data);
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(chunks.current, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.current.start();
      setRecording(true); setSeconds(0);
      timer.current = setInterval(() => setSeconds(s => s + 1), 1000);

      // Browser speech recognition
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SR) {
        recognition.current = new SR();
        recognition.current.continuous = true;
        recognition.current.interimResults = true;
        recognition.current.lang = 'en-GH';
        recognition.current.onresult = (e) => {
          let text = '';
          for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript + ' ';
          setTranscript(text.trim());
        };
        recognition.current.start();
      }
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    recognition.current?.stop();
    clearInterval(timer.current);
    setRecording(false);
  };

  const processTranscript = async () => {
    if (!transcript) return toast.error('No transcript available. Record audio first.');
    setLoading(true); setResult('');
    const prompts = {
      summarize: `Summarize this educational recording in clear bullet points:\n\n${transcript}`,
      lesson: `Convert this spoken content into a structured lesson plan for Ghana curriculum:\n\n${transcript}`,
      questions: `Generate 10 exam questions based on this recorded content:\n\n${transcript}`,
      notes: `Convert this into clean, organized study notes for students:\n\n${transcript}`,
    };
    try {
      const res = await use(() => callAI(prompts[action]), openSubscription);
      if (res) { setResult(res); await saveEntry('voice_note', res, { transcript, action }); toast.success('Processed!'); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2,'0')}:${(s % 60).toString().padStart(2,'0')}`;

  const ACTIONS = [
    { key: 'summarize', label: '📋 Summarize' },
    { key: 'lesson', label: '📚 Make Lesson Plan' },
    { key: 'questions', label: '📝 Generate Questions' },
    { key: 'notes', label: '✏️ Study Notes' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-sm"><Mic size={20} /></div>
        <div><h1 className="text-xl font-bold">Voice Notes</h1><p className="text-sm text-gray-500">Record, transcribe and process audio with AI</p></div>
      </div>

      <Card className="p-6 space-y-5">
        {/* Recorder */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all ${recording ? 'bg-red-100' : 'bg-indigo-100'}`}>
            {recording && <div className="absolute inset-0 rounded-full bg-red-200 animate-ping opacity-50" />}
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${recording ? 'bg-red-500' : 'bg-indigo-500'}`}>
              {recording ? <MicOff size={28} className="text-white" /> : <Mic size={28} className="text-white" />}
            </div>
          </div>
          {recording && <p className="text-red-500 font-mono font-bold text-xl">{fmt(seconds)} <span className="text-sm font-normal text-red-400">recording...</span></p>}
          <div className="flex gap-3">
            {!recording ? (
              <button onClick={startRecording}
                className="flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all active:scale-95">
                <Mic size={18} /> Start Recording
              </button>
            ) : (
              <button onClick={stopRecording}
                className="flex items-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-red-700 transition-all active:scale-95">
                <Square size={18} /> Stop
              </button>
            )}
          </div>
          {audioURL && (
            <div className="w-full">
              <p className="text-xs text-gray-500 mb-1 font-medium flex items-center gap-1"><FileAudio size={13} /> Recorded audio:</p>
              <audio src={audioURL} controls className="w-full rounded-xl" />
            </div>
          )}
        </div>

        {/* Transcript */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Transcript (auto-filled or type manually)</label>
          <textarea
            value={transcript} onChange={e => setTranscript(e.target.value)}
            rows={5} placeholder="Your speech will appear here automatically, or type/paste text..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-indigo-400 text-sm resize-y"
          />
        </div>

        {/* Action selector */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">What would you like to do with this recording?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ACTIONS.map(a => (
              <button key={a.key} onClick={() => setAction(a.key)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${action === a.key ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <button onClick={processTranscript} disabled={loading || !transcript}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Processing...' : 'Process with AI'}
        </button>
      </Card>

      {loading && <Loader text="Processing your voice note..." />}
      {result && <AIResult content={result} title="Voice Note Output" />}
    </div>
  );
}
