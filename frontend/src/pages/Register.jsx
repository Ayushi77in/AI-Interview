import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordStrength = () => {
    const p = form.password;
    if (p.length === 0) return 0;
    if (p.length < 6) return 1;
    if (p.length < 10) return 2;
    return 3;
  };

  const strengthColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to InterviewAI 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-surface-800 border-r border-white/[0.06] p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-brand-600/8" />
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
            Your dream job<br />
            <span className="gradient-text">starts here.</span>
          </h2>
          <div className="space-y-4">
            {[
              { title: 'Free forever', desc: 'No credit card, no limits on practice' },
              { title: 'Real questions', desc: 'AI generates fresh questions every session' },
              { title: 'Expert feedback', desc: 'Detailed analysis on every answer' },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-3">
                <CheckCircle size={18} className="text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-white text-sm font-medium">{title}</p>
                  <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-white/20 text-xs">© 2024 InterviewAI</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">InterviewAI</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-white/40 text-sm">Start preparing for interviews today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2">Full name</label>
              <input type="text" required className="input-field" placeholder="Alex Johnson"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2">Email</label>
              <input type="email" required className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-white/60 text-xs font-medium mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required
                  className="input-field pr-12" placeholder="Min. 6 characters"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 p-1">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${strength === 3 ? 'text-green-400' : strength === 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {strengthLabels[strength]}
                  </span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">Create account <ArrowRight size={16} /></span>
              )}
            </button>
          </form>

          <p className="text-center text-white/30 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
