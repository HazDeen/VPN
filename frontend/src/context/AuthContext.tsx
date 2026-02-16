import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';

interface User {
  id: number;
  telegramId: string;
  firstName: string;
  lastName: string;
  username: string;
  balance: number;
  isAdmin: boolean;
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
  const location = useLocation();

  // Загружаем пользователя из localStorage при старте
  useEffect(() => {
    const loadUser = async () => {
      const savedUser = localStorage.getItem('user');
      
      if (!savedUser) {
        console.log('❌ No user in localStorage');
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(savedUser);
        
        // Пытаемся получить профиль с сервера
        const profile = await api.user.getProfile();
        
        if (profile.username === parsedUser.username) {
          console.log('✅ User validated:', profile.username);
          setUser(profile);
        } else {
          console.log('❌ User data mismatch');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('❌ Failed to validate user:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Редирект только после загрузки
  useEffect(() => {
    if (!loading) {
      const isLoginPage = location.pathname.includes('/login');
      
      if (!user && !isLoginPage) {
        console.log('🚫 No user, redirecting to login');
        navigate('/login');
      }
      
      // 👉 Убираем автоматический редирект с login на home
      // Пусть пользователь сам решает, когда войти
    }
  }, [user, loading, navigate, location]);

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updated = { ...user, balance: newBalance };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

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