import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Clock, ArrowRight, Trash2, Filter, Zap } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const diffBadge = { easy: 'text-green-400 bg-green-400/10', medium: 'text-yellow-400 bg-yellow-400/10', hard: 'text-red-400 bg-red-400/10' };

const ScoreChip = ({ score }) => {
  const color = score >= 7 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`font-bold text-lg ${color}`}>{score > 0 ? score.toFixed(1) : '—'}</span>;
};

export default function History() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'completed', role: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [deleting, setDeleting] = useState(null);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (filter.status) params.set('status', filter.status);
      if (filter.role) params.set('role', filter.role);
      const { data } = await api.get(`/interviews?${params}`);
      setInterviews(data.interviews);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInterviews(); }, [page, filter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this interview?')) return;
    setDeleting(id);
    try {
      await api.delete(`/interviews/${id}`);
      setInterviews(p => p.filter(i => i._id !== id));
      toast.success('Interview deleted');
    } catch { toast.error('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const roles = ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Java Developer', 'MERN Stack Developer', 'Data Structures & Algorithms', 'HR Interview'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Interview History</h1>
        <p className="text-white/40 text-sm mt-1">All your past sessions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/40" />
          <select value={filter.status} onChange={e => { setFilter(p => ({ ...p, status: e.target.value })); setPage(1); }}
            className="input-field py-1.5 text-xs w-auto">
            <option value="">All statuses</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In progress</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>
        <select value={filter.role} onChange={e => { setFilter(p => ({ ...p, role: e.target.value })); setPage(1); }}
          className="input-field py-1.5 text-xs w-auto">
          <option value="">All roles</option>
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-20 skeleton rounded-2xl" />)}
        </div>
      ) : interviews.length === 0 ? (
        <div className="card text-center py-16">
          <Clock size={32} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No interviews found</h3>
          <p className="text-white/30 text-sm mb-5">Start your first session to see it here</p>
          <Link to="/interview/setup" className="btn-primary inline-flex items-center gap-2"><Zap size={15} /> New interview</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map(interview => (
            <div key={interview._id} className="glass glass-hover rounded-2xl p-4 sm:p-5 flex items-center gap-4 group">
              {/* Score */}
              <div className="text-center min-w-[48px]">
                <ScoreChip score={interview.overallScore || 0} />
                <p className="text-white/20 text-xs">/10</p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{interview.role}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`tag text-xs ${diffBadge[interview.difficulty]}`}>{interview.difficulty}</span>
                  <span className="text-white/30 text-xs">{interview.totalQuestions} questions</span>
                  {interview.duration > 0 && <span className="text-white/20 text-xs">{interview.duration}min</span>}
                  <span className="text-white/20 text-xs">·</span>
                  <span className="text-white/30 text-xs">
                    {interview.completedAt
                      ? format(new Date(interview.completedAt), 'MMM d, yyyy')
                      : format(new Date(interview.createdAt), 'MMM d, yyyy')
                    }
                  </span>
                </div>
              </div>

              {/* Status badge */}
              <div className={`hidden sm:block tag text-xs flex-shrink-0 ${
                interview.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                interview.status === 'in-progress' ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-white/5 text-white/30'
              }`}>{interview.status}</div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {interview.status === 'completed' && (
                  <Link to={`/interview/${interview._id}/results`}
                    className="p-2 rounded-xl text-white/30 hover:text-brand-400 hover:bg-brand-600/10 transition-all">
                    <ArrowRight size={16} />
                  </Link>
                )}
                {interview.status === 'in-progress' && (
                  <Link to={`/interview/${interview._id}`}
                    className="text-yellow-400 text-xs font-medium hover:text-yellow-300 transition-colors px-3 py-1.5 bg-yellow-500/10 rounded-lg">
                    Resume
                  </Link>
                )}
                <button onClick={() => handleDelete(interview._id)} disabled={deleting === interview._id}
                  className="p-2 rounded-xl text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="btn-secondary text-sm disabled:opacity-30">← Previous</button>
          <span className="text-white/30 text-sm">Page {page} of {pagination.pages}</span>
          <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)}
            className="btn-secondary text-sm disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  );
}
