'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/lib/api';
import { formatCurrency, formatDate, getRelativeTime, getInitials, CATEGORY_ICONS } from '@/lib/utils';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Users, ArrowUpRight, ArrowDownRight, Lightbulb, Target } from 'lucide-react';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#f97316','#14b8a6','#a855f7'];

export default function DashboardPage() {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [summary, setSummary] = useState<any>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [budgetStatus, setBudgetStatus] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  const authOpts = { token };

  const fetchData = useCallback(async () => {
    if (!user?.familyId) { setLoading(false); return; }
    try {
      const [sumRes, insRes, budRes, trendRes] = await Promise.all([
        api(`/analytics/summary?period=${period}`, authOpts),
        api('/analytics/insights', authOpts),
        api('/budgets/status', authOpts),
        api('/analytics/trends', authOpts),
      ]);
      setSummary(sumRes);
      setInsights(insRes.insights || []);
      setBudgetStatus(budRes);
      setTrends(trendRes.trends || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally { setLoading(false); }
  }, [user?.familyId, period, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    const handler = () => { fetchData(); };
    socket.on('expense:added', handler);
    socket.on('expense:updated', handler);
    socket.on('expense:deleted', handler);
    return () => {
      socket.off('expense:added', handler);
      socket.off('expense:updated', handler);
      socket.off('expense:deleted', handler);
    };
  }, [socket, fetchData]);

  if (!user?.familyId) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
        <h2 className="text-2xl font-bold text-[var(--text)] mb-2">Join or Create a Family</h2>
        <p className="text-[var(--text-secondary)] mb-6">You need to be part of a family to see the dashboard</p>
        <a href="/dashboard/family" className="inline-flex px-6 py-3 rounded-xl gradient-primary text-white font-semibold">Go to Family</a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 rounded-2xl bg-[var(--surface)] animate-pulse" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[1,2].map(i => <div key={i} className="h-80 rounded-2xl bg-[var(--surface)] animate-pulse" />)}
        </div>
      </div>
    );
  }

  const categoryData = summary?.categoryBreakdown?.map((c: any, i: number) => ({
    name: c._id, value: c.total, color: COLORS[i % COLORS.length],
  })) || [];

  return (
    <div className="space-y-6 slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user.displayName.split(' ')[0]}! 👋</h1>
          <p className="text-[var(--text-secondary)]">Here&apos;s your household expense overview</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          {['daily','weekly','monthly','yearly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${period === p ? 'bg-indigo-500 text-white shadow' : 'text-[var(--text-secondary)] hover:text-[var(--text)]'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={<DollarSign />} label="Total Spending" value={formatCurrency(summary?.totalSpending || 0)}
          change={summary?.changePercent} gradient="from-indigo-500 to-purple-500" />
        <SummaryCard icon={<Calendar />} label="Today" value={formatCurrency(summary?.todaySpending || 0)}
          sub={`${summary?.expenseCount || 0} expenses`} gradient="from-emerald-500 to-teal-500" />
        <SummaryCard icon={<Target />} label="Budget Left" value={formatCurrency(budgetStatus?.remaining || 0)}
          sub={`${budgetStatus?.percentageUsed || 0}% used`} gradient="from-amber-500 to-orange-500"
          status={budgetStatus?.status} />
        <SummaryCard icon={<TrendingUp />} label="Daily Average" value={formatCurrency(summary?.dailyAverage || 0)}
          sub={`Avg per expense: ${formatCurrency(summary?.averageExpense || 0)}`} gradient="from-pink-500 to-rose-500" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Pie Chart */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text)] mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={100} innerRadius={60} paddingAngle={3} dataKey="value">
                    {categoryData.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 w-full md:w-48">
                {categoryData.slice(0, 6).map((c: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{background: c.color}} />
                    <span className="text-[var(--text-secondary)] truncate flex-1">{c.name}</span>
                    <span className="font-semibold text-[var(--text)]">{formatCurrency(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-center text-[var(--text-secondary)] py-12">No data yet</p>}
        </div>

        {/* Monthly Trends */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text)] mb-4">Spending Trends</h3>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{fontSize: 12, fill: 'var(--text-secondary)'}} />
                <YAxis tick={{fontSize: 12, fill: 'var(--text-secondary)'}} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(val: any) => formatCurrency(Number(val))} />
                <Bar dataKey="total" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-[var(--text-secondary)] py-12">No trend data</p>}
        </div>
      </div>

      {/* Smart Insights & Recent */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Insights */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> Smart Insights</h3>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <div key={i} className="p-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)]">
                  <p className="text-sm font-medium text-[var(--text)]">{ins.message}</p>
                  {ins.detail && <p className="text-xs text-[var(--text-secondary)] mt-1">{ins.detail}</p>}
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-[var(--text-secondary)]">Add more expenses to see insights</p>}
        </div>

        {/* Member breakdown */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-indigo-500" /> By Member</h3>
          <div className="space-y-3">
            {(summary?.memberBreakdown || []).map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{background: COLORS[i % COLORS.length]}}>
                  {getInitials(m.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate">{m.name}</p>
                  <div className="w-full h-1.5 rounded-full bg-[var(--border)] mt-1">
                    <div className="h-full rounded-full" style={{
                      width: `${summary?.totalSpending > 0 ? (m.total / summary.totalSpending * 100) : 0}%`,
                      background: COLORS[i % COLORS.length],
                    }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-[var(--text)]">{formatCurrency(m.total)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent expenses */}
        <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text)] mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {(summary?.recentExpenses || []).slice(0, 6).map((exp: any) => (
              <div key={exp._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 bg-[var(--surface-hover)]">
                  {CATEGORY_ICONS[exp.category] || '📌'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text)] truncate">{exp.productName}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{exp.addedBy?.displayName} · {getRelativeTime(exp.date)}</p>
                </div>
                <span className="text-sm font-bold text-[var(--text)]">{formatCurrency(exp.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, change, sub, gradient, status }: any) {
  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
            change >= 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'
          }`}>
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
        {status && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            status === 'good' ? 'bg-emerald-500/10 text-emerald-500' :
            status === 'warning' ? 'bg-amber-500/10 text-amber-500' :
            'bg-red-500/10 text-red-500'
          }`}>{status}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-[var(--text)] count-up">{value}</p>
      <p className="text-sm text-[var(--text-secondary)] mt-0.5">{sub || label}</p>
    </div>
  );
}
