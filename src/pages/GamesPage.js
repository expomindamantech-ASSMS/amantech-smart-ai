// src/pages/GamesPage.js
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { generateEducationalGame } from '../services/aiService';
import { saveEntry } from '../services/parseService';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Card, Input, Select, AIResult, Loader } from '../components/ui';
import { Gamepad2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const GRADES = ['Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6','JHS 1','JHS 2','JHS 3','SHS 1','SHS 2','SHS 3'];
const SUBJECTS = ['Mathematics','English Language','Integrated Science','Social Studies','ICT','RME','History','Geography'];
const GAME_TYPES = ['Quiz Game','Jeopardy-Style Review','Word Scramble','Crossword Puzzle','Matching Game','Bingo','Board Game','Card Game','Role Play','Debate Game','Memory Game'];

export default function GamesPage() {
  const { openSubscription } = useOutletContext();
  const { use } = useFeatureAccess();
  const [form, setForm] = useState({ subject: '', grade: '', topic: '', gameType: 'Quiz Game' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!form.subject || !form.grade || !form.topic) return toast.error('Fill all required fields');
    setLoading(true); setResult('');
    try {
      const res = await use(() => generateEducationalGame(form.subject, form.grade, form.topic, form.gameType), openSubscription);
      if (res) { setResult(res); await saveEntry('game', res, form); toast.success('Game designed!'); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center text-white shadow-sm"><Gamepad2 size={20} /></div>
        <div><h1 className="text-xl font-bold">Educational Games</h1><p className="text-sm text-gray-500">Design curriculum-aligned games for your class</p></div>
      </div>
      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Subject *" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
            <option value="">Select...</option>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </Select>
          <Select label="Grade *" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}>
            <option value="">Select...</option>
            {GRADES.map(g => <option key={g}>{g}</option>)}
          </Select>
        </div>
        <Input label="Topic *" value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} placeholder="e.g. Multiplication Tables" />
        <Select label="Game Type" value={form.gameType} onChange={e => setForm(f => ({ ...f, gameType: e.target.value }))}>
          {GAME_TYPES.map(g => <option key={g}>{g}</option>)}
        </Select>
        <button onClick={generate} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Designing Game...' : 'Design Game'}
        </button>
      </Card>
      {loading && <Loader text="Designing your educational game..." />}
      {result && <AIResult content={result} title={`${form.gameType} - ${form.subject}`} />}
    </div>
  );
}
