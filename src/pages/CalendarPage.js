// src/pages/CalendarPage.js
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { generateCalendar, generateTimetable } from '../services/aiService';
import { saveEntry } from '../services/parseService';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Card, Input, Select, Textarea, AIResult, Loader } from '../components/ui';
import { CalendarDays, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CalendarPage() {
  const { openSubscription } = useOutletContext();
  const { use } = useFeatureAccess();
  const [tab, setTab] = useState('calendar');
  const [calForm, setCalForm] = useState({ term: 'First Term', year: '2025/2026', schoolName: '' });
  const [ttForm, setTtForm] = useState({ classes: '', subjects: '', teachers: '', periods: '8' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const genCalendar = async () => {
    setLoading(true); setResult('');
    try {
      const res = await use(() => generateCalendar(calForm.term, calForm.year, calForm.schoolName || 'Our School'), openSubscription);
      if (res) { setResult(res); await saveEntry('calendar', res, calForm); toast.success('Calendar generated!'); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const genTimetable = async () => {
    if (!ttForm.classes || !ttForm.subjects) return toast.error('Fill in classes and subjects');
    setLoading(true); setResult('');
    try {
      const res = await use(() => generateTimetable(ttForm.classes, ttForm.subjects, ttForm.teachers, ttForm.periods), openSubscription);
      if (res) { setResult(res); await saveEntry('timetable', res, ttForm); toast.success('Timetable generated!'); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center text-white shadow-sm"><CalendarDays size={20} /></div>
        <div><h1 className="text-xl font-bold">Calendar & Timetable</h1><p className="text-sm text-gray-500">Generate school calendars and timetables</p></div>
      </div>

      <div className="flex bg-gray-100 rounded-xl p-1">
        {[['calendar','📅 Academic Calendar'],['timetable','🕐 School Timetable']].map(([t,l]) => (
          <button key={t} onClick={() => { setTab(t); setResult(''); }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>{l}</button>
        ))}
      </div>

      {tab === 'calendar' && (
        <Card className="p-5 space-y-4">
          <Input label="School Name" value={calForm.schoolName} onChange={e => setCalForm(f => ({ ...f, schoolName: e.target.value }))} placeholder="e.g. Accra Academy" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Term" value={calForm.term} onChange={e => setCalForm(f => ({ ...f, term: e.target.value }))}>
              {['First Term','Second Term','Third Term'].map(t => <option key={t}>{t}</option>)}
            </Select>
            <Input label="Academic Year" value={calForm.year} onChange={e => setCalForm(f => ({ ...f, year: e.target.value }))} placeholder="2025/2026" />
          </div>
          <button onClick={genCalendar} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-800 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Generating...' : 'Generate Calendar'}
          </button>
        </Card>
      )}

      {tab === 'timetable' && (
        <Card className="p-5 space-y-4">
          <Textarea label="Classes (one per line) *" value={ttForm.classes} onChange={e => setTtForm(f => ({ ...f, classes: e.target.value }))}
            placeholder="JHS 1A&#10;JHS 1B&#10;JHS 2A&#10;JHS 2B&#10;JHS 3A" rows={4} />
          <Textarea label="Subjects (one per line) *" value={ttForm.subjects} onChange={e => setTtForm(f => ({ ...f, subjects: e.target.value }))}
            placeholder="Mathematics&#10;English Language&#10;Integrated Science&#10;Social Studies&#10;RME&#10;ICT" rows={5} />
          <Textarea label="Teachers (name: subject, one per line)" value={ttForm.teachers} onChange={e => setTtForm(f => ({ ...f, teachers: e.target.value }))}
            placeholder="Mr. Asante: Mathematics&#10;Ms. Boateng: English Language" rows={4} />
          <Select label="Periods per Day" value={ttForm.periods} onChange={e => setTtForm(f => ({ ...f, periods: e.target.value }))}>
            {['6','7','8','9','10'].map(n => <option key={n}>{n}</option>)}
          </Select>
          <button onClick={genTimetable} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-800 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Generating...' : 'Generate Timetable'}
          </button>
        </Card>
      )}

      {loading && <Loader text="Building your schedule..." />}
      {result && <AIResult content={result} title={tab === 'calendar' ? `Academic Calendar ${calForm.year}` : 'School Timetable'} />}
    </div>
  );
}
