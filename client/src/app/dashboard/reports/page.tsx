'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { formatCurrency, formatDate, CATEGORY_ICONS } from '@/lib/utils';
import { FileText, Download, Filter, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const { user, token } = useAuth();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const authOpts = { token };

  useEffect(() => {
    const fetch = async () => {
      if (!user?.familyId) return;
      try {
        const [eRes, sRes] = await Promise.all([
          api(`/expenses?startDate=${dateRange.start}&endDate=${dateRange.end}&limit=200`, authOpts),
          api('/analytics/summary?period=monthly', authOpts),
        ]);
        setExpenses(eRes.expenses); setSummary(sRes);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user?.familyId, dateRange]);

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Expense Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Period: ${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`, 14, 30);
    doc.text(`Total: ${formatCurrency(expenses.reduce((s, e) => s + e.amount, 0))}`, 14, 36);

    autoTable(doc, {
      startY: 44,
      head: [['Date', 'Product', 'Category', 'Payment', 'Added By', 'Amount']],
      body: expenses.map(e => [
        formatDate(e.date), e.productName, e.category, e.paymentMethod,
        e.addedBy?.displayName || 'Unknown', `₹${e.amount}`,
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] },
    });

    doc.save(`expense-report-${dateRange.start}-to-${dateRange.end}.pdf`);
  };

  const exportExcel = async () => {
    const XLSX = await import('xlsx');
    const data = expenses.map(e => ({
      Date: formatDate(e.date),
      Product: e.productName,
      Category: e.category,
      'Payment Method': e.paymentMethod,
      'Added By': e.addedBy?.displayName || 'Unknown',
      Amount: e.amount,
      Notes: e.notes || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    XLSX.writeFile(wb, `expense-report-${dateRange.start}-to-${dateRange.end}.xlsx`);
  };

  const total = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6 slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)]">Reports</h1>
          <p className="text-[var(--text-secondary)]">Generate and export expense reports</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-sm font-medium hover:bg-red-500/20 transition-colors">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button onClick={exportExcel} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-sm font-medium hover:bg-emerald-500/20 transition-colors">
            <Download className="w-4 h-4" /> Excel
          </button>
        </div>
      </div>

      {/* Date Range */}
      <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-wrap items-center gap-4">
        <Calendar className="w-5 h-5 text-[var(--text-secondary)]" />
        <div className="flex items-center gap-2">
          <input type="date" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})}
            className="px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)]" />
          <span className="text-[var(--text-secondary)]">to</span>
          <input type="date" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})}
            className="px-3 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-sm text-[var(--text)]" />
        </div>
        <div className="ml-auto text-right">
          <p className="text-sm text-[var(--text-secondary)]">{expenses.length} expenses</p>
          <p className="text-lg font-bold text-[var(--text)]">Total: {formatCurrency(total)}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(summary?.categoryBreakdown || []).slice(0, 4).map((c: any, i: number) => (
          <div key={i} className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <span className="text-2xl">{CATEGORY_ICONS[c._id] || '📌'}</span>
            <p className="text-sm text-[var(--text-secondary)] mt-1">{c._id}</p>
            <p className="text-lg font-bold text-[var(--text)]">{formatCurrency(c.total)}</p>
          </div>
        ))}
      </div>

      {/* Report Table */}
      {loading ? (
        <div className="h-64 rounded-2xl bg-[var(--surface)] animate-pulse" />
      ) : (
        <div className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['Date', 'Product', 'Category', 'Payment', 'Added By', 'Amount'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[var(--text-secondary)] uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp._id} className="border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="px-4 py-3 text-sm text-[var(--text)]">{formatDate(exp.date)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--text)]">{exp.productName}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-xs">
                        {CATEGORY_ICONS[exp.category]} {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{exp.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-secondary)]">{exp.addedBy?.displayName}</td>
                    <td className="px-4 py-3 text-sm font-bold text-[var(--text)]">{formatCurrency(exp.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[var(--surface-hover)]">
                  <td colSpan={5} className="px-4 py-3 text-sm font-bold text-[var(--text)]">Total</td>
                  <td className="px-4 py-3 text-sm font-bold text-indigo-500">{formatCurrency(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
