// src/pages/ReportsPage.js
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { generateReportCard } from '../services/aiService';
import { saveEntry } from '../services/parseService';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Card, Input, Select, Textarea, AIResult, Loader } from '../components/ui';
import { FileText, Sparkles, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const GRADES = ['KG 1','KG 2','Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6','JHS 1','JHS 2','JHS 3','SHS 1','SHS 2','SHS 3'];


export default function ReportsPage() {
  const { openSubscription } = useOutletContext();
  const { use } = useFeatureAccess();
  const [form, setForm] = useState({
    studentName: '', grade: 'JHS 1', term: 'First Term', year: '2025/2026', teacherComment: ''
  });
  const [scores, setScores] = useState([
    { subject: 'English Language', classScore: '', examScore: '' },
    { subject: 'Mathematics', classScore: '', examScore: '' },
  ]);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const addRow = () => setScores(s => [...s, { subject: '', classScore: '', examScore: '' }]);
  const removeRow = (i) => setScores(s => s.filter((_, idx) => idx !== i));
  const updateScore = (i, k, v) => setScores(s => s.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  const generate = async () => {
    if (!form.studentName) return toast.error('Enter student name');
    if (scores.some(s => !s.subject)) return toast.error('Fill in all subject names');
    setLoading(true); setResult('');
    try {
      const scoresObj = scores.reduce((acc, s) => {
        if (s.subject) acc[s.subject] = { classScore: s.classScore || '0', examScore: s.examScore || '0' };
        return acc;
      }, {});
      const res = await use(() => generateReportCard(form.studentName, form.grade, scoresObj, form.term, form.year, form.teacherComment), openSubscription);
      if (res) { setResult(res); await saveEntry('report_card', res, { ...form, scores: scoresObj }); toast.success('Report card generated!'); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-sm"><FileText size={20} /></div>
        <div><h1 className="text-xl font-bold">Report Cards</h1><p className="text-sm text-gray-500">Generate & download Ghana GES-format report cards</p></div>
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Student Full Name *" value={form.studentName} onChange={e => setForm(f => ({ ...f, studentName: e.target.value }))} placeholder="e.g. Kwame Asante" />
          <Select label="Class/Grade" value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}>
            {GRADES.map(g => <option key={g}>{g}</option>)}
          </Select>
          <Select label="Term" value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))}>
            {['First Term','Second Term','Third Term'].map(t => <option key={t}>{t}</option>)}
          </Select>
          <Input label="Academic Year" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2025/2026" />
        </div>

        {/* Scores table */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Subject Scores</label>
          <div className="rounded-xl overflow-hidden border border-gray-200">
            <div className="grid grid-cols-12 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">
              <span className="col-span-5">Subject</span>
              <span className="col-span-3 text-center">Class Score (30)</span>
              <span className="col-span-3 text-center">Exam Score (70)</span>
              <span className="col-span-1" />
            </div>
            {scores.map((row, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 px-3 py-2 border-t border-gray-100 items-center">
                <input className="col-span-5 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400"
                  value={row.subject} onChange={e => updateScore(i, 'subject', e.target.value)} placeholder="Subject name" />
                <input className="col-span-3 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-blue-400"
                  value={row.classScore} onChange={e => updateScore(i, 'classScore', e.target.value)} placeholder="0-30" type="number" min="0" max="30" />
                <input className="col-span-3 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-blue-400"
                  value={row.examScore} onChange={e => updateScore(i, 'examScore', e.target.value)} placeholder="0-70" type="number" min="0" max="70" />
                <button onClick={() => removeRow(i)} className="col-span-1 text-red-400 hover:text-red-600 flex justify-center">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={addRow} className="mt-2 flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
            <Plus size={15} /> Add Subject
          </button>
        </div>

        <Textarea label="Teacher's Comment" value={form.teacherComment} onChange={e => setForm(f => ({ ...f, teacherComment: e.target.value }))}
          placeholder="e.g. Kwame has shown great improvement this term. He should work harder on Mathematics..." rows={3} />

        <button onClick={generate} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Generating...' : 'Generate Report Card'}
        </button>
      </Card>

      {loading && <Loader text="Preparing report card..." />}
      {result && <AIResult content={result} title={`Report Card - ${form.studentName} - ${form.term}`} />}
    </div>
  );
}

