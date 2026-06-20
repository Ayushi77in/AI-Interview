import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-surface-800 border-r border-white/[0.06] p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-brand-600/10 via-transparent to-violet-600/8" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">InterviewAI</span>
          </Link>
        </div>
        <div className="relative space-y-6">
          <h2 className="text-3xl font-bold text-white leading-snug">
            Practice makes<br />
            <span className="gradient-text">perfect careers.</span>
          </h2>
          <div className="space-y-3">
            {['AI-generated technical questions', 'Instant detailed feedback', 'Score tracking & analytics'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-brand-400" />
                </div>
                <span className="text-white/60 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/20 text-xs">© 2024 InterviewAI</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">InterviewAI</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-white/40 text-sm">Sign in to continue practicing</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2">Email</label>
              <input
                type="email" required
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} required
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors p-1">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">Sign in <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
