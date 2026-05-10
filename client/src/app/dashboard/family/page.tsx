'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { Users, Copy, UserPlus, Crown, LogOut, RefreshCw, Check, Shield } from 'lucide-react';

export default function FamilyPage() {
  const { user, token, refreshUser } = useAuth();
  const [family, setFamily] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const authOpts = { token };

  useEffect(() => {
    const fetch = async () => {
      if (!user?.familyId) { setLoading(false); return; }
      try {
        const res = await api('/family', authOpts);
        setFamily(res.family);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user?.familyId]);

  const createFamily = async () => {
    if (!familyName.trim()) return;
    setActionLoading(true);
    try {
      const res = await api('/family/create', { method: 'POST', ...authOpts, body: { name: familyName, monthlyBudget: 50000 } });
      setFamily(res.family);
      setShowCreate(false);
      await refreshUser();
    } catch (err: any) { alert(err.message); }
    finally { setActionLoading(false); }
  };

  const joinFamily = async () => {
    if (!inviteCode.trim()) return;
    setActionLoading(true);
    try {
      const res = await api('/family/join', { method: 'POST', ...authOpts, body: { inviteCode } });
      setFamily(res.family);
      setShowJoin(false);
      await refreshUser();
    } catch (err: any) { alert(err.message); }
    finally { setActionLoading(false); }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(family?.inviteCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="h-64 rounded-2xl bg-[var(--surface)] animate-pulse" />;

  if (!user?.familyId && !family) {
    return (
      <div className="max-w-lg mx-auto mt-10 space-y-6 slide-in">
        <div className="text-center">
          <div className="text-7xl mb-4">👨‍👩‍👧‍👦</div>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Family Workspace</h1>
          <p className="text-[var(--text-secondary)]">Create a new family or join an existing one</p>
        </div>

        <div className="grid gap-4">
          {!showCreate && !showJoin && (
            <>
              <button onClick={() => setShowCreate(true)}
                className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-left card-hover">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-3"><Users className="w-6 h-6 text-white" /></div>
                <h3 className="text-lg font-bold text-[var(--text)]">Create Family</h3>
                <p className="text-sm text-[var(--text-secondary)]">Start a new family workspace and invite members</p>
              </button>
              <button onClick={() => setShowJoin(true)}
                className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] text-left card-hover">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-3"><UserPlus className="w-6 h-6 text-white" /></div>
                <h3 className="text-lg font-bold text-[var(--text)]">Join Family</h3>
                <p className="text-sm text-[var(--text-secondary)]">Enter an invite code to join an existing family</p>
              </button>
            </>
          )}

          {showCreate && (
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] slide-in">
              <h3 className="text-lg font-bold text-[var(--text)] mb-4">Create Family</h3>
              <input type="text" value={familyName} onChange={e => setFamilyName(e.target.value)} placeholder="Family name (e.g., Sharma Family)"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] mb-4 focus:outline-none focus:border-indigo-500" />
              <div className="flex gap-2">
                <button onClick={createFamily} disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50">
                  {actionLoading ? 'Creating...' : 'Create'}
                </button>
                <button onClick={() => setShowCreate(false)} className="px-4 py-3 rounded-xl bg-[var(--surface-hover)] text-[var(--text-secondary)]">Cancel</button>
              </div>
            </div>
          )}

          {showJoin && (
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] slide-in">
              <h3 className="text-lg font-bold text-[var(--text)] mb-4">Join Family</h3>
              <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value.toUpperCase())} placeholder="Enter invite code"
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] text-center text-xl tracking-widest mb-4 focus:outline-none focus:border-indigo-500" maxLength={8} />
              <div className="flex gap-2">
                <button onClick={joinFamily} disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold disabled:opacity-50">
                  {actionLoading ? 'Joining...' : 'Join'}
                </button>
                <button onClick={() => setShowJoin(false)} className="px-4 py-3 rounded-xl bg-[var(--surface-hover)] text-[var(--text-secondary)]">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316'];

  return (
    <div className="space-y-6 slide-in">
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Family</h1>

      {/* Family Info */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center"><Users className="w-7 h-7 text-white" /></div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text)]">{family?.name}</h2>
              <p className="text-sm text-[var(--text-secondary)]">{family?.members?.filter((m: any) => m.status === 'active').length} active members</p>
            </div>
          </div>
        </div>

        {/* Invite Code */}
        <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-secondary)] mb-1">Invite Code</p>
            <p className="text-2xl font-bold tracking-widest text-indigo-500">{family?.inviteCode}</p>
          </div>
          <button onClick={copyCode}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-500 text-sm font-medium hover:bg-indigo-500/20 transition-colors">
            {copied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="text-lg font-bold text-[var(--text)] mb-4">Members</h3>
        <div className="space-y-3">
          {family?.members?.filter((m: any) => m.status === 'active').map((member: any, i: number) => (
            <div key={member.user?._id || i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-colors">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{background: COLORS[i % COLORS.length]}}>
                {member.user?.photoURL ? <img src={member.user.photoURL} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(member.user?.displayName || 'U')}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text)]">{member.user?.displayName}</p>
                <p className="text-xs text-[var(--text-secondary)]">{member.user?.email}</p>
              </div>
              {member.role === 'admin' && (
                <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-medium">
                  <Crown className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
