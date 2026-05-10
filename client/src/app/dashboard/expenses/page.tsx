'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/lib/api';
import { formatCurrency, formatDateTime, getInitials, CATEGORY_ICONS, PAYMENT_ICONS } from '@/lib/utils';
import { Search, Filter, Plus, Trash2, Edit, ChevronDown, X, Calendar, DollarSign } from 'lucide-react';

export default function ExpensesPage() {
  const { user, token } = useAuth();
  const { socket, emit } = useSocket();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ category: '', addedBy: '', paymentMethod: '', startDate: '', endDate: '' });
  const [page, setPage] = useState(1);

  const authOpts = { token };

  const fetchExpenses = useCallback(async () => {
    if (!user?.familyId) return;
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (search) params.set('search', search);
      if (filters.category) params.set('category', filters.category);
      if (filters.addedBy) params.set('addedBy', filters.addedBy);
      if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
      if (filters.startDate) params.set('startDate', filters.startDate);
      if (filters.endDate) params.set('endDate', filters.endDate);

      const res = await api(`/expenses?${params}`, authOpts);
      setExpenses(res.expenses);
      setPagination(res.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [user?.familyId, page, search, filters, token]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => fetchExpenses();
    socket.on('expense:added', refresh);
    socket.on('expense:deleted', refresh);
    return () => { socket.off('expense:added', refresh); socket.off('expense:deleted', refresh); };
  }, [socket, fetchExpenses]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await api(`/expenses/${id}`, { method: 'DELETE', ...authOpts });
      emit('expense:deleted', { id });
      fetchExpenses();
    } catch (err) { alert('Delete failed'); }
  };

  const clearFilters = () => { setFilters({ category: '', addedBy: '', paymentMethod: '', startDate: '', endDate: '' }); };

  return (
    <div className="space-y-6 slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Expenses</h1>
          <p className="text-[var(--text-secondary)]">{pagination.total || 0} total expenses</p>
        </div>
        <Link href="/dashboard/expenses/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25">
          <Plus className="w-4 h-4" /> Add Expense
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
          <input type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            placeholder="Search expenses..." />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-colors ${showFilters ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'}`}>
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] grid sm:grid-cols-2 lg:grid-cols-5 gap-3 slide-in">
          <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}
            className="px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none">
            <option value="">All Categories</option>
            {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.paymentMethod} onChange={e => setFilters({...filters, paymentMethod: e.target.value})}
            className="px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none">
            <option value="">All Payment Methods</option>
            {['Cash','UPI','Credit Card','Debit Card','Bank Transfer'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="date" value={filters.startDate} onChange={e => setFilters({...filters, startDate: e.target.value})}
            className="px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none" />
          <input type="date" value={filters.endDate} onChange={e => setFilters({...filters, endDate: e.target.value})}
            className="px-3 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none" />
          <button onClick={clearFilters} className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20">
            <X className="w-4 h-4" /> Clear
          </button>
        </div>
      )}

      {/* Expense List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-20 rounded-2xl bg-[var(--surface)] animate-pulse" />)}</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-2">No expenses found</h3>
          <p className="text-[var(--text-secondary)]">Add your first expense to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map(exp => (
            <div key={exp._id} className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex items-center gap-4 card-hover">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{background: `${exp.categoryColor}15`}}>
                {CATEGORY_ICONS[exp.category] || '📌'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--text)] truncate">{exp.productName}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-medium">{exp.category}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{PAYMENT_ICONS[exp.paymentMethod]} {exp.paymentMethod}</span>
                  <span className="text-xs text-[var(--text-secondary)]">· {formatDateTime(exp.date)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-bold text-[var(--text)]">{formatCurrency(exp.amount)}</p>
                <p className="text-xs text-[var(--text-secondary)]">{exp.addedBy?.displayName || 'Unknown'}</p>
              </div>
              <button onClick={() => handleDelete(exp._id)}
                className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-colors shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-10 h-10 rounded-xl text-sm font-medium transition-colors ${page === i + 1 ? 'gradient-primary text-white' : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text)]'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
