'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import {
  Coins, CheckCircle, PlusCircle, History, ArrowUpRight,
  ArrowDownLeft, Check, X, Users, RefreshCw, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SplitsPage() {
  const { user, token } = useAuth();
  const { emit, socket } = useSocket();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  
  // Settle Up Modal States
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleWithUser, setSettleWithUser] = useState<any>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');

  const authOpts = { token };

  const fetchData = async () => {
    if (!user?.familyId) return;
    setLoading(true);
    try {
      const [expRes, famRes] = await Promise.all([
        api('/expenses?limit=1000', authOpts),
        api('/family', authOpts),
      ]);
      setExpenses(expRes.expenses || []);
      const activeMembers = famRes.family?.members?.filter((m: any) => m.status === 'active')?.map((m: any) => m.user) || [];
      setFamilyMembers(activeMembers);
    } catch (err) {
      console.error('Failed to fetch split data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.familyId]);

  // Listen to live socket events for updates
  useEffect(() => {
    if (!socket) return;
    const handleExpenseAdded = () => fetchData();
    const handleExpenseUpdated = () => fetchData();
    const handleExpenseDeleted = () => fetchData();

    socket.on('expense:added', handleExpenseAdded);
    socket.on('expense:updated', handleExpenseUpdated);
    socket.on('expense:deleted', handleExpenseDeleted);

    return () => {
      socket.off('expense:added', handleExpenseAdded);
      socket.off('expense:updated', handleExpenseUpdated);
      socket.off('expense:deleted', handleExpenseDeleted);
    };
  }, [socket]);

  // Calculate Balances
  const balances: { [userId: string]: number } = {};
  
  // Initialize balances
  familyMembers.forEach(member => {
    if (member._id !== user?._id) {
      balances[member._id] = 0;
    }
  });

  // Filter split expenses
  const splitExpenses = expenses.filter(e => e.isSplit && e.splitDetails);

  splitExpenses.forEach(expense => {
    const paidBy = expense.splitDetails.paidBy;
    const paidById = typeof paidBy === 'object' ? paidBy?._id : paidBy;
    if (!paidById) return;

    expense.splitDetails.splitWith.forEach((item: any) => {
      const participant = item.user;
      const participantId = typeof participant === 'object' ? participant?._id : participant;
      if (!participantId) return;

      if (paidById !== participantId) {
        if (paidById === user?._id) {
          // You paid, other participant owes you their share
          balances[participantId] = (balances[participantId] || 0) + item.share;
        } else if (participantId === user?._id) {
          // Other participant paid, you owe them your share
          balances[paidById] = (balances[paidById] || 0) - item.share;
        }
      }
    });
  });

  // Aggregate stats
  let totalYouAreOwed = 0;
  let totalYouOwe = 0;

  Object.entries(balances).forEach(([_, val]) => {
    if (val > 0) totalYouAreOwed += val;
    if (val < 0) totalYouOwe += Math.abs(val);
  });

  const netBalance = totalYouAreOwed - totalYouOwe;

  // Handle Recording Settle Up
  const handleSettleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleWithUser || !settleAmount || Number(settleAmount) <= 0) return;

    setSubmitting(true);
    try {
      const amountNum = Number(settleAmount);
      const currentBalance = balances[settleWithUser._id] || 0;
      
      // Determine direction of payment:
      // If currentBalance < 0: You owe them, so You pay them.
      // If currentBalance > 0: They owe you, so They pay you (so we record them as payer, you as recipient).
      const payerId = currentBalance < 0 ? user?._id : settleWithUser._id;
      const recipientId = currentBalance < 0 ? settleWithUser._id : user?._id;

      const res = await api('/expenses', {
        method: 'POST', ...authOpts,
        body: {
          amount: amountNum,
          category: 'Settlement',
          categoryColor: '#10b981',
          categoryIcon: 'handshake',
          productName: `Settled Balance: ${currentBalance < 0 ? 'You' : settleWithUser.displayName} paid ${currentBalance < 0 ? settleWithUser.displayName : 'You'}`,
          notes: settleNote || `Direct Split Settlement`,
          date: new Date(),
          isSplit: true,
          splitDetails: {
            paidBy: payerId,
            splitType: 'settlement',
            splitWith: [{
              user: recipientId,
              share: amountNum
            }]
          }
        }
      });

      emit('expense:added', res.expense);
      setShowSettleModal(false);
      setSettleWithUser(null);
      setSettleAmount('');
      setSettleNote('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Settlement failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openSettleModalFor = (member: any, val: number) => {
    setSettleWithUser(member);
    setSettleAmount(Math.abs(val).toString());
    setSettleNote(`Settled up outstanding balance`);
    setShowSettleModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 rounded-2xl bg-[var(--surface)] animate-pulse" />
        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-[var(--surface)] animate-pulse" />
          <div className="h-64 rounded-2xl bg-[var(--surface)] animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 slide-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Group Splits 📊</h1>
          <p className="text-[var(--text-secondary)]">Track splits and settle up with family & friends</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/expenses/add')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold transition-all hover:opacity-95 shadow-lg shadow-indigo-500/25"
        >
          <PlusCircle className="w-5 h-5" />
          Add Split Expense
        </button>
      </div>

      {/* Balance Summary Banner */}
      <div className={`p-6 md:p-8 rounded-3xl border transition-all ${
        netBalance > 0
          ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-500'
          : netBalance < 0
          ? 'bg-gradient-to-br from-rose-500/10 to-amber-500/5 border-rose-500/20 text-rose-500'
          : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-wide uppercase opacity-80">Overall Net Balance</p>
            <h2 className="text-4xl font-extrabold tracking-tight">
              {netBalance > 0 ? '+' : netBalance < 0 ? '-' : ''}
              {formatCurrency(Math.abs(netBalance))}
            </h2>
            <p className="text-xs opacity-75 mt-1">
              {netBalance > 0
                ? '🟢 Excellent! You are owed money overall.'
                : netBalance < 0
                ? '🔴 Take action: Settle up your outstanding debts.'
                : '⚪ No outstanding debts or credits inside your group.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-8 border-t md:border-t-0 md:border-l border-[var(--border)] pt-4 md:pt-0 md:pl-8">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase opacity-75 text-emerald-500 flex items-center gap-1">
                <ArrowDownLeft className="w-4 h-4" /> You Are Owed
              </span>
              <p className="text-xl font-bold text-[var(--text)]">{formatCurrency(totalYouAreOwed)}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase opacity-75 text-rose-500 flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4" /> You Owe
              </span>
              <p className="text-xl font-bold text-[var(--text)]">{formatCurrency(totalYouOwe)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Active Ledger / Who Owes Whom */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl shadow-black/5">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-bold text-[var(--text)]">Family & Room Balances</h3>
            </div>

            <div className="space-y-4">
              {Object.keys(balances).length === 0 ? (
                <div className="py-8 text-center text-[var(--text-secondary)]">
                  <AlertCircle className="w-8 h-8 mx-auto opacity-40 mb-2" />
                  <p className="text-sm">No other active family members found.</p>
                </div>
              ) : (
                Object.entries(balances).map(([memberId, val]) => {
                  const member = familyMembers.find(m => m._id === memberId);
                  if (!member) return null;

                  return (
                    <div key={memberId} className="flex items-center justify-between p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-hover)] transition-all hover:border-indigo-500/25">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-sm font-bold">
                          {member.displayName ? member.displayName.slice(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text)]">{member.displayName}</p>
                          <p className={`text-xs font-semibold ${val > 0 ? 'text-emerald-500' : val < 0 ? 'text-rose-500' : 'text-[var(--text-secondary)]'}`}>
                            {val > 0 ? `Owes you ${formatCurrency(val)}` : val < 0 ? `You owe ${formatCurrency(Math.abs(val))}` : 'All settled up'}
                          </p>
                        </div>
                      </div>

                      {val !== 0 && (
                        <button
                          onClick={() => openSettleModalFor(member, val)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            val < 0
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                          }`}
                        >
                          {val < 0 ? 'Settle Up' : 'Record Pay'}
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Chronological Split Ledger History */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl shadow-black/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                <h3 className="text-lg font-bold text-[var(--text)]">Split Transactions History</h3>
              </div>
              <button onClick={fetchData} className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">
                <RefreshCw className="w-4 h-4 animate-hover" />
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {splitExpenses.length === 0 ? (
                <div className="py-12 text-center text-[var(--text-secondary)]">
                  <Coins className="w-12 h-12 mx-auto opacity-30 mb-3" />
                  <p className="font-medium">No split expenses yet</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">Split expenses will appear here once created.</p>
                </div>
              ) : (
                splitExpenses.map((expense) => {
                  const isPayer = (typeof expense.splitDetails.paidBy === 'object' ? expense.splitDetails.paidBy?._id : expense.splitDetails.paidBy) === user?._id;
                  const payerName = isPayer ? 'You' : (expense.splitDetails.paidBy?.displayName || 'Someone');
                  const isSettlement = expense.splitDetails.splitType === 'settlement';
                  
                  return (
                    <div key={expense._id} className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border)] bg-[var(--bg)] hover:bg-[var(--surface-hover)] transition-all">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${
                          isSettlement ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'
                        }`}>
                          {isSettlement ? '🤝' : '💸'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text)] line-clamp-1">{expense.productName}</p>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {isSettlement ? (
                              <span className="text-emerald-500 font-semibold">Repayment</span>
                            ) : (
                              <span>Paid by <span className="font-semibold text-[var(--text)]">{payerName}</span></span>
                            )}
                            {' • '}{new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-extrabold text-[var(--text)]">{formatCurrency(expense.amount)}</p>
                        <p className={`text-xs font-bold ${isPayer ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isSettlement ? (
                            isPayer ? 'You paid' : 'You received'
                          ) : (
                            isPayer ? 'You lent' : 'You owe'
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settle Up Interactive Modal */}
      {showSettleModal && settleWithUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden shadow-2xl animate-scale">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
                🤝 Settle Up Balance
              </h3>
              <button
                onClick={() => { setShowSettleModal(false); setSettleWithUser(null); }}
                className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="p-6 space-y-5">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center text-xl font-bold mx-auto mb-3">
                  {settleWithUser.displayName ? settleWithUser.displayName.slice(0, 2).toUpperCase() : 'U'}
                </div>
                <h4 className="font-bold text-[var(--text)] text-base">{settleWithUser.displayName}</h4>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Current outstanding balance:{' '}
                  <span className={`font-semibold ${balances[settleWithUser._id] > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {balances[settleWithUser._id] > 0
                      ? `${settleWithUser.displayName} owes you ${formatCurrency(balances[settleWithUser._id])}`
                      : `You owe ${settleWithUser.displayName} ${formatCurrency(Math.abs(balances[settleWithUser._id]))}`}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">Settlement Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={settleAmount}
                  onChange={e => setSettleAmount(e.target.value)}
                  placeholder="Enter amount paid/received"
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xl font-bold text-[var(--text)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text)] mb-2">Note / Description (optional)</label>
                <input
                  type="text"
                  value={settleNote}
                  onChange={e => setSettleNote(e.target.value)}
                  placeholder="e.g. UPI transfer, Cash payment, etc."
                  className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)] focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowSettleModal(false); setSettleWithUser(null); }}
                  className="flex-1 py-3 rounded-xl bg-[var(--surface-hover)] border border-[var(--border)] font-bold text-[var(--text)] hover:bg-[var(--border)] text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !settleAmount || Number(settleAmount) <= 0}
                  className="flex-1 py-3 rounded-xl gradient-primary text-white font-bold hover:opacity-95 disabled:opacity-50 text-sm transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Record Settle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
