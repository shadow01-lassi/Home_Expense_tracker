'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { getInitials, formatDateTime } from '@/lib/utils';
import { Shield, Users, Activity, Trash2 } from 'lucide-react';

export default function AdminPage() {
  const { user, token, devUserId } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [tab, setTab] = useState<'users' | 'logs'>('users');
  const [loading, setLoading] = useState(true);
  const authOpts = { token, devUserId };

  useEffect(() => {
    const fetch = async () => {
      if (!user?.familyId) return;
      try {
        const [uRes, lRes] = await Promise.all([
          api('/admin/users', authOpts),
          api('/admin/logs?limit=30', authOpts),
        ]);
        setMembers(uRes.members || []);
        setLogs(lRes.logs || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user?.familyId]);

  const removeMember = async (userId: string) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api(`/admin/users/${userId}`, { method: 'DELETE', ...authOpts });
      setMembers(members.filter(m => m.user?._id !== userId));
    } catch (err: any) { alert(err.message); }
  };

  const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899'];

  return (
    <div className="space-y-6 slide-in">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Admin Panel</h1>
          <p className="text-[var(--text-secondary)]">Manage your family workspace</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] w-fit">
        <button onClick={() => setTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'users' ? 'bg-indigo-500 text-white' : 'text-[var(--text-secondary)]'}`}>
          <Users className="w-4 h-4" /> Members
        </button>
        <button onClick={() => setTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'logs' ? 'bg-indigo-500 text-white' : 'text-[var(--text-secondary)]'}`}>
          <Activity className="w-4 h-4" /> Activity Logs
        </button>
      </div>

      {loading ? <div className="h-64 rounded-2xl bg-[var(--surface)] animate-pulse" /> : tab === 'users' ? (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="space-y-3">
            {members.map((m, i) => (
              <div key={m.user?._id || i} className="flex items-center gap-3 p-4 rounded-xl bg-[var(--surface-hover)]">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{background: COLORS[i % COLORS.length]}}>
                  {getInitials(m.user?.displayName || 'U')}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--text)]">{m.user?.displayName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{m.user?.email} · {m.role} · {m.status}</p>
                </div>
                {m.role !== 'admin' && m.status === 'active' && (
                  <button onClick={() => removeMember(m.user?._id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="space-y-3">
            {logs.map((log: any) => (
              <div key={log._id} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--surface-hover)]">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-[var(--text)]">{log.details}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {log.userId?.displayName} · {formatDateTime(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {logs.length === 0 && <p className="text-center py-8 text-[var(--text-secondary)]">No activity logs yet</p>}
          </div>
        </div>
      )}
    </div>
  );
}
