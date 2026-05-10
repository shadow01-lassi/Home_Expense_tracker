'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { 
      // await api('/auth/reset-password', { method: 'POST', body: { email } });
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSent(true); 
    }
    catch (err: any) { setError(err.message || 'Failed to send reset email'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[var(--bg)]">
      <div className="w-full max-w-md">
        <Link href="/login" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text)] mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>

        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6">
          <Mail className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Reset password</h1>
        <p className="text-[var(--text-secondary)] mb-8">Enter your email and we&apos;ll send you a reset link</p>

        {error && <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}

        {sent ? (
          <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <div className="text-4xl mb-4">✉️</div>
            <h3 className="text-lg font-semibold text-emerald-600 mb-2">Check your email</h3>
            <p className="text-[var(--text-secondary)] text-sm">We sent a password reset link to <strong>{email}</strong></p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                placeholder="Email address" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl gradient-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-lg shadow-indigo-500/25">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Send className="w-5 h-5" /> Send Reset Link</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
