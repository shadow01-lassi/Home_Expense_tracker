'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AppUser {
  _id: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: string;
  familyId: any;
  currency: string;
  preferences: any;
  initials: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Initial load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('app_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const { user: appUser } = await api('/auth/me');
          setUser(appUser);
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('app_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      
      localStorage.setItem('app_token', data.token);
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: { email, password, displayName: name },
      });
      
      localStorage.setItem('app_token', data.token);
      setToken(data.token);
      setUser(data.user);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    localStorage.removeItem('app_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    if (token) {
      const { user: appUser } = await api('/auth/me');
      setUser(appUser);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, loading, token,
      signIn, signUp, signOutUser, refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
