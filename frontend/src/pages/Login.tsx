import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setError('Отсутствует токен авторизации');
      setLoading(false);
      return;
    }

    // Сохраняем токен в localStorage
    localStorage.setItem('authToken', token);
    
    // Авторизуемся
    handleLogin(token);
  }, []);

  const handleLogin = async (token: string) => {
    try {
      console.log('🔑 Logging in with token:', token);
      
      // Отправляем токен на бэкенд
      const response = await fetch(`https://vpn-production-702c.up.railway.app/auth/token?token=${token}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      console.log('✅ Login success:', data);
      
      // Сохраняем пользователя в контексте
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success('✅ Успешный вход!');
      navigate('/');
      
    } catch (error) {
      console.error('❌ Login error:', error);
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