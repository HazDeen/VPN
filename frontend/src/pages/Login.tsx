import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { api } from '../api/client';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasTelegram, setHasTelegram] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // Пробуем 20 раз с интервалом 200ms
    const interval = setInterval(() => {
      attempts++;
      
      // @ts-ignore
      const tg = window.Telegram?.WebApp || window.Telegram?.WebView;
      
      if (tg) {
        console.log('✅ Telegram found after', attempts, 'attempts');
        setHasTelegram(true);
        setChecking(false);
        clearInterval(interval);
        // Пробуем сразу авторизоваться
        handleTelegramLogin();
      } else if (attempts >= maxAttempts) {
        console.log('❌ Telegram not found after', maxAttempts, 'attempts');
        setChecking(false);
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const getInitData = (): string => {
    // @ts-ignore
    if (window.Telegram?.WebApp?.initData) {
      // @ts-ignore
      return window.Telegram.WebApp.initData;
    }
    
    // @ts-ignore
    if (window.Telegram?.WebView?.initParams?.tgWebAppData) {
      // @ts-ignore
      return window.Telegram.WebView.initParams.tgWebAppData;
    }
    
    return '';
  };

  const handleTelegramLogin = async () => {
    setLoading(true);
    try {
      const initData = getInitData();
      
      if (!initData) {
        toast.error('❌ Не удалось получить данные Telegram');
        console.error('No initData found');
        return;
      }

      console.log('📦 initData:', initData);
      
      const authRes = await api.auth.telegram();
      console.log('✅ Auth response:', authRes);
      
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

  if (checking) {
    return (
      <div className="loginPage">
        <div className="loginContainer">
          <div className="loginCard">
            <p>Проверка подключения к Telegram...</p>
          </div>
        </div>
      </div>
    );
  }

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
              <button 
                className="retryButton"
                onClick={() => window.location.reload()}
              >
                🔄 Попробовать снова
              </button>
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