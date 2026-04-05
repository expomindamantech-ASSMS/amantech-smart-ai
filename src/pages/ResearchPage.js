// src/pages/ResearchPage.js
import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { generateProjectGuide, researchAssistant } from '../services/aiService';
import { saveEntry } from '../services/parseService';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { Card, Input, Select, Textarea, AIResult, Loader } from '../components/ui';
import { Microscope, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const GRADES = ['Primary 4','Primary 5','Primary 6','JHS 1','JHS 2','JHS 3','SHS 1','SHS 2','SHS 3'];
const SUBJECTS = ['Mathematics','English Language','Integrated Science','Social Studies','History','Geography','Economics','Physics','Chemistry','Biology','ICT'];
const PROJECT_TYPES = ['Individual Research','Group Project','Science Fair Project','Literary Analysis','Social Survey','Case Study','Experiment Report','Field Study'];

export default function ResearchPage() {
  const { openSubscription } = useOutletContext();
  const { use } = useFeatureAccess();
  const [tab, setTab] = useState('research');
  const [query, setQuery] = useState(''); const [subject, setSubject] = useState(''); const [grade, setGrade] = useState('');
  const [pSubject, setPSubject] = useState(''); const [pGrade, setPGrade] = useState(''); const [pTopic, setPTopic] = useState(''); const [pType, setPType] = useState('Individual Research');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const ask = async () => {
    if (!query) return toast.error('Enter your question');
    setLoading(true); setResult('');
    try {
      const res = await use(() => researchAssistant(query, subject, grade), openSubscription);
      if (res) { setResult(res); await saveEntry('research', res, { query, subject, grade }); toast.success('Done!'); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const genProject = async () => {
    if (!pTopic) return toast.error('Enter project topic');
    setLoading(true); setResult('');
    try {
      const res = await use(() => generateProjectGuide(pSubject, pGrade, pTopic, pType), openSubscription);
      if (res) { setResult(res); await saveEntry('project_guide', res, { subject: pSubject, grade: pGrade, topic: pTopic }); toast.success('Project guide ready!'); }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 fade-in">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center text-white shadow-sm"><Microscope size={20} /></div>
        <div><h1 className="text-xl font-bold text-gray-900">Research & Projects</h1><p className="text-sm text-gray-500">AI research assistant & project guides</p></div>
      </div>
      <div className="flex bg-gray-100 rounded-xl p-1">
        {[['research','🔍 Research Q&A'],['project','📋 Project Guide']].map(([t,l]) => (
          <button key={t} onClick={() => { setTab(t); setResult(''); }}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{l}</button>
        ))}
      </div>
      {tab === 'research' && (
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Subject (optional)" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Science" />
            <Select label="Grade (optional)" value={grade} onChange={e => setGrade(e.target.value)}>
              <option value="">Any grade</option>
              {GRADES.map(g => <option key={g}>{g}</option>)}
            </Select>
          </div>
          <Textarea label="Your Research Question *" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything curriculum-related, e.g. 'Explain how the water cycle works for JHS students with Ghana examples'" rows={4} />
          <button onClick={ask} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-800 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Researching...' : 'Get Answer'}
          </button>
        </Card>
      )}
      {tab === 'project' && (
        <Card className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Subject" value={pSubject} onChange={e => setPSubject(e.target.value)}>
              <option value="">Select...</option>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </Select>
            <Select label="Grade" value={pGrade} onChange={e => setPGrade(e.target.value)}>
              <option value="">Select...</option>
              {GRADES.map(g => <option key={g}>{g}</option>)}
            </Select>
          </div>
          <Input label="Project Topic *" value={pTopic} onChange={e => setPTopic(e.target.value)} placeholder="e.g. The Impact of Climate Change on Ghana's Farming" />
          <Select label="Project Type" value={pType} onChange={e => setPType(e.target.value)}>
            {PROJECT_TYPES.map(p => <option key={p}>{p}</option>)}
          </Select>
          <button onClick={genProject} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-800 text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-60">
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Sparkles size={18} />}
            {loading ? 'Creating Guide...' : 'Generate Project Guide'}
          </button>
        </Card>
      )}
      {loading && <Loader text="Researching Ghana curriculum sources..." />}
      {result && <AIResult content={result} title="Research Result" />}
    </div>
  );
}
