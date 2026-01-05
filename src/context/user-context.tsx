'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface UserContextType {
  currentUser: User | null;
  members: User[];
  loading: boolean;
  login: (userId: number, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshMembers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const data: User[] = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      // Don't set loading false yet, wait for hydration check
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchMembers();
      
      const storedUser = localStorage.getItem('standup_user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('standup_user');
        }
      }
      setLoading(false);
    };
    
    initialize();
  }, []);

  const refreshMembers = () => {
    fetchMembers();
  };

  const login = async (userId: number, password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setCurrentUser(data.user);
        localStorage.setItem('standup_user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('standup_user');
  };

  return (
    <UserContext.Provider value={{ currentUser, members, loading, login, logout, refreshMembers }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
