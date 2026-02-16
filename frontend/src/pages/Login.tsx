import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Парсим токен из hash
    const hash = window.location.hash; // "#/login?token=..."
    const search = hash.split('?')[1];
    const params = new URLSearchParams(search);
    const token = params.get('token');
    
    console.log('🔍 Hash:', hash);
    console.log('🔍 Token from URL:', token);
    
    if (!token) {
      setError('Отсутствует токен авторизации');
      setLoading(false);
      return;
    }

    localStorage.setItem('authToken', token);
    handleLogin(token);
  }, []);

  const handleLogin = async (token: string) => {
    try {
      console.log('🔑 Отправка токена на бэкенд:', token);
      
      const response = await fetch(`https://vpn-production-702c.up.railway.app/auth/token?token=${token}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('✅ Успешный вход:', data);
      
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`✅ Добро пожаловать, ${data.user.firstName || 'пользователь'}!`);
      navigate('/');
      
    } catch (error) {
      console.error('❌ Ошибка входа:', error);
      setError('Ошибка входа. Попробуйте снова.');
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
            <p>Вход в аккаунт...</p>
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
                🔄 Получить новую ссылку
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}