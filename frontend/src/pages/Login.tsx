import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Получаем initData из Telegram
    // @ts-ignore
    const initData = window.Telegram?.WebApp?.initData || window.Telegram?.WebView?.initParams?.tgWebAppData;
    
    console.log('📦 initData:', initData);
    
    if (!initData) {
      setError('Это приложение должно работать внутри Telegram');
      setLoading(false);
      return;
    }

    // Парсим initData
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    
    if (!userStr) {
      setError('Не удалось получить данные пользователя');
      setLoading(false);
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      const telegramId = userData.id;
      
      console.log('✅ Telegram ID:', telegramId);
      console.log('✅ User data:', userData);
      
      handleLogin(telegramId);
    } catch (e) {
      setError('Ошибка обработки данных Telegram');
      setLoading(false);
    }
  }, []);

  const handleLogin = async (telegramId: number) => {
    try {
      console.log('🔑 Вход по Telegram ID:', telegramId);
      
      const response = await api.auth.telegramId(telegramId);
      
      console.log('✅ Успешный вход:', response);
      
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success(`✅ Добро пожаловать, ${response.user.firstName || 'пользователь'}!`);
      navigate('/');
      
    } catch (error: any) {
      console.error('❌ Ошибка входа:', error);
      setError(error.message || 'Пользователь не найден. Напишите /start боту.');
      toast.error('❌ Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loginPage">
        <div className="loginContainer">
          <div className="loginCard">
            <p>Вход через Telegram...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loginPage">
        <div className="loginContainer">
          <h1 className="loginTitle">VPN Mini App</h1>
          <div className="loginCard">
            <div className="errorBox">
              <p>❌ {error}</p>
              <button 
                className="retryButton"
                onClick={() => window.location.href = 'https://t.me/banana_vpnihe_bot'}
              >
                🔄 Открыть бота
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}