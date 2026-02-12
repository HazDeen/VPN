import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const useBalance = () => {
  const [balance, setBalance] = useState(0);
  const [daysLeft, setDaysLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, updateBalance } = useAuth();

  const fetchBalance = async () => {
    try {
      setLoading(true);
      console.log('💰 Fetching balance...');
      
      const data = await api.user.getBalance();
      console.log('✅ Balance data:', data);
      
      setBalance(data.balance);
      setDaysLeft(data.daysLeft);
      updateBalance(data.balance);
    } catch (error) {
      console.error('❌ Failed to fetch balance:', error);
      
      // Если не работает API, используем баланс из контекста
      if (user?.balance) {
        console.log('⚠️ Using balance from auth context:', user.balance);
        setBalance(user.balance);
        setDaysLeft(30);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user?.id]); // Перезапрашиваем при смене пользователя

  return { balance, daysLeft, loading, refetch: fetchBalance };
};