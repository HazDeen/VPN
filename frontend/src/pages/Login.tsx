import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { api } from '../api/client';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasTelegram, setHasTelegram] = useState(false);

  useEffect(() => {
    // Проверяем, доступен ли Telegram
    // @ts-ignore
    const tg = window.Telegram?.WebApp;
    if (tg) {
      setHasTelegram(true);
      // Можно сразу попробовать авторизоваться
      handleTelegramLogin();
    }
  }, []);

  const handleTelegramLogin = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const initData = window.Telegram?.WebApp?.initData;
      
      if (!initData) {
        toast.error('❌ Telegram не доступен');
        return;
      }

      console.log('📦 initData:', initData);
      
      // Авторизуемся
      const authRes = await api.auth.telegram();
      console.log('✅ Auth response:', authRes);
      
      // Получаем профиль
      const profileRes = await api.user.getProfile();
      console.log('✅ Profile:', profileRes);
      
      toast.success('✅ Успешный вход!');
      navigate('/');
      
    } catch (error) {
      console.error('❌ Login error:', error);
      toast.error('❌ Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginContainer">
        <h1 className="loginTitle">VPN Mini App</h1>
        
        <div className="loginCard">
          <p className="loginDescription">
            Войдите через Telegram, чтобы управлять своими устройствами и подписками
          </p>
          
          {!hasTelegram ? (
            <div className="warningBox">
              <p>⚠️ Это приложение должно работать внутри Telegram</p>
              <p>Откройте бота @banana_vpnihe_bot и нажмите Launch</p>
            </div>
          ) : (
            <button 
              className="telegramLoginButton"
              onClick={handleTelegramLogin}
              disabled={loading}
            >
              <LogIn size={20} />
              {loading ? 'Вход...' : 'Войти через Telegram'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}