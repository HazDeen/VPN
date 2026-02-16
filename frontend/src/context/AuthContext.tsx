import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

interface User {
  id: number;
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateBalance: (newBalance: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      navigate('/login');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Loading user profile...');
      const profile = await api.user.getProfile();
      console.log('✅ Profile loaded:', profile);
      setUser(profile);
    } catch (error) {
      console.error('❌ Failed to load user:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      setUser({ ...user, balance: newBalance });
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, updateBalance, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};