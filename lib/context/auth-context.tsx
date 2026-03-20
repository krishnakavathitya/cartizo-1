'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  photo?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  // Fetch current user on mount or when NextAuth session changes
  useEffect(() => {
    if (status !== 'loading') {
      fetchCurrentUser();
    }
  }, [session, status]);

  const fetchCurrentUser = async () => {
    try {
      // If NextAuth session exists, use it
      if (session?.user) {
        console.log('✅ NextAuth session found:', session.user.email);
        const sessionUser = {
          id: parseInt(session.user.id || '0'),
          name: session.user.name || '',
          email: session.user.email || '',
          role: session.user.role || 'user',
          avatar: session.user.image || undefined,
          photo: session.user.image || undefined,
        };
        setUser(sessionUser);
        setLoading(false);
        return;
      }

      // If NextAuth is still loading, wait
      if (status === 'loading') {
        return;
      }

      // Only check JWT auth if no NextAuth session
      if (status === 'unauthenticated') {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ JWT User loaded:', data.user?.email);
          // Ensure both avatar and photo are set for compatibility
          if (data.user) {
            data.user.photo = data.user.avatar || data.user.photo;
          }
          setUser(data.user);
        } else {
          // Not logged in with either method
          setUser(null);
        }
      } else {
        // No session at all
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth fetch error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      // Logout from both NextAuth and JWT auth
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // If using NextAuth, also sign out from that
      if (session) {
        const { signOut } = await import('next-auth/react');
        await signOut({ redirect: false });
      }

      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
