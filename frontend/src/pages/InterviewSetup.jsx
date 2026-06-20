import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Code2, Layout, Server, Coffee, Layers, GitBranch, Users, Zap, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const roles = [
  { id: 'Software Engineer',            icon: Code2,     desc: 'DS&A, system design, OOP, APIs' },
  { id: 'Frontend Developer',            icon: Layout,    desc: 'React, JS, CSS, performance' },
  { id: 'Backend Developer',             icon: Server,    desc: 'Node.js, databases, APIs, security' },
  { id: 'Java Developer',                icon: Coffee,    desc: 'Java, Spring Boot, JVM, concurrency' },
  { id: 'MERN Stack Developer',          icon: Layers,    desc: 'MongoDB, Express, React, Node.js' },
  { id: 'Data Structures & Algorithms',  icon: GitBranch, desc: 'Arrays, trees, graphs, DP, sorting' },
  { id: 'HR Interview',                  icon: Users,     desc: 'Behavioral, teamwork, leadership' },
];

const difficulties = [
  { id: 'easy',   label: 'Easy',   color: 'green',  desc: 'Fundamentals & basics' },
  { id: 'medium', label: 'Medium', color: 'yellow', desc: 'Real-world scenarios' },
  { id: 'hard',   label: 'Hard',   color: 'red',    desc: 'Advanced & architectural' },
];

const questionCounts = [
  { id: 5,  label: '5 Questions',  time: '~10 min', best: 'Quick practice' },
  { id: 10, label: '10 Questions', time: '~20 min', best: 'Standard session' },
  { id: 15, label: '15 Questions', time: '~30 min', best: 'Full mock interview' },
];

const colorMap = {
  green:  'border-green-500/30 bg-green-500/5 hover:border-green-500/60',
  yellow: 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/60',
  red:    'border-red-500/30 bg-red-500/5 hover:border-red-500/60',
};
const selectedColorMap = {
  green:  'border-green-500 bg-green-500/15 shadow-green-500/20',
  yellow: 'border-yellow-500 bg-yellow-500/15 shadow-yellow-500/20',
  red:    'border-red-500 bg-red-500/15 shadow-red-500/20',
};
const textColorMap = { green: 'text-green-400', yellow: 'text-yellow-400', red: 'text-red-400' };

export default function InterviewSetup() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState({ role: '', difficulty: '', count: 0 });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const isComplete = selected.role && selected.difficulty && selected.count;

  const handleStart = async () => {
    if (!isComplete) { toast.error('Please complete all selections'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/interviews', {
        role: selected.role,
        difficulty: selected.difficulty,
        totalQuestions: selected.count,
      });
      toast.success('Interview ready! Good luck 🚀');
      navigate(`/interview/${data.interview._id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create interview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Set up your interview</h1>
        <p className="text-white/40 text-sm">Configure your mock interview session</p>
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {['Role', 'Difficulty', 'Length'].map((label, i) => {
          const num = i + 1;
          const done = (num === 1 && selected.role) || (num === 2 && selected.difficulty) || (num === 3 && selected.count);
          return (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${done ? 'bg-brand-600 border-brand-500 text-white' : 'border-white/20 text-white/30'}`}>
                  {done ? '✓' : num}
                </div>
                <span className={`text-xs font-medium ${done ? 'text-white/60' : 'text-white/20'}`}>{label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-px ${done ? 'bg-brand-600/40' : 'bg-white/10'}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {/* Role selection */}
      <div className="card">
        <h2 className="text-white font-semibold mb-4">Select role</h2>
        <div className="grid sm:grid-cols-2 gap-2.5">
          {roles.map(({ id, icon: Icon, desc }) => (
            <button key={id} onClick={() => setSelected(p => ({ ...p, role: id }))}
              className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                selected.role === id
                  ? 'border-brand-500 bg-brand-600/15 shadow-lg shadow-brand-600/10'
                  : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]'
              }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${selected.role === id ? 'bg-brand-600/20' : 'bg-white/[0.05]'}`}>
                <Icon size={17} className={selected.role === id ? 'text-brand-400' : 'text-white/40'} />
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-medium ${selected.role === id ? 'text-white' : 'text-white/70'}`}>{id}</p>
                <p className="text-white/30 text-xs truncate">{desc}</p>
              </div>
              {selected.role === id && (
                <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center ml-auto flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="card">
        <h2 className="text-white font-semibold mb-4">Select difficulty</h2>
        <div className="grid grid-cols-3 gap-3">
          {difficulties.map(({ id, label, color, desc }) => (
            <button key={id} onClick={() => setSelected(p => ({ ...p, difficulty: id }))}
              className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                selected.difficulty === id
                  ? `${selectedColorMap[color]} shadow-lg`
                  : `${colorMap[color]} border-white/[0.08]`
              }`}>
              <div className={`text-base font-bold mb-1 ${textColorMap[color]}`}>{label}</div>
              <div className="text-white/30 text-xs">{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Question count */}
      <div className="card">
        <h2 className="text-white font-semibold mb-4">Number of questions</h2>
        <div className="grid grid-cols-3 gap-3">
          {questionCounts.map(({ id, label, time, best }) => (
            <button key={id} onClick={() => setSelected(p => ({ ...p, count: id }))}
              className={`p-4 rounded-xl border text-center transition-all duration-200 ${
                selected.count === id
                  ? 'border-brand-500 bg-brand-600/15 shadow-lg shadow-brand-600/10'
                  : 'border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]'
              }`}>
              <div className={`text-lg font-bold mb-1 ${selected.count === id ? 'text-brand-300' : 'text-white/70'}`}>{id}</div>
              <div className="text-white/40 text-xs">{time}</div>
              <div className="text-white/20 text-xs mt-1">{best}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Summary + start */}
      {isComplete && (
        <div className="card bg-gradient-to-r from-brand-600/10 to-violet-600/10 border-brand-500/20 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-white/50 text-xs mb-1">Your interview summary</p>
              <p className="text-white font-semibold">
                {selected.role} · <span className={textColorMap[difficulties.find(d => d.id === selected.difficulty)?.color]}>{selected.difficulty}</span> · {selected.count} questions
              </p>
              <p className="text-white/30 text-xs mt-1">Questions will be generated by Gemini AI</p>
            </div>
            <button onClick={handleStart} disabled={loading}
              className="btn-primary flex items-center gap-2 whitespace-nowrap">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <><Zap size={16} /> Start interview</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
