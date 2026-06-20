import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Calendar, Edit2, Save, X, Lock, Award, Mic, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', skills: user?.skills?.join(', ') || '' });
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.patch('/users/profile', {
        name: form.name,
        bio: form.bio,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      updateUser(data.user);
      setEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.patch('/users/password', { currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      toast.success('Password changed');
      setChangingPwd(false);
      setPwdForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Password change failed');
    } finally { setSaving(false); }
  };

  const scoreColor = user?.averageScore >= 7 ? 'text-green-400' : user?.averageScore >= 5 ? 'text-yellow-400' : 'text-white';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-white/40 text-sm mt-1">Manage your account settings</p>
      </div>

      {/* Avatar + Stats */}
      <div className="card">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-lg shadow-brand-600/20">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-white font-bold text-lg">{user?.name}</h2>
                <p className="text-white/40 text-sm">{user?.email}</p>
                {user?.bio && <p className="text-white/60 text-sm mt-2">{user.bio}</p>}
              </div>
              <button onClick={() => setEditing(p => !p)}
                className="btn-ghost flex items-center gap-1.5 text-sm flex-shrink-0">
                {editing ? <><X size={14} /> Cancel</> : <><Edit2 size={14} /> Edit</>}
              </button>
            </div>

            {user?.skills?.length > 0 && !editing && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {user.skills.map(s => (
                  <span key={s} className="tag bg-brand-600/10 text-brand-400 border border-brand-500/20 text-xs">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="mt-5 pt-5 border-t border-white/[0.06] space-y-4 animate-fade-in">
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Full name</label>
              <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Bio</label>
              <textarea className="input-field min-h-[80px]" placeholder="Tell us about yourself..."
                value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1.5">Skills (comma-separated)</label>
              <input className="input-field" placeholder="React, Node.js, Python..."
                value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15} />}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Interviews', value: user?.totalInterviews || 0, icon: Mic, color: 'text-brand-400' },
          { label: 'Avg Score', value: user?.averageScore ? `${user.averageScore}/10` : '—', icon: TrendingUp, color: scoreColor },
          { label: 'Best Score', value: user?.bestScore ? `${user.bestScore}/10` : '—', icon: Award, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card text-center">
            <Icon size={20} className={`${color} mx-auto mb-2`} />
            <div className="text-xl font-bold text-white">{value}</div>
            <div className="text-white/30 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Account info */}
      <div className="card space-y-4">
        <h3 className="text-white font-semibold">Account details</h3>
        {[
          { icon: User, label: 'Full name', value: user?.name },
          { icon: Mail, label: 'Email', value: user?.email },
          { icon: Calendar, label: 'Member since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
            <Icon size={16} className="text-white/30 flex-shrink-0" />
            <div>
              <p className="text-white/30 text-xs">{label}</p>
              <p className="text-white text-sm">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Change password */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2"><Lock size={16} className="text-white/40" /> Password</h3>
          <button onClick={() => setChangingPwd(p => !p)} className="btn-ghost text-sm">
            {changingPwd ? 'Cancel' : 'Change password'}
          </button>
        </div>
        {changingPwd && (
          <form onSubmit={handlePasswordChange} className="space-y-3 animate-fade-in">
            <input type="password" required className="input-field" placeholder="Current password"
              value={pwdForm.currentPassword} onChange={e => setPwdForm(p => ({ ...p, currentPassword: e.target.value }))} />
            <input type="password" required className="input-field" placeholder="New password (min. 6 chars)"
              value={pwdForm.newPassword} onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))} />
            <input type="password" required className="input-field" placeholder="Confirm new password"
              value={pwdForm.confirm} onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))} />
            <button type="submit" disabled={saving} className="btn-primary text-sm">
              {saving ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
