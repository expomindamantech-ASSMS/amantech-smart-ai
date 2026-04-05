// src/pages/LessonPlansPage.js
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { generateLessonPlan } from '../services/aiService';
import { saveEntry } from '../services/parseService';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Card, Input, Select, Textarea, AIResult, Loader } from '../components/ui';
import { BookOpen, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const GRADES = ['KG 1','KG 2','Primary 1','Primary 2','Primary 3','Primary 4','Primary 5','Primary 6','JHS 1','JHS 2','JHS 3','SHS 1','SHS 2','SHS 3'];
const SUBJECTS = ['Mathematics','English Language','Integrated Science','Social Studies','RME (Religious & Moral Education)','ICT','Creative Arts & Design','Physical Education','Ghanaian Language (Twi)','Ghanaian Language (Ga)','Ghanaian Language (Ewe)','French','History','Geography','Economics','Elective Mathematics','Physics','Chemistry','Biology','Literature in English'];
const DURATIONS = ['30 minutes','40 minutes','60 minutes','70 minutes','80 minutes','Double period (80 min)'];

export default function LessonPlansPage() {
  const { openSubscription } = useOutletContext();
  const { use } = useFeatureAccess();
  const [form, setForm] = useState({ subject: '', grade: '', topic: '', duration: '60 minutes', objectives: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!form.subject || !form.grade || !form.topic) return toast.error('Fill in subject, grade and topic');
    setLoading(true);
    setResult('');
    try {
      const res = await use(async () => {
        return await generateLessonPlan(form.subject, form.grade, form.topic, form.duration, form.objectives);
      }, openSubscription);
      if (res) {
        setResult(res);
        await saveEntry('lesson_plan', res, form);
        toast.success('Lesson plan generated!');
      }
    } catch (err) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-sm">
          <BookOpen size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Lesson Plan Generator</h1>
          <p className="text-sm text-gray-500">Create NaCCA-aligned lesson plans in seconds</p>
        </div>
      </div>

      <Card className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Subject *" value={form.subject} onChange={e => set('subject', e.target.value)}>
            <option value="">Select subject...</option>
            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
          </Select>
          <Select label="Grade/Class *" value={form.grade} onChange={e => set('grade', e.target.value)}>
            <option value="">Select grade...</option>
            {GRADES.map(g => <option key={g}>{g}</option>)}
          </Select>
        </div>
        <Input label="Topic/Lesson Title *" value={form.topic} onChange={e => set('topic', e.target.value)} placeholder="e.g. Addition and Subtraction of Fractions" />
        <Select label="Duration" value={form.duration} onChange={e => set('duration', e.target.value)}>
          {DURATIONS.map(d => <option key={d}>{d}</option>)}
        </Select>
        <Textarea label="Learning Objectives (optional)" value={form.objectives} onChange={e => set('objectives', e.target.value)}
          placeholder="Describe what students should achieve by end of lesson..." rows={3} />

        <button onClick={generate} disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-60">
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Generating...' : 'Generate Lesson Plan'}
        </button>
      </Card>

      {loading && <Loader text="Creating your NaCCA-aligned lesson plan..." />}
      {result && <AIResult content={result} title={`Lesson Plan - ${form.subject} ${form.grade} - ${form.topic}`} />}
    </div>
  );
}
