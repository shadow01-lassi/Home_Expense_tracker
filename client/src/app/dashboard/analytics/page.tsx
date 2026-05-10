'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { formatCurrency, CATEGORY_ICONS } from '@/lib/utils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, BarChart3, Lightbulb } from 'lucide-react';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316','#14b8a6','#a855f7','#22c55e','#3b82f6'];

export default function AnalyticsPage() {
  const { user, token, devUserId } = useAuth();
  const [period, setPeriod] = useState('monthly');
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const authOpts = { token, devUserId };

  const fetchData = useCallback(async () => {
    if (!user?.familyId) return;
    try {
      const [s, t, i] = await Promise.all([
        api(`/analytics/summary?period=${period}`, authOpts),
        api('/analytics/trends', authOpts),
        api('/analytics/insights', authOpts),
      ]);
      setSummary(s); setTrends(t.trends || []); setInsights(i.insights || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user?.familyId, period, token, devUserId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const catData = summary?.categoryBreakdown?.map((c: any, i: number) => ({
    name: c._id, value: c.total, count: c.count, color: COLORS[i % COLORS.length],
  })) || [];

  if (loading) return <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-[var(--surface)] animate-pulse" />)}</div>;

  return (
    <div className="space-y-6 slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Analytics</h1>
          <p className="text-[var(--text-secondary)]">Deep dive into your spending patterns</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          {['daily','weekly','monthly','yearly'].map(p => (
            <button key={p} onClick={() => { setPeriod(p); setLoading(true); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${period === p ? 'bg-indigo-500 text-white shadow' : 'text-[var(--text-secondary)]'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Spent', value: formatCurrency(summary?.totalSpending || 0), sub: `${summary?.expenseCount || 0} expenses` },
          { label: 'Daily Average', value: formatCurrency(summary?.dailyAverage || 0), sub: 'Per day' },
          { label: 'Avg Per Expense', value: formatCurrency(summary?.averageExpense || 0), sub: 'Average' },
          { label: 'Change', value: `${summary?.changePercent >= 0 ? '+' : ''}${summary?.changePercent || 0}%`, sub: 'vs last period' },
        ].map((s, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
            <p className="text-2xl font-bold text-[var(--text)] mt-1">{s.value}</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-500" /> Category Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart><Pie data={catData} cx="50%" cy="50%" outerRadius={120} innerRadius={70} paddingAngle={2} dataKey="value">
              {catData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
            </Pie><Tooltip formatter={(v: number) => formatCurrency(v)} /></PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {catData.slice(0, 8).map((c: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full shrink-0" style={{background: c.color}} />
                <span className="truncate text-[var(--text-secondary)]">{CATEGORY_ICONS[c.name] || '📌'} {c.name}</span>
                <span className="font-semibold text-[var(--text)] ml-auto">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" /> Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends}>
              <defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="100%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{fontSize: 12, fill: 'var(--text-secondary)'}} />
              <YAxis tick={{fontSize: 12, fill: 'var(--text-secondary)'}} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" fill="url(#grad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="text-lg font-bold text-[var(--text)] mb-4">Category Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={catData.slice(0, 10)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis type="number" tick={{fontSize: 12, fill: 'var(--text-secondary)'}} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
            <YAxis type="category" dataKey="name" width={120} tick={{fontSize: 11, fill: 'var(--text-secondary)'}} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="value" radius={[0,6,6,0]}>
              {catData.slice(0, 10).map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> Smart Insights</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {insights.map((ins, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)]">
              <p className="text-sm font-medium text-[var(--text)]">{ins.message}</p>
              {ins.detail && <p className="text-xs text-[var(--text-secondary)] mt-2">{ins.detail}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
