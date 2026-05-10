'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSocket } from '@/contexts/SocketContext';
import { getInitials } from '@/lib/utils';
import {
  LayoutDashboard, Receipt, Coins, PieChart, Wallet, FileText, Users, Settings, Shield,
  Plus, Sun, Moon, Bell, Search, Menu, X, LogOut, ChevronLeft, Wifi, WifiOff
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/expenses', icon: Receipt, label: 'Expenses' },
  { href: '/dashboard/splits', icon: Coins, label: 'Group Splits 📊' },
  { href: '/dashboard/analytics', icon: PieChart, label: 'Analytics' },
  { href: '/dashboard/budgets', icon: Wallet, label: 'Budgets' },
  { href: '/dashboard/reports', icon: FileText, label: 'Reports' },
  { href: '/dashboard/family', icon: Users, label: 'Family' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { href: '/dashboard/admin', icon: Shield, label: 'Admin' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOutUser } = useAuth();
  const { toggleTheme, resolvedTheme } = useTheme();
  const { isConnected } = useSocket();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => { await signOutUser(); router.push('/login'); };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'} bg-[var(--surface)] border-r border-[var(--border)] transition-all duration-300 fixed h-full z-30`}>
        <div className="p-4 flex items-center justify-between border-b border-[var(--border)]">
          {sidebarOpen && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <span className="text-white font-bold">₹</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">HomeExpense</span>
            </Link>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-secondary)]">
            <ChevronLeft className={`w-5 h-5 transition-transform ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            if (item.label === 'Admin' && user.role !== 'admin') return null;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-indigo-500/10 text-indigo-500' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text)]'
                }`}>
                <item.icon className="w-5 h-5 shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-3 border-t border-[var(--border)]">
          <div className={`flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-hover)] ${!sidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(user.displayName)}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text)] truncate">{user.displayName}</p>
                <p className="text-xs text-[var(--text-secondary)] truncate">{user.email}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-[var(--surface)] p-4 slide-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold">₹</span>
                </div>
                <span className="text-lg font-bold text-[var(--text)]">HomeExpense</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-[var(--surface-hover)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map(item => {
                const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                if (item.label === 'Admin' && user.role !== 'admin') return null;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      active ? 'bg-indigo-500/10 text-indigo-500' : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]'
                    }`}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 glass">
          <div className="flex items-center justify-between px-4 md:px-6 h-16">
            <div className="flex items-center gap-3">
              <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-[var(--surface-hover)]">
                <Menu className="w-5 h-5 text-[var(--text)]" />
              </button>
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] w-72">
                <Search className="w-4 h-4 text-[var(--text-secondary)]" />
                <input type="text" placeholder="Search expenses..." className="bg-transparent text-sm text-[var(--text)] placeholder-[var(--text-secondary)] outline-none w-full" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Connection status */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isConnected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
              </div>

              <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] transition-colors">
                {resolvedTheme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <button className="p-2.5 rounded-xl hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
              </button>

              <button onClick={handleLogout} className="p-2.5 rounded-xl hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Floating Add Button */}
      <Link href="/dashboard/expenses/add"
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 hover:scale-110 transition-transform lg:bottom-8 lg:right-8">
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
