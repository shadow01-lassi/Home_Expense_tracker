'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Users, Shield, Zap, PieChart, Bell, Smartphone, Globe } from 'lucide-react';

const features = [
  { icon: Users, title: 'Multi-User Family', desc: 'Up to 10+ members can collaborate, track & manage expenses together in real time.', color: 'from-indigo-500 to-purple-500' },
  { icon: BarChart3, title: 'Smart Analytics', desc: 'Beautiful dashboards with daily, weekly, monthly & yearly insights at a glance.', color: 'from-emerald-500 to-teal-500' },
  { icon: Shield, title: 'Budget Alerts', desc: 'Set budgets per category & get instant alerts when you\'re close to limits.', color: 'from-amber-500 to-orange-500' },
  { icon: Zap, title: 'Real-Time Sync', desc: 'Changes appear instantly across all devices. No refresh needed.', color: 'from-blue-500 to-indigo-500' },
  { icon: PieChart, title: 'Category Tracking', desc: '19+ predefined categories plus custom ones with colors & icons.', color: 'from-pink-500 to-rose-500' },
  { icon: Bell, title: 'Smart Insights', desc: 'AI-powered tips like "Groceries up 18% this month" to save money.', color: 'from-violet-500 to-purple-500' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">₹</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">HomeExpense</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors">Log in</Link>
            <Link href="/signup" className="px-5 py-2 text-sm font-medium text-white rounded-xl gradient-primary hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25">Sign up free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" /> Real-time family expense tracking
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Smart Money Management
              </span>
              <br />
              <span className="text-[var(--text)]">for Your Family</span>
            </h1>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed">
              Track every rupee, set budgets, get smart insights, and keep your entire household finances organized — all in one beautiful app.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/signup" className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-white rounded-2xl gradient-primary hover:opacity-90 transition-all shadow-xl shadow-indigo-500/25">
                Get Started Free <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-[var(--text)] rounded-2xl border-2 border-[var(--border)] hover:border-indigo-500/50 transition-colors">
                Live Demo
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '19+', label: 'Expense Categories' },
              { num: '5+', label: 'Family Members' },
              { num: '100%', label: 'Real-time Sync' },
              { num: '₹0', label: 'Completely Free' },
            ].map((s, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] card-hover">
                <div className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{s.num}</div>
                <div className="text-sm text-[var(--text-secondary)] mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-[var(--text)] mb-4">Everything You Need</h2>
            <p className="text-lg text-[var(--text-secondary)]">Powerful features designed for Indian households</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] card-hover">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-2">{f.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Devices */}
      <section className="py-20 px-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-[var(--text)] mb-4">Works Everywhere</h2>
          <p className="text-lg text-[var(--text-secondary)] mb-12">Access from any device — phone, tablet, or desktop</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {[
              { icon: Smartphone, label: 'Mobile' },
              { icon: Smartphone, label: 'Tablet' },
              { icon: Globe, label: 'Desktop' },
            ].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-3 p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] w-40">
                <d.icon className="w-10 h-10 text-indigo-500" />
                <span className="font-semibold text-[var(--text)]">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl gradient-primary relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmgtNHY2aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative">Start Tracking Today</h2>
            <p className="text-white/80 text-lg mb-8 relative">Join thousands of families managing their expenses smarter</p>
            <Link href="/signup" className="relative inline-flex items-center gap-2 px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-2xl hover:bg-gray-50 transition-colors shadow-xl">
              Create Free Account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">₹</span>
            </div>
            <span className="font-bold text-[var(--text)]">HomeExpense</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">© 2026 HomeExpense. Built with ❤️ for families.</p>
        </div>
      </footer>
    </div>
  );
}
