'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import api from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { User, Sun, Moon, Monitor, Bell, Globe, Save, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, token, devUserId, refreshUser, signOutUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currency, setCurrency] = useState(user?.currency || '₹');
  const [saving, setSaving] = useState(false);
  const authOpts = { token, devUserId };

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api('/auth/profile', { method: 'PUT', ...authOpts, body: { displayName: name, phone, currency } });
      await refreshUser();
      alert('Profile updated!');
    } catch (err) { alert('Save failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 slide-in">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Settings</h1>

      {/* Profile */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2"><User className="w-5 h-5 text-indigo-500" /> Profile</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
            {user?.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(user?.displayName || 'U')}
          </div>
          <div>
            <p className="font-semibold text-[var(--text)]">{user?.displayName}</p>
            <p className="text-sm text-[var(--text-secondary)]">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[var(--text)]">Display Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text)]">Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-[var(--text)]">Currency</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)}
              className="w-full mt-1 px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-indigo-500">
              <option value="₹">₹ Indian Rupee</option>
              <option value="$">$ US Dollar</option>
              <option value="€">€ Euro</option>
              <option value="£">£ British Pound</option>
            </select>
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm disabled:opacity-50">
            {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Theme */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="text-lg font-bold text-[var(--text)] mb-4">Appearance</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'light' as const, icon: Sun, label: 'Light' },
            { value: 'dark' as const, icon: Moon, label: 'Dark' },
            { value: 'system' as const, icon: Monitor, label: 'System' },
          ].map(t => (
            <button key={t.value} onClick={() => setTheme(t.value)}
              className={`p-4 rounded-xl border text-center transition-all ${theme === t.value ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'}`}>
              <t.icon className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-amber-500" /> Notifications</h3>
        <div className="space-y-3">
          {[
            { label: 'Daily expense reminder', key: 'dailyReminder' },
            { label: 'Budget exceeded alerts', key: 'budgetAlerts' },
            { label: 'Weekly summary', key: 'weeklyReport' },
            { label: 'New expense notifications', key: 'expenseNotifs' },
          ].map(n => (
            <label key={n.key} className="flex items-center justify-between p-3 rounded-xl hover:bg-[var(--surface-hover)] cursor-pointer">
              <span className="text-sm text-[var(--text)]">{n.label}</span>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-[var(--border)] text-indigo-500 focus:ring-indigo-500" />
            </label>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
        <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">These actions cannot be undone</p>
        <button onClick={signOutUser}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20">
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
      </div>
    </div>
  );
}
