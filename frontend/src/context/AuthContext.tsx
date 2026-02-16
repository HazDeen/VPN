import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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

  useEffect(() => {
    // Загружаем пользователя из localStorage при старте
    const loadUser = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('✅ User loaded from localStorage:', parsedUser.username);
        } catch (e) {
          console.error('Failed to parse user from localStorage');
          localStorage.removeItem('user');
        }
      } else {
        console.log('ℹ️ No user in localStorage');
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Редирект только после загрузки и если нет пользователя
  useEffect(() => {
    if (!loading) {
      const isLoginPage = location.pathname.includes('/login');
      
      if (!user && !isLoginPage) {
        console.log('🚫 No user, redirecting to login');
        navigate('/login');
      }
      
      if (user && isLoginPage) {
        console.log('✅ User exists, redirecting to home');
        navigate('/');
      }
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