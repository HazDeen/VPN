import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { toast } from 'sonner';
import { LogIn } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast.error('Введите username и пароль');
      return;
    }

    setLoading(true);
    try {
      console.log('🔑 Вход:', username);
      
      const response = await api.auth.login(username, password);
      
      console.log('✅ Успешный вход:', response);
      
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success(`✅ Добро пожаловать, ${response.user.firstName || username}!`);
      
      navigate('/');
      
    } catch (error: any) {
      console.error('❌ Ошибка входа:', error);
      
      if (error.message?.includes('Пароль не установлен')) {
        toast.error('❌ Пароль не установлен. Напишите /setpass в боте');
      } else if (error.message?.includes('Неверный пароль')) {
        toast.error('❌ Неверный пароль');
      } else {
        toast.error(error.message || 'Ошибка входа');
      }
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
            Введите ваш Telegram username и пароль
          </p>
          
          <form onSubmit={handleSubmit}>
            <div className="inputGroup">
              <input
                type="text"
                className="loginInput"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            
            <div className="inputGroup">
              <input
                type="password"
                className="loginInput"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
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
            <p>Нет пароля? Напишите боту:</p>
            <a 
              href="https://t.me/banana_vpnihe_bot" 
              target="_blank"
              rel="noopener noreferrer"
              className="botLink"
            >
              @banana_vpnihe_bot
            </a>
            <p className="forgotPassword">
              <a href="#" onClick={() => window.open('https://t.me/banana_vpnihe_bot', '_blank')}>
                Забыли пароль?
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}