import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, Zap, AlertTriangle, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const timerRef = useRef(null);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const { data } = await api.get(`/interviews/${id}`);
        if (data.interview.status === 'completed') {
          navigate(`/interview/${id}/results`, { replace: true });
          return;
        }
        setInterview(data.interview);
        // Pre-fill saved answers
        const saved = {};
        data.interview.questions.forEach((q, i) => { if (q.userAnswer) saved[i] = q.userAnswer; });
        setAnswers(saved);
        // Start interview
        if (data.interview.status !== 'in-progress') {
          await api.patch(`/interviews/${id}/start`);
        }
      } catch {
        toast.error('Interview not found');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Auto-save every 30s
  useEffect(() => {
    autoSaveRef.current = setInterval(() => {
      if (answers[currentIdx] !== undefined) saveCurrentAnswer(true);
    }, 30000);
    return () => clearInterval(autoSaveRef.current);
  }, [currentIdx, answers]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const saveCurrentAnswer = useCallback(async (silent = false) => {
    if (!answers[currentIdx]?.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/interviews/${id}/answer`, {
        questionIndex: currentIdx,
        answer: answers[currentIdx],
        timeSpent: elapsed,
      });
      if (!silent) toast.success('Answer saved');
    } catch {
      if (!silent) toast.error('Failed to save answer');
    } finally {
      setSaving(false);
    }
  }, [currentIdx, answers, id, elapsed]);

  const handleNext = async () => {
    await saveCurrentAnswer(true);
    setCurrentIdx(p => Math.min(p + 1, interview.questions.length - 1));
  };

  const handlePrev = async () => {
    await saveCurrentAnswer(true);
    setCurrentIdx(p => Math.max(p - 1, 0));
  };

  const handleSubmit = async () => {
    if (!confirmSubmit) { setConfirmSubmit(true); return; }
    setSubmitting(true);
    try {
      // Save current answer first
      if (answers[currentIdx]?.trim()) {
        await api.patch(`/interviews/${id}/answer`, {
          questionIndex: currentIdx,
          answer: answers[currentIdx],
          timeSpent: elapsed,
        });
      }
      toast.loading('Evaluating your answers with AI...', { id: 'evaluating', duration: 60000 });
      await api.post(`/interviews/${id}/complete`);
      toast.dismiss('evaluating');
      toast.success('Interview completed! View your results.');
      navigate(`/interview/${id}/results`);
    } catch (err) {
      toast.dismiss('evaluating');
      toast.error(err.response?.data?.error || 'Submission failed');
      setSubmitting(false);
      setConfirmSubmit(false);
    }
  };

  if (loading || !interview) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto animate-pulse">
            <Zap size={20} className="text-white" />
          </div>
          <p className="text-white/40 text-sm">Loading your interview...</p>
        </div>
      </div>
    );
  }

  const q = interview.questions[currentIdx];
  const answered = Object.keys(answers).filter(k => answers[k]?.trim()).length;
  const progress = ((currentIdx + 1) / interview.questions.length) * 100;

  return (
    <div className="min-h-screen bg-surface-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-surface-800/80 backdrop-blur-xl px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Zap size={15} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{interview.role}</p>
              <p className="text-white/30 text-xs capitalize">{interview.difficulty} · {interview.totalQuestions} questions</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-1.5 text-white/50 text-sm">
              <Clock size={14} className="text-brand-400" />
              <span className="font-mono text-brand-300">{formatTime(elapsed)}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-white/40 text-xs">
              <CheckCircle size={13} className="text-green-400" />
              {answered}/{interview.questions.length} answered
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-surface-700">
        <div className="h-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-500"
          style={{ width: `${progress}%` }} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Question counter */}
          <div className="flex items-center gap-3">
            <span className="text-brand-400 text-sm font-medium">Q{currentIdx + 1}</span>
            <div className="flex gap-1">
              {interview.questions.map((_, i) => (
                <button key={i} onClick={async () => { await saveCurrentAnswer(true); setCurrentIdx(i); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIdx ? 'w-6 bg-brand-500' :
                    answers[i]?.trim() ? 'w-2 bg-green-500/60' : 'w-2 bg-white/10'
                  }`} />
              ))}
            </div>
            <span className="text-white/30 text-xs ml-auto">{currentIdx + 1} of {interview.questions.length}</span>
          </div>

          {/* Question card */}
          <div className="card border-white/[0.1]">
            <div className="flex items-center gap-2 mb-4">
              <span className="tag bg-brand-600/15 text-brand-300 border border-brand-500/20 text-xs">
                {q.category}
              </span>
              <span className={`tag text-xs ${
                q.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
                q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-red-500/10 text-red-400'
              }`}>{q.difficulty}</span>
            </div>
            <h2 className="text-white text-lg font-medium leading-relaxed">{q.question}</h2>
          </div>

          {/* Answer textarea */}
          <div>
            <label className="block text-white/50 text-xs font-medium mb-2">Your answer</label>
            <textarea
              value={answers[currentIdx] || ''}
              onChange={e => setAnswers(p => ({ ...p, [currentIdx]: e.target.value }))}
              placeholder="Type your answer here. Be as detailed as possible — explain your reasoning, mention examples, and cover edge cases..."
              className="input-field min-h-[200px] sm:min-h-[260px] font-mono text-sm leading-relaxed"
            />
            <p className="text-white/20 text-xs mt-2">
              {(answers[currentIdx] || '').length} characters · Press Save or navigate to auto-save
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button onClick={handlePrev} disabled={currentIdx === 0}
                className="btn-secondary flex items-center gap-1.5 text-sm disabled:opacity-30">
                <ChevronLeft size={16} /> Previous
              </button>
              <button onClick={() => saveCurrentAnswer(false)}
                className="btn-ghost flex items-center gap-1.5 text-sm"
                disabled={saving || !answers[currentIdx]?.trim()}>
                {saving ? <div className="w-3.5 h-3.5 border border-white/40 border-t-white rounded-full animate-spin" /> : <Save size={14} />}
                Save
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {currentIdx < interview.questions.length - 1 ? (
                <button onClick={handleNext} className="btn-primary flex items-center gap-1.5 text-sm flex-1 sm:flex-none justify-center">
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className={`flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex-1 sm:flex-none justify-center ${
                    confirmSubmit
                      ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-600/20'
                      : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/20'
                  }`}>
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Evaluating...</>
                  ) : confirmSubmit ? (
                    <><CheckCircle size={16} /> Confirm submit</>
                  ) : (
                    <><Zap size={16} /> Submit interview</>
                  )}
                </button>
              )}
            </div>
          </div>

          {confirmSubmit && !submitting && (
            <div className="card border-yellow-500/20 bg-yellow-500/5 animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium mb-1">Ready to submit?</p>
                  <p className="text-white/50 text-xs">
                    {answered} of {interview.questions.length} questions answered. 
                    Unanswered questions will receive a score of 0. Click "Confirm submit" to proceed.
                  </p>
                  <button onClick={() => setConfirmSubmit(false)} className="text-white/40 hover:text-white text-xs mt-2 underline">
                    Go back and review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
