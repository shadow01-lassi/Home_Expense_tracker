'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { formatCurrency, CATEGORY_ICONS } from '@/lib/utils';
import { Wallet, AlertTriangle, CheckCircle, Save, Plus, X } from 'lucide-react';

export default function BudgetsPage() {
  const { user, token } = useAuth();
  const [budget, setBudget] = useState<any>(null);
  const [spending, setSpending] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);
  const [totalBudget, setTotalBudget] = useState('');
  const [catBudgets, setCatBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const authOpts = { token };

  useEffect(() => {
    const fetch = async () => {
      if (!user?.familyId) return;
      try {
        const [bRes, sRes] = await Promise.all([
          api('/budgets', authOpts),
          api('/budgets/status', authOpts),
        ]);
        setBudget(bRes.budget);
        setSpending(bRes.spending);
        setStatus(sRes);
        if (bRes.budget) {
          setTotalBudget(bRes.budget.totalBudget.toString());
          setCatBudgets(bRes.budget.categoryBudgets || []);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user?.familyId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api('/budgets', {
        method: 'POST', ...authOpts,
        body: { totalBudget: Number(totalBudget), categoryBudgets: catBudgets },
      });
      setEditMode(false);
      // Refresh
      const [bRes, sRes] = await Promise.all([api('/budgets', authOpts), api('/budgets/status', authOpts)]);
      setBudget(bRes.budget); setSpending(bRes.spending); setStatus(sRes);
    } catch (err) { alert('Save failed'); }
    finally { setSaving(false); }
  };

  const addCatBudget = () => {
    setCatBudgets([...catBudgets, { category: 'Groceries', amount: 5000, spent: 0 }]);
  };

  const removeCatBudget = (i: number) => {
    setCatBudgets(catBudgets.filter((_, idx) => idx !== i));
  };

  if (loading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="h-40 rounded-2xl bg-[var(--surface)] animate-pulse" />)}</div>;

  const pct = status?.percentageUsed || 0;
  const barColor = pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#10b981';

  return (
    <div className="space-y-6 slide-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Budget Management</h1>
          <p className="text-[var(--text-secondary)]">Set and track your monthly budgets</p>
        </div>
        <button onClick={() => setEditMode(!editMode)}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${editMode ? 'bg-red-500/10 text-red-500' : 'gradient-primary text-white shadow-lg shadow-indigo-500/25'}`}>
          {editMode ? 'Cancel' : 'Edit Budget'}
        </button>
      </div>

      {/* Budget Overview */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--text)]">Monthly Budget</h3>
            <p className="text-sm text-[var(--text-secondary)]">{new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {editMode ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[var(--text)]">Total Monthly Budget (₹)</label>
              <input type="number" value={totalBudget} onChange={e => setTotalBudget(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xl font-bold text-[var(--text)] focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2 mb-3">
              <span className="text-4xl font-bold text-[var(--text)]">{formatCurrency(status?.spent || 0)}</span>
              <span className="text-[var(--text-secondary)] pb-1">/ {formatCurrency(status?.budget || 0)}</span>
            </div>
            <div className="w-full h-4 rounded-full bg-[var(--border)] overflow-hidden mb-3">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-secondary)]">{pct}% used</span>
              <span className="font-semibold" style={{color: barColor}}>
                {pct >= 100 ? '⚠️ Over budget!' : `₹${(status?.remaining || 0).toLocaleString()} remaining`}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--surface-hover)]">
                <p className="text-xs text-[var(--text-secondary)]">Days Remaining</p>
                <p className="text-2xl font-bold text-[var(--text)]">{status?.daysRemaining || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--surface-hover)]">
                <p className="text-xs text-[var(--text-secondary)]">Daily Budget Left</p>
                <p className="text-2xl font-bold text-[var(--text)]">{formatCurrency(status?.dailyBudget || 0)}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Category Budgets */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[var(--text)]">Category Budgets</h3>
          {editMode && (
            <button onClick={addCatBudget} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 text-sm font-medium">
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>

        <div className="space-y-4">
          {catBudgets.map((cb, i) => {
            const catSpend = spending?.byCategory?.find((s: any) => s._id === cb.category);
            const spent = catSpend?.total || cb.spent || 0;
            const cpct = cb.amount > 0 ? Math.round((spent / cb.amount) * 100) : 0;
            const ccolor = cpct >= 100 ? '#ef4444' : cpct >= 80 ? '#f59e0b' : '#10b981';

            return (
              <div key={i} className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)]">
                {editMode ? (
                  <div className="flex items-center gap-3">
                    <select value={cb.category} onChange={e => { const n = [...catBudgets]; n[i].category = e.target.value; setCatBudgets(n); }}
                      className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)]">
                      {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="number" value={cb.amount} onChange={e => { const n = [...catBudgets]; n[i].amount = Number(e.target.value); setCatBudgets(n); }}
                      className="w-28 px-3 py-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-sm font-semibold text-[var(--text)]" placeholder="Amount" />
                    <button onClick={() => removeCatBudget(i)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[var(--text)]">{CATEGORY_ICONS[cb.category] || '📌'} {cb.category}</span>
                      <span className="text-sm font-bold text-[var(--text)]">{formatCurrency(spent)} / {formatCurrency(cb.amount)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[var(--border)]">
                      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(cpct, 100)}%`, background: ccolor }} />
                    </div>
                    <p className="text-xs mt-1" style={{color: ccolor}}>{cpct}% used</p>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {editMode && (
          <button onClick={handleSave} disabled={saving}
            className="w-full mt-6 py-3 rounded-xl gradient-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Budget</>}
          </button>
        )}
      </div>

      {/* Alerts */}
      {status?.alerts?.length > 0 && (
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Budget Alerts</h3>
          <div className="space-y-2">
            {status.alerts.map((a: any, i: number) => (
              <div key={i} className={`p-3 rounded-xl text-sm ${a.type === 'exceeded' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-600'}`}>
                {a.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
