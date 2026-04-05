// src/pages/AssessmentsPage.js
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { generateExamQuestions, generateMarkingScheme } from '../services/aiService';
import { saveEntry } from '../services/parseService';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Card, Input, Select, Textarea, AIResult, Loader } from '../components/ui';
import { ClipboardList, Sparkles, BookCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const GRADES = ['KG 1','KG 2','Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6','JHS 1','JHS 2','JHS 3','SHS 1','SHS 2','SHS 3'];
const SUBJECTS = ['Mathematics','English Language','Integrated Science','Social Studies','RME','ICT','Creative Arts','Science','Physics','Chemistry','Biology','Elective Maths','Economics','History','Geography'];
const Q_TYPES = ['Multiple Choice (MCQ)','Short Answer','Essay/Long Answer','Fill in the Blanks','True/False','Structured Questions','BECE Format','WASSCE Format','Mixed Question Types'];
const DIFFICULTIES = ['Easy (Foundation)','Medium (Intermediate)','Hard (Advanced)','Mixed Difficulty'];

export default function AssessmentsPage() {
  const { openSubscription } = useOutletContext();
  const { use } = useFeatureAccess();
  const [tab, setTab] = useState('questions');
  const [form, setForm] = useState({ subject: '', grade: '', topic: '', qtype: 'Multiple Choice (MCQ)', count: '10', difficulty: 'Medium (Intermediate)' });
  const [markForm, setMarkForm] = useState({ questions: '', subject: '', grade: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.subject || !form.grade || !form.topic) return toast.error('Fill in subject, grade and topic');
    setLoading(true); setResult('');
    try {
      const res = await use(async () => generateExamQuestions(form.subject, form.grade, form.topic, form.qtype, form.count, form.difficulty), openSubscription);
      if (res) { setResult(res); await saveEntry('exam_questions', res, form); toast.success('Questions generated!'); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const generateScheme = async () => {
    if (!markForm.questions) return toast.error('Paste your exam questions first');
    setLoading(true); setResult('');
    try {
      const res = await use(async () => generateMarkingScheme(markForm.questions, markForm.subject, markForm.grade), openSubscription);
      if (res) { setResult(res); await saveEntry('marking_scheme', res, markForm); toast.success('Marking scheme generated!'); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center text-white shadow-sm">
          <ClipboardList size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Assessments & Marking</h1>
          <p className="text-sm text-gray-500">Generate BECE/WASSCE-aligned questions and marking schemes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        {[['questions','📝 Questions'],['marking','✅ Marking Scheme']].map(([t,l]) => (
          <button key={t} onClick={() => { setTab(t); setResult(''); }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'questions' && (
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Subject *" value={form.subject} onChange={e => set('subject', e.target.value)}>
              <option value="">Select subject...</option>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </Select>
            <Select label="Grade *" value={form.grade} onChange={e => set('grade', e.target.value)}>
              <option value="">Select grade...</option>
              {GRADES.map(g => <option key={g}>{g}</option>)}
            </Select>
          </div>
          <Input label="Topic *" value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="e.g. Photosynthesis" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Question Type" value={form.qtype} onChange={e => set('qtype', e.target.value)}>
              {Q_TYPES.map(q => <option key={q}>{q}</option>)}
            </Select>
            <Select label="Difficulty" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
              {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
            </Select>
          </div>
          <Select label="Number of Questions" value={form.count} onChange={e => set('count', e.target.value)}>
            {['5','10','15','20','25','30'].map(n => <option key={n}>{n}</option>)}
          </Select>
          <button onClick={generate} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Generating...' : 'Generate Questions'}
          </button>
        </Card>
      )}

      {tab === 'marking' && (
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Subject" value={markForm.subject} onChange={e => setMarkForm(f => ({ ...f, subject: e.target.value }))} placeholder="Mathematics" />
            <Input label="Grade" value={markForm.grade} onChange={e => setMarkForm(f => ({ ...f, grade: e.target.value }))} placeholder="JHS 2" />
          </div>
          <Textarea label="Paste your exam questions *" value={markForm.questions} onChange={e => setMarkForm(f => ({ ...f, questions: e.target.value }))}
            placeholder="Paste the exam questions you want marking schemes for..." rows={8} />
          <button onClick={generateScheme} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-800 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <BookCheck size={18} />}
            {loading ? 'Generating...' : 'Generate Marking Scheme'}
          </button>
        </Card>
      )}

      {loading && <Loader text="Creating your assessment materials..." />}
      {result && <AIResult content={result} title={tab === 'questions' ? `Exam Questions - ${form.subject}` : `Marking Scheme`} />}
    </div>
  );
}
