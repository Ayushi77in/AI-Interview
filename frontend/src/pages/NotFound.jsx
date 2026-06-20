import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-8xl font-black text-white/5 mb-4">404</div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto mb-5">
          <Zap size={20} className="text-white" />
        </div>
        <h1 className="text-white font-bold text-2xl mb-2">Page not found</h1>
        <p className="text-white/40 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
