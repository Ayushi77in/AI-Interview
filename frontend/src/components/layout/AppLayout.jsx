import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Mic, BarChart3, Clock, User, FileText,
  LogOut, Menu, X, Zap, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/interview/setup', icon: Mic,           label: 'New Interview' },
  { to: '/analytics',     icon: BarChart3,        label: 'Analytics' },
  { to: '/history',       icon: Clock,            label: 'History' },
  { to: '/resume',        icon: FileText,          label: 'Resume AI' },
  { to: '/profile',       icon: User,             label: 'Profile' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center shadow-lg shadow-brand-600/30">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg tracking-tight">InterviewAI</span>
            <p className="text-white/30 text-xs">Practice · Improve · Succeed</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-sm font-medium ${
                isActive
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-brand-400' : 'text-white/40 group-hover:text-white/70'} />
                <span className="flex-1">{label}</span>
                {label === 'New Interview' && (
                  <span className="text-xs bg-brand-600 text-white px-1.5 py-0.5 rounded-md">New</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-4">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-white/30 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium">
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-surface-800 border-r border-white/[0.06] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-surface-800 border-r border-white/[0.06] flex flex-col">
            <button onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-2 rounded-xl hover:bg-white/[0.05]">
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-surface-800 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="text-white/60 hover:text-white p-2 rounded-xl hover:bg-white/[0.05]">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-white font-bold text-base">InterviewAI</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
