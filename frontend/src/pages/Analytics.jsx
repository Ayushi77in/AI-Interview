import React, { useEffect, useState } from 'react';
import { Line, Bar, Radar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend
} from 'chart.js';
import api from '../services/api';
import { TrendingUp, Award, Target, Zap, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1a2e',
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      titleColor: '#fff',
      bodyColor: 'rgba(255,255,255,0.6)',
      padding: 10,
      cornerRadius: 10,
    }
  },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 } }, min: 0, max: 10 }
  }
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const { data: res } = await api.get('/analytics');
      setData(res);
    } catch { toast.error('Failed to load analytics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await api.post('/analytics/refresh');
      await fetchAnalytics();
      toast.success('Analytics refreshed');
    } catch { toast.error('Refresh failed'); }
    finally { setRefreshing(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1,2,3].map(i => <div key={i} className="h-48 skeleton rounded-2xl" />)}
      </div>
    );
  }

  const analytics = data?.analytics;
  const recentInterviews = data?.recentInterviews || [];

  if (!analytics || analytics.totalInterviews === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
          <TrendingUp size={28} className="text-brand-400" />
        </div>
        <h2 className="text-white font-bold text-xl mb-3">No data yet</h2>
        <p className="text-white/40 mb-6">Complete your first interview to see detailed analytics and performance insights.</p>
        <a href="/interview/setup" className="btn-primary inline-flex items-center gap-2"><Zap size={16} /> Start an interview</a>
      </div>
    );
  }

  // Score trend chart
  const scoreHistory = [...(analytics.scoreHistory || [])].reverse().slice(-10);
  const trendData = {
    labels: scoreHistory.map((_, i) => `#${i + 1}`),
    datasets: [{
      label: 'Score',
      data: scoreHistory.map(s => s.score),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6366f1',
      pointRadius: 5,
      pointHoverRadius: 7,
    }]
  };

  // Monthly progress
  const monthly = analytics.monthlyProgress || [];
  const monthlyData = {
    labels: monthly.map(m => {
      const [y, mo] = m.month.split('-');
      return new Date(y, mo - 1).toLocaleString('default', { month: 'short' });
    }),
    datasets: [
      {
        label: 'Avg Score',
        data: monthly.map(m => m.averageScore),
        backgroundColor: 'rgba(99,102,241,0.7)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Interviews',
        data: monthly.map(m => m.interviewsCount),
        backgroundColor: 'rgba(139,92,246,0.4)',
        borderRadius: 6,
        borderSkipped: false,
        yAxisID: 'y2',
      }
    ]
  };

  // Role breakdown doughnut
  const roleData = {
    labels: (analytics.roleBreakdown || []).map(r => r.role.replace(' Developer', '').replace(' Stack', '')),
    datasets: [{
      data: (analytics.roleBreakdown || []).map(r => r.count),
      backgroundColor: ['#6366f1','#8b5cf6','#a78bfa','#7c3aed','#4f46e5','#4338ca','#3730a3'],
      borderWidth: 0,
      hoverOffset: 4,
    }]
  };

  // Topic radar
  const topics = (analytics.topicPerformance || []).slice(0, 7);
  const radarData = {
    labels: topics.map(t => t.topic),
    datasets: [{
      label: 'Score',
      data: topics.map(t => t.averageScore),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.15)',
      pointBackgroundColor: '#6366f1',
      pointRadius: 4,
    }]
  };

  const topicsSorted = [...topics].sort((a, b) => a.averageScore - b.averageScore);
  const weakest = topicsSorted.slice(0, 3);
  const strongest = topicsSorted.reverse().slice(0, 3);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-white/40 text-sm mt-1">Your performance insights</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Interviews', value: analytics.totalInterviews, icon: Zap, color: 'text-brand-400' },
          { label: 'Average Score', value: `${analytics.averageScore}/10`, icon: TrendingUp, color: 'text-violet-400' },
          { label: 'Best Score', value: `${analytics.bestScore}/10`, icon: Award, color: 'text-amber-400' },
          { label: 'Topics Covered', value: analytics.topicPerformance?.length || 0, icon: Target, color: 'text-emerald-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <Icon size={18} className={`${color} mb-3`} />
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-white/30 text-xs">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score trend */}
        <div className="lg:col-span-2 card">
          <h2 className="text-white font-semibold mb-5">Score trend</h2>
          <div style={{ height: 200 }}>
            <Line data={trendData} options={chartDefaults} />
          </div>
        </div>

        {/* Role distribution */}
        <div className="card">
          <h2 className="text-white font-semibold mb-5">By role</h2>
          {roleData.labels.length > 0 ? (
            <>
              <div style={{ height: 140 }}>
                <Doughnut data={roleData} options={{ ...chartDefaults, scales: undefined, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
              </div>
              <div className="mt-3 space-y-1.5">
                {(analytics.roleBreakdown || []).map((r, i) => (
                  <div key={r.role} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: roleData.datasets[0].backgroundColor[i] }} />
                      <span className="text-white/50 truncate max-w-[100px]">{r.role.replace(' Developer', '')}</span>
                    </div>
                    <span className="text-white/30">{r.count}×</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-white/20 text-sm text-center py-10">No data</p>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      {topics.length >= 3 && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-white font-semibold mb-5">Topic radar</h2>
            <div style={{ height: 220 }}>
              <Radar data={radarData} options={{
                ...chartDefaults,
                scales: {
                  r: {
                    min: 0, max: 10,
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 9 }, stepSize: 2, backdropColor: 'transparent' },
                    pointLabels: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } }
                  }
                }
              }} />
            </div>
          </div>

          <div className="card">
            <h2 className="text-white font-semibold mb-5">Topic scores</h2>
            <div className="space-y-3">
              {topics.map(({ topic, averageScore }) => (
                <div key={topic}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60 truncate">{topic}</span>
                    <span className={averageScore >= 7 ? 'text-green-400' : averageScore >= 5 ? 'text-yellow-400' : 'text-red-400'}>
                      {averageScore}/10
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full">
                    <div className={`h-full rounded-full transition-all duration-700 ${averageScore >= 7 ? 'bg-green-500' : averageScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${averageScore * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Strongest / Weakest */}
      {topics.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="card border-green-500/10">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Award size={16} className="text-green-400" /> Strongest Topics</h2>
            {strongest.map(({ topic, averageScore }) => (
              <div key={topic} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-white/60 text-sm">{topic}</span>
                <span className="text-green-400 font-semibold text-sm">{averageScore}/10</span>
              </div>
            ))}
          </div>
          <div className="card border-red-500/10">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><Target size={16} className="text-red-400" /> Needs Work</h2>
            {weakest.map(({ topic, averageScore }) => (
              <div key={topic} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-white/60 text-sm">{topic}</span>
                <span className="text-red-400 font-semibold text-sm">{averageScore}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly trend */}
      {monthly.length > 1 && (
        <div className="card">
          <h2 className="text-white font-semibold mb-5">Monthly progress</h2>
          <div style={{ height: 200 }}>
            <Bar data={monthlyData} options={{
              ...chartDefaults,
              scales: {
                ...chartDefaults.scales,
                y: { ...chartDefaults.scales.y, position: 'left' },
                y2: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 10 } } }
              },
              plugins: { ...chartDefaults.plugins, legend: { display: true, labels: { color: 'rgba(255,255,255,0.4)', font: { size: 11 }, boxWidth: 10, boxHeight: 10 } } }
            }} />
          </div>
        </div>
      )}
    </div>
  );
}
