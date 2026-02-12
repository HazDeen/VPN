import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

interface User {
  id: number;
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
  balance: number;  // ✅ БАЛАНС ДОЛЖЕН БЫТЬ!
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async () => {
    try {
      setLoading(true);
      console.log('🔐 Attempting to login...');
      
      // @ts-ignore
      const hasInitData = !!window.Telegram?.WebApp?.initData;
      console.log('📦 initData exists:', hasInitData);
      
      if (!hasInitData) {
        console.log('⚠️ Not in Telegram environment');
        setLoading(false);
        return;
      }
      
      // 1️⃣ АВТОРИЗАЦИЯ
      const authData = await api.auth.telegram();
      console.log('✅ Auth response:', authData);
      
      // 2️⃣ ПОЛУЧАЕМ ПРОФИЛЬ С БАЛАНСОМ!
      const profileData = await api.user.getProfile();
      console.log('👤 Profile response:', profileData);
      
      // 3️⃣ СОХРАНЯЕМ ПОЛЬЗОВАТЕЛЯ С БАЛАНСОМ!
      setUser(profileData);
      
    } catch (error) {
      console.error('❌ Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      setUser({ ...user, balance: newBalance });
    }
  };

  useEffect(() => {
    login();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateBalance }}>
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

export default AuthProvider;