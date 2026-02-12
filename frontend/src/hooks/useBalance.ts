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
      
      // ✅ Если у пользователя уже есть баланс - используем его!
      if (user?.balance !== undefined) {
        console.log('✅ Using balance from user profile:', user.balance);
        setBalance(user.balance);
        setDaysLeft(30); // Временное значение
        setLoading(false);
        return;
      }
      
      // Иначе запрашиваем с сервера
      const data = await api.user.getBalance();
      console.log('✅ Balance from API:', data);
      
      setBalance(data.balance);
      setDaysLeft(data.daysLeft);
      updateBalance(data.balance);
      
    } catch (error) {
      console.error('❌ Failed to fetch balance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user?.id, user?.balance]);

  return { balance, daysLeft, loading, refetch: fetchBalance };
};