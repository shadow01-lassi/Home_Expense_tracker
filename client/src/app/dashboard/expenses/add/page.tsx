'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/lib/api';
import { CATEGORY_ICONS, PAYMENT_METHODS } from '@/lib/utils';
import { ArrowLeft, Save, Camera, X } from 'lucide-react';

export default function AddExpensePage() {
  const { user, token } = useAuth();
  const { emit } = useSocket();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [isSplit, setIsSplit] = useState(false);
  const [paidBy, setPaidBy] = useState('');
  const [splitWith, setSplitWith] = useState<string[]>([]);
  const [form, setForm] = useState({
    amount: '', category: 'Groceries', productName: '', notes: '',
    date: new Date().toISOString().split('T')[0], paymentMethod: 'Cash',
    isRecurring: false, recurringFrequency: '',
  });

  const authOpts = { token };

  useEffect(() => {
    const fetchCats = async () => {
      if (!user?.familyId) return;
      try {
        const res = await api('/categories', authOpts);
        setCategories(res.categories || []);
      } catch (err) { console.error(err); }
    };
    fetchCats();
  }, [user?.familyId]);

  useEffect(() => {
    const fetchFamily = async () => {
      if (!user?.familyId) return;
      try {
        const res = await api('/family', authOpts);
        const activeMembers = res.family?.members?.filter((m: any) => m.status === 'active')?.map((m: any) => m.user) || [];
        setFamilyMembers(activeMembers);
        if (user) {
          setPaidBy(user._id);
          setSplitWith(activeMembers.map((m: any) => m._id));
        }
      } catch (err) { console.error('Failed to fetch family members:', err); }
    };
    fetchFamily();
  }, [user, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.productName) return;
    setLoading(true);
    try {
      const cat = categories.find(c => c.name === form.category);
      
      const body: any = {
        ...form,
        amount: Number(form.amount),
        categoryColor: cat?.color || '#6366f1',
        categoryIcon: cat?.icon || 'receipt',
      };

      if (isSplit && splitWith.length > 0) {
        const shareAmount = Number((Number(form.amount) / splitWith.length).toFixed(2));
        body.isSplit = true;
        body.splitDetails = {
          paidBy: paidBy || user?._id,
          splitType: 'equal',
          splitWith: splitWith.map(userId => ({
            user: userId,
            share: shareAmount,
          })),
        };
      }

      const res = await api('/expenses', {
        method: 'POST', ...authOpts,
        body,
      });
      emit('expense:added', res.expense);
      router.push('/dashboard/expenses');
    } catch (err: any) { alert(err.message || 'Failed to add expense'); }
    finally { setLoading(false); }
  };

  const update = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-2xl mx-auto slide-in">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="p-6 md:p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
        <h1 className="text-2xl font-bold text-[var(--text)] mb-1">Add New Expense</h1>
        <p className="text-[var(--text-secondary)] mb-8">Record a new household expense</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Amount (₹) *</label>
            <input type="number" value={form.amount} onChange={e => update('amount', e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-2xl font-bold text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="0.00" required min="0" step="0.01" />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Category *</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto">
              {(categories.length > 0 ? categories : Object.keys(CATEGORY_ICONS).map(name => ({ name }))).map((cat: any) => (
                <button key={cat.name} type="button" onClick={() => update('category', cat.name)}
                  className={`p-2.5 rounded-xl text-center text-xs font-medium transition-all border ${
                    form.category === cat.name ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 ring-2 ring-indigo-500/20' : 'border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                  }`}>
                  <div className="text-lg mb-0.5">{CATEGORY_ICONS[cat.name] || '📌'}</div>
                  <span className="truncate block">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Product / Service Name *</label>
            <input type="text" value={form.productName} onChange={e => update('productName', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="What did you spend on?" required />
          </div>

          {/* Date & Payment Method */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Date</label>
              <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">Payment Method</label>
              <select value={form.paymentMethod} onChange={e => update('paymentMethod', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-indigo-500">
                {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
              placeholder="Add any details..." />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">Receipt Photo (optional)</label>
            <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center hover:border-indigo-500/50 transition-colors cursor-pointer">
              <Camera className="w-8 h-8 mx-auto text-[var(--text-secondary)] mb-2" />
              <p className="text-sm text-[var(--text-secondary)]">Click to upload or drag & drop</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>

          {/* Split Expense Section */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-hover)] space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isSplit} onChange={e => setIsSplit(e.target.checked)}
                className="w-5 h-5 rounded border-[var(--border)] text-indigo-500 focus:ring-indigo-500" />
              <div className="flex-1">
                <span className="text-sm font-semibold text-[var(--text)] block">📊 Split this expense with family/friends</span>
                <span className="text-xs text-[var(--text-secondary)]">Split cost equally among selected members</span>
              </div>
            </label>

            {isSplit && (
              <div className="pt-3 border-t border-[var(--border)] space-y-4 slide-in">
                {/* Paid By */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Who Paid?</label>
                  <select value={paidBy} onChange={e => setPaidBy(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none">
                    {familyMembers.map(m => (
                      <option key={m._id} value={m._id}>{m.displayName} {m._id === user?._id ? '(You)' : ''}</option>
                    ))}
                  </select>
                </div>

                {/* Split With Checklist */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Split with whom?</label>
                  <div className="space-y-2">
                    {familyMembers.map(m => {
                      const checked = splitWith.includes(m._id);
                      return (
                        <label key={m._id} className="flex items-center gap-3 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface)] transition-all cursor-pointer">
                          <input type="checkbox" checked={checked}
                            onChange={() => {
                              if (checked) {
                                setSplitWith(prev => prev.filter(id => id !== m._id));
                              } else {
                                setSplitWith(prev => [...prev, m._id]);
                              }
                            }}
                            className="w-4 h-4 rounded border-[var(--border)] text-indigo-500 focus:ring-indigo-500" />
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center text-xs font-bold">
                              {m.displayName ? m.displayName.slice(0, 2).toUpperCase() : 'U'}
                            </div>
                            <span className="text-sm font-medium text-[var(--text)]">{m.displayName} {m._id === user?._id ? '(You)' : ''}</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Split Info Banner */}
                {splitWith.length > 0 && form.amount && (
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-indigo-500">
                    <span className="text-sm font-medium">Split breakdown:</span>
                    <span className="text-base font-bold">₹{(Number(form.amount) / splitWith.length).toFixed(2)} / person</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recurring */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isRecurring} onChange={e => update('isRecurring', e.target.checked)}
              className="w-5 h-5 rounded border-[var(--border)] text-indigo-500 focus:ring-indigo-500" />
            <span className="text-sm text-[var(--text)]">This is a recurring expense</span>
          </label>

          {/* Added By */}
          <div className="p-4 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)]">
            <p className="text-sm text-[var(--text-secondary)]">Adding as:</p>
            <p className="text-sm font-semibold text-[var(--text)]">{user?.displayName}</p>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl gradient-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-lg shadow-indigo-500/25 text-lg">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Save Expense</>}
          </button>
        </form>
      </div>
    </div>
  );
}
