import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, BarChart3, Target, Brain, CheckCircle, ArrowRight, Star, Code2, Users, TrendingUp } from 'lucide-react';

const features = [
  { icon: Brain, title: 'AI-Powered Questions', desc: 'Gemini AI generates role-specific, context-aware questions tailored to your target position and difficulty.' },
  { icon: Target, title: 'Instant Feedback', desc: 'Get detailed scores, strengths, weaknesses, and model answers for every response you give.' },
  { icon: BarChart3, title: 'Performance Analytics', desc: 'Track your progress over time with charts showing score trends, topic performance, and improvement areas.' },
  { icon: CheckCircle, title: 'Resume Analyzer', desc: 'Upload your resume and get AI-powered ATS analysis with actionable improvement suggestions.' },
];

const roles = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer',
  'Java Developer', 'MERN Stack Developer', 'DSA & Algorithms', 'HR Interview'
];

const stats = [
  { value: '7+', label: 'Interview Roles' },
  { value: '3', label: 'Difficulty Levels' },
  { value: 'AI', label: 'Powered Feedback' },
  { value: '∞', label: 'Practice Sessions' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-900 overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-surface-900/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">InterviewAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost text-sm hidden sm:block">Sign in</Link>
            <Link to="/register" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 relative">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-violet-600/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/10 border border-brand-500/20 text-brand-300 text-xs font-medium mb-8">
            <Zap size={12} />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
            Ace your next
            <br />
            <span className="gradient-text">technical interview</span>
          </h1>

          <p className="text-lg text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed">
            Practice with AI-generated questions, receive instant expert feedback,
            and track your growth—all in one platform built for serious candidates.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 w-full sm:w-auto">
              Start practicing free
              <ArrowRight size={18} className="ml-2 inline" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3.5 w-full sm:w-auto">
              Sign in
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="glass rounded-2xl py-4">
                <div className="text-2xl font-bold gradient-text mb-1">{value}</div>
                <div className="text-white/40 text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-white/30 text-sm font-medium mb-6 uppercase tracking-widest">Supported interview tracks</p>
          <div className="flex flex-wrap justify-center gap-3">
            {roles.map(role => (
              <span key={role} className="glass px-4 py-2 rounded-xl text-white/60 text-sm hover:text-white hover:border-white/20 transition-all duration-200 cursor-default">
                {role}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">Everything you need to prepare</h2>
            <p className="text-white/40 max-w-xl mx-auto">A complete interview preparation platform built with real engineering practices.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass glass-hover rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-brand-600/15 border border-brand-500/20 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-brand-400" />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-14">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: '01', icon: Users, title: 'Create account', desc: 'Sign up free in seconds. No credit card required.' },
              { num: '02', icon: Code2, title: 'Pick your role', desc: 'Choose your target role, difficulty, and question count.' },
              { num: '03', icon: TrendingUp, title: 'Get AI feedback', desc: 'Complete the session and receive detailed AI evaluation instantly.' },
            ].map(({ num, icon: Icon, title, desc }) => (
              <div key={num} className="glass rounded-2xl p-6 text-center">
                <div className="text-brand-500/30 text-4xl font-black mb-4">{num}</div>
                <Icon size={24} className="text-brand-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-2">{title}</h3>
                <p className="text-white/40 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center glass rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/10 to-violet-600/10 rounded-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to level up?</h2>
            <p className="text-white/40 mb-8">Join thousands of developers preparing smarter with AI-powered mock interviews.</p>
            <Link to="/register" className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2">
              Start for free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="text-white/50 text-sm font-medium">InterviewAI</span>
          </div>
          <p className="text-white/20 text-xs">Built with React, Node.js & Google Gemini AI</p>
        </div>
      </footer>
    </div>
  );
}
