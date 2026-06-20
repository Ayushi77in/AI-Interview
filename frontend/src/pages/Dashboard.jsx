import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mic, TrendingUp, Award, Clock, ArrowRight, Zap, BarChart3, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const ScoreCircle = ({ score, size = 80 }) => {
  const radius = (size - 12) / 2;
  const circ = 2 * Math.PI * radius;
  const filled = ((score / 10) * circ);
  const color = score >= 7 ? '#22c55e' : score >= 5 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${filled} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease' }} />
      </svg>
      <span className="absolute text-white font-bold" style={{ fontSize: size * 0.22 }}>{score.toFixed(1)}</span>
    </div>
  );
};

const difficultyColors = { easy: 'text-green-400 bg-green-400/10', medium: 'text-yellow-400 bg-yellow-400/10', hard: 'text-red-400 bg-red-400/10' };

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/analytics');
        setAnalytics(data.analytics);
        setRecentInterviews(data.recentInterviews || []);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Interviews', value: analytics?.totalInterviews ?? 0, icon: Mic, color: 'brand' },
    { label: 'Average Score', value: analytics?.averageScore ? `${analytics.averageScore}/10` : '—', icon: TrendingUp, color: 'violet' },
    { label: 'Best Score', value: analytics?.bestScore ? `${analytics.bestScore}/10` : '—', icon: Award, color: 'amber' },
    { label: 'Hours Practiced', value: analytics?.totalTimeSpent ? `${Math.round(analytics.totalTimeSpent / 60)}h` : '0h', icon: Clock, color: 'emerald' },
  ];

  const colorMap = {
    brand: 'bg-brand-600/15 text-brand-400 border-brand-500/20',
    violet: 'bg-violet-600/15 text-violet-400 border-violet-500/20',
    amber: 'bg-amber-600/15 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-600/15 text-emerald-400 border-emerald-500/20',
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface-700 rounded-xl w-64 skeleton" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-28 skeleton rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">Track your progress and keep improving</p>
        </div>
        <Link to="/interview/setup" className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          <Zap size={16} /> New Interview
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-4 ${colorMap[color]}`}>
              <Icon size={17} />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-white/40 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Empty state or content */}
      {analytics?.totalInterviews === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
            <Mic size={28} className="text-brand-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Start your first interview</h3>
          <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
            Choose a role and difficulty, then let AI generate personalized questions for you.
          </p>
          <Link to="/interview/setup" className="btn-primary inline-flex items-center gap-2">
            <Zap size={16} /> Start practicing
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent interviews */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Recent interviews</h2>
              <Link to="/history" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1 transition-colors">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentInterviews.length === 0 ? (
                <p className="text-white/30 text-sm text-center py-6">No completed interviews yet</p>
              ) : recentInterviews.map(interview => (
                <Link key={interview._id} to={`/interview/${interview._id}/results`}
                  className="flex items-center gap-4 p-3.5 rounded-xl glass-hover cursor-pointer group transition-all duration-200">
                  <ScoreCircle score={interview.overallScore || 0} size={52} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{interview.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`tag ${difficultyColors[interview.difficulty]}`}>{interview.difficulty}</span>
                      <span className="text-white/30 text-xs">{interview.totalQuestions}Q</span>
                      <span className="text-white/20 text-xs">·</span>
                      <span className="text-white/30 text-xs">
                        {interview.completedAt ? format(new Date(interview.completedAt), 'MMM d') : 'In progress'}
                      </span>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-white/20 group-hover:text-brand-400 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick actions + tips */}
          <div className="space-y-4">
            <div className="card">
              <h2 className="text-white font-semibold mb-4">Quick start</h2>
              <div className="space-y-2">
                {[
                  { label: 'Frontend Dev · Easy', role: 'Frontend Developer', difficulty: 'easy' },
                  { label: 'DSA · Medium', role: 'Data Structures & Algorithms', difficulty: 'medium' },
                  { label: 'Backend · Hard', role: 'Backend Developer', difficulty: 'hard' },
                ].map(({ label }) => (
                  <Link key={label} to="/interview/setup"
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl glass-hover text-sm text-white/60 hover:text-white group transition-all">
                    <span>{label}</span>
                    <ArrowRight size={14} className="text-white/20 group-hover:text-brand-400 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="card bg-gradient-to-br from-brand-600/10 to-violet-600/10 border-brand-500/15">
              <div className="flex gap-3">
                <AlertCircle size={18} className="text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-medium mb-1">Pro tip</p>
                  <p className="text-white/50 text-xs leading-relaxed">
                    Practice the same role at increasing difficulty to build confidence systematically.
                  </p>
                </div>
              </div>
            </div>

            <Link to="/analytics" className="card flex items-center justify-between glass-hover group cursor-pointer transition-all">
              <div>
                <p className="text-white text-sm font-medium">View analytics</p>
                <p className="text-white/40 text-xs mt-0.5">Charts & insights</p>
              </div>
              <BarChart3 size={20} className="text-brand-400 group-hover:scale-110 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
