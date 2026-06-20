import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { CheckCircle, XCircle, ChevronDown, ChevronUp, Zap, ArrowLeft, Repeat, Award, TrendingUp, Target } from 'lucide-react';
import { format } from 'date-fns';

const ScoreRing = ({ score, size = 100 }) => {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const pct = score / 10;
  const color = score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : score >= 3 ? '#f97316' : '#ef4444';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease' }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-white font-bold" style={{ fontSize: size * 0.2 }}>{score.toFixed(1)}</div>
        <div className="text-white/30" style={{ fontSize: size * 0.1 }}>/10</div>
      </div>
    </div>
  );
};

const QuestionCard = ({ q, index }) => {
  const [open, setOpen] = useState(false);
  const e = q.evaluation;
  const scoreColor = e.score >= 7 ? 'text-green-400' : e.score >= 5 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = e.score >= 7 ? 'bg-green-500/10 border-green-500/20' : e.score >= 5 ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className={`glass rounded-2xl border transition-all duration-200 ${open ? 'border-white/[0.12]' : 'border-white/[0.06]'}`}>
      <button onClick={() => setOpen(p => !p)} className="w-full flex items-center gap-4 p-4 sm:p-5 text-left">
        <div className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center flex-shrink-0 ${scoreBg}`}>
          <span className={`text-lg font-bold leading-none ${scoreColor}`}>{e.score}</span>
          <span className="text-white/30 text-xs">/10</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white/30 text-xs">Q{index + 1}</span>
            <span className="tag bg-brand-600/10 text-brand-400 text-xs">{q.category}</span>
          </div>
          <p className="text-white text-sm font-medium line-clamp-2">{q.question}</p>
        </div>
        {open ? <ChevronUp size={18} className="text-white/30 flex-shrink-0" /> : <ChevronDown size={18} className="text-white/30 flex-shrink-0" />}
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 space-y-4 border-t border-white/[0.06] pt-4 animate-fade-in">
          {q.userAnswer ? (
            <div>
              <p className="text-white/40 text-xs font-medium mb-2">Your answer</p>
              <p className="text-white/70 text-sm leading-relaxed bg-white/[0.03] rounded-xl p-3 font-mono">{q.userAnswer}</p>
            </div>
          ) : (
            <div className="text-white/30 text-sm italic">No answer provided</div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {e.strengths?.length > 0 && (
              <div>
                <p className="text-green-400 text-xs font-medium mb-2 flex items-center gap-1.5"><CheckCircle size={12} /> Strengths</p>
                <ul className="space-y-1">
                  {e.strengths.map((s, i) => <li key={i} className="text-white/60 text-xs flex gap-2"><span className="text-green-500 mt-0.5">•</span>{s}</li>)}
                </ul>
              </div>
            )}
            {e.weaknesses?.length > 0 && (
              <div>
                <p className="text-red-400 text-xs font-medium mb-2 flex items-center gap-1.5"><XCircle size={12} /> Areas to improve</p>
                <ul className="space-y-1">
                  {e.weaknesses.map((w, i) => <li key={i} className="text-white/60 text-xs flex gap-2"><span className="text-red-500 mt-0.5">•</span>{w}</li>)}
                </ul>
              </div>
            )}
          </div>

          {e.betterAnswer && (
            <div>
              <p className="text-brand-400 text-xs font-medium mb-2 flex items-center gap-1.5"><Target size={12} /> Model answer</p>
              <p className="text-white/60 text-sm leading-relaxed bg-brand-600/5 border border-brand-500/10 rounded-xl p-3">{e.betterAnswer}</p>
            </div>
          )}

          {e.suggestions?.length > 0 && (
            <div>
              <p className="text-violet-400 text-xs font-medium mb-2">Suggestions</p>
              <ul className="space-y-1">
                {e.suggestions.map((s, i) => <li key={i} className="text-white/50 text-xs flex gap-2"><span className="text-violet-400">→</span>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function InterviewResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/interviews/${id}`)
      .then(({ data }) => {
        if (data.interview.status !== 'completed') navigate(`/interview/${id}`, { replace: true });
        else setInterview(data.interview);
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !interview) {
    return (
      <div className="min-h-screen bg-surface-900 flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
        </div>
      </div>
    );
  }

  const topicScores = interview.topicScores || [];
  const weakest = [...topicScores].sort((a, b) => a.score - b.score).slice(0, 3);
  const strongest = [...topicScores].sort((a, b) => b.score - a.score).slice(0, 3);

  const grade = interview.overallScore >= 9 ? 'A+' : interview.overallScore >= 8 ? 'A' :
    interview.overallScore >= 7 ? 'B+' : interview.overallScore >= 6 ? 'B' :
    interview.overallScore >= 5 ? 'C' : interview.overallScore >= 3 ? 'D' : 'F';

  return (
    <div className="min-h-screen bg-surface-900">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-surface-800/80 backdrop-blur-xl px-4 sm:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/interview/setup" className="btn-secondary text-xs px-3 py-2 flex items-center gap-1.5">
              <Repeat size={14} /> Retry
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
        {/* Score hero */}
        <div className="card bg-gradient-to-br from-brand-600/10 to-violet-600/10 border-brand-500/15 text-center py-10">
          <p className="text-white/40 text-sm mb-6">Interview complete</p>
          <div className="flex items-center justify-center gap-8 sm:gap-12">
            <ScoreRing score={interview.overallScore} size={120} />
            <div className="text-left">
              <div className="text-6xl font-black text-white/10 mb-1">{grade}</div>
              <p className="text-white font-semibold text-xl">{interview.role}</p>
              <p className="text-white/40 text-sm capitalize mt-1">{interview.difficulty} difficulty · {interview.totalQuestions} questions</p>
              {interview.completedAt && (
                <p className="text-white/20 text-xs mt-2">{format(new Date(interview.completedAt), 'MMMM d, yyyy · h:mm a')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Overall feedback */}
        {interview.overallFeedback?.summary && (
          <div className="card">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Award size={18} className="text-brand-400" /> Overall Feedback</h2>
            <p className="text-white/60 text-sm leading-relaxed mb-4">{interview.overallFeedback.summary}</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {interview.overallFeedback.strengths?.length > 0 && (
                <div>
                  <p className="text-green-400 text-xs font-medium mb-2">Key strengths</p>
                  <ul className="space-y-1.5">
                    {interview.overallFeedback.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-white/60 text-xs"><span className="text-green-400 mt-0.5">✓</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {interview.overallFeedback.improvements?.length > 0 && (
                <div>
                  <p className="text-yellow-400 text-xs font-medium mb-2">Focus areas</p>
                  <ul className="space-y-1.5">
                    {interview.overallFeedback.improvements.map((s, i) => (
                      <li key={i} className="flex gap-2 text-white/60 text-xs"><span className="text-yellow-400 mt-0.5">→</span>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {interview.overallFeedback.recommendation && (
              <div className="mt-4 px-4 py-3 bg-brand-600/10 border border-brand-500/15 rounded-xl">
                <p className="text-brand-300 text-sm font-medium">{interview.overallFeedback.recommendation}</p>
              </div>
            )}
          </div>
        )}

        {/* Topic performance */}
        {topicScores.length > 0 && (
          <div className="card">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-brand-400" /> Topic Performance</h2>
            <div className="space-y-3">
              {topicScores.map(({ topic, score }) => (
                <div key={topic}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-white/60">{topic}</span>
                    <span className={score >= 7 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400'}>{score}/10</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${score >= 7 ? 'bg-green-500' : score >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${score * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-question breakdown */}
        <div>
          <h2 className="text-white font-semibold mb-4">Question-by-question breakdown</h2>
          <div className="space-y-3">
            {interview.questions.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex flex-col sm:flex-row gap-3 pb-8">
          <Link to="/interview/setup" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Zap size={16} /> Start new interview
          </Link>
          <Link to="/analytics" className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <TrendingUp size={16} /> View analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
