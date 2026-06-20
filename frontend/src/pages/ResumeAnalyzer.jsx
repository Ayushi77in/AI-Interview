import React, { useState, useCallback } from 'react';
import api from '../services/api';
import { FileText, Upload, CheckCircle, AlertCircle, Zap, Target, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [drag, setDrag] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
    else toast.error('Please upload a PDF file');
  }, []);

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      const { data } = await api.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000,
      });
      setResult(data.analysis);
      toast.success('Resume analyzed!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Analysis failed. Try a text-based PDF.');
    } finally { setLoading(false); }
  };

  const scoreColor = result?.overallScore >= 80 ? 'text-green-400' : result?.overallScore >= 60 ? 'text-yellow-400' : 'text-red-400';
  const scoreBg = result?.overallScore >= 80 ? 'from-green-600/20' : result?.overallScore >= 60 ? 'from-yellow-600/20' : 'from-red-600/20';

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Resume Analyzer</h1>
        <p className="text-white/40 text-sm mt-1">Upload your PDF resume and get AI-powered ATS feedback</p>
      </div>

      {/* Upload zone */}
      <div className="card">
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onClick={() => document.getElementById('resume-input').click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
            drag ? 'border-brand-500 bg-brand-600/10' : 'border-white/[0.12] hover:border-brand-500/50 hover:bg-white/[0.02]'
          }`}>
          <input id="resume-input" type="file" accept=".pdf" className="hidden"
            onChange={e => { if (e.target.files[0]) setFile(e.target.files[0]); }} />
          <FileText size={36} className={`mx-auto mb-4 ${file ? 'text-brand-400' : 'text-white/20'}`} />
          {file ? (
            <div>
              <p className="text-white font-medium">{file.name}</p>
              <p className="text-white/40 text-sm mt-1">{(file.size / 1024).toFixed(0)} KB · PDF</p>
            </div>
          ) : (
            <div>
              <p className="text-white/60 font-medium">Drop your PDF here or click to browse</p>
              <p className="text-white/30 text-sm mt-1">Supports text-based PDFs up to 5MB</p>
            </div>
          )}
        </div>

        {file && (
          <div className="flex gap-3 mt-4">
            <button onClick={handleAnalyze} disabled={loading} className="btn-primary flex items-center gap-2 flex-1 justify-center">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing with AI...</>
              ) : (
                <><Zap size={16} /> Analyze Resume</>
              )}
            </button>
            <button onClick={() => { setFile(null); setResult(null); }} className="btn-secondary">Clear</button>
          </div>
        )}

        {loading && (
          <div className="mt-4 text-center">
            <p className="text-white/40 text-sm">This may take 20-30 seconds...</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-fade-in">
          {/* Score */}
          <div className={`card bg-gradient-to-br ${scoreBg} to-transparent`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/40 text-sm mb-1">ATS Score</p>
                <div className={`text-5xl font-black ${scoreColor}`}>{result.overallScore}<span className="text-2xl text-white/30">/100</span></div>
                <p className="text-white/50 text-sm mt-2">{result.summary}</p>
              </div>
              <div className="w-24 h-24 relative flex-shrink-0">
                <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none"
                    stroke={result.overallScore >= 80 ? '#22c55e' : result.overallScore >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8"
                    strokeDasharray={`${result.overallScore * 2.51} 251`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-lg font-bold ${scoreColor}`}>{result.overallScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {result.extractedSkills?.length > 0 && (
            <div className="card">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Star size={16} className="text-brand-400" /> Skills Detected</h3>
              <div className="flex flex-wrap gap-2">
                {result.extractedSkills.map(s => (
                  <span key={s} className="tag bg-brand-600/10 text-brand-300 border border-brand-500/20 text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended roles */}
          {result.recommendedRoles?.length > 0 && (
            <div className="card">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Target size={16} className="text-violet-400" /> Recommended Interview Tracks</h3>
              <div className="flex flex-wrap gap-2">
                {result.recommendedRoles.map(role => (
                  <Link key={role} to="/interview/setup"
                    className="tag bg-violet-600/10 text-violet-300 border border-violet-500/20 text-xs hover:bg-violet-600/20 transition-colors cursor-pointer">
                    {role} <ArrowRight size={10} className="inline ml-1" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Strengths */}
            {result.strengths?.length > 0 && (
              <div className="card">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm"><CheckCircle size={15} className="text-green-400" /> Strengths</h3>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-white/60 text-xs"><span className="text-green-400 mt-0.5">✓</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ATS Keywords */}
            {result.atsKeywords?.length > 0 && (
              <div className="card">
                <h3 className="text-white font-semibold mb-3 text-sm">ATS Keywords Found</h3>
                <div className="flex flex-wrap gap-1.5">
                  {result.atsKeywords.map(k => (
                    <span key={k} className="tag bg-emerald-600/10 text-emerald-400 text-xs">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Improvements */}
          {result.improvements?.length > 0 && (
            <div className="card">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><AlertCircle size={15} className="text-yellow-400" /> Areas to Improve</h3>
              <div className="space-y-3">
                {result.improvements.map((item, i) => (
                  <div key={i} className="p-3 bg-yellow-500/5 border border-yellow-500/10 rounded-xl">
                    <p className="text-yellow-400 text-xs font-medium mb-1">{item.section}</p>
                    <p className="text-white/50 text-xs mb-1">{item.issue}</p>
                    <p className="text-white/70 text-xs">→ {item.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card bg-gradient-to-r from-brand-600/10 to-violet-600/10 border-brand-500/20 text-center">
            <p className="text-white font-medium mb-2">Ready to practice for your target role?</p>
            <Link to="/interview/setup" className="btn-primary inline-flex items-center gap-2 text-sm">
              <Zap size={15} /> Start a mock interview
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
