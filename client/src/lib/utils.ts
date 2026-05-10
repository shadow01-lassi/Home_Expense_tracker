import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN')}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export const CATEGORY_ICONS: Record<string, string> = {
  'Groceries': '🛒', 'Household Items': '🏠', 'Soap & Toiletries': '🧴',
  'Travel': '✈️', 'Fuel': '⛽', 'Guest Expenses': '👥',
  'Snacks / Naasta': '🍪', 'Vegetables & Fruits': '🥕', 'Medical': '💊',
  'Electricity Bill': '⚡', 'Water Bill': '💧', 'Internet/WiFi': '📶',
  'Rent': '🏢', 'Maintenance': '🔧', 'Shopping': '🛍️',
  'Emergency': '🚨', 'Entertainment': '🎬', 'Education': '🎓',
  'Miscellaneous': '📌',
};

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer'] as const;

export const PAYMENT_ICONS: Record<string, string> = {
  'Cash': '💵', 'UPI': '📱', 'Credit Card': '💳', 'Debit Card': '💳', 'Bank Transfer': '🏦',
};
