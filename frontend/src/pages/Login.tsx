import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error('Введите username');
      return;
    }

    setLoading(true);
    try {
      console.log('🔑 Вход по username:', username);
      
      const response = await api.auth.loginByUsername(username);
      
      console.log('✅ Успешный вход:', response);
      
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success(`✅ Добро пожаловать, ${response.user.firstName || username}!`);
      
      // 👉 Просто переходим на главную, без перезагрузки
      navigate('/');
      
    } catch (error: any) {
      console.error('❌ Ошибка входа:', error);
      toast.error(error.message || 'Пользователь не найден. Напишите /start боту');
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
            Введите ваш Telegram username, чтобы войти в аккаунт
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="inputGroup">
              <input
                type="text"
                className="loginInput"
                placeholder="@username"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                disabled={loading}
                autoFocus
              />
            </div>
            
            <button 
              type="submit"
              className="loginButton"
              disabled={loading}
            >
              <LogIn size={20} />
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          
          <div className="loginFooter">
            <p>Нет аккаунта? Напишите боту:</p>
            <a 
              href="https://t.me/banana_vpnihe_bot" 
              target="_blank"
              rel="noopener noreferrer"
              className="botLink"
            >
              @banana_vpnihe_bot
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}