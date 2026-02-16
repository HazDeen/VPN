import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, RefreshCw, Trash2, Smartphone, Check, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { toast } from 'sonner';

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const loadDevice = async () => {
      try {
        setLoading(true);
        const devices = await api.devices.getAll();
        const currentDevice = devices.find((d: any) => d.id === Number(id));
        if (currentDevice) {
          setDevice(currentDevice);
          setDeviceName(currentDevice.name);
        }
      } catch (error) {
        console.error('Failed to load device:', error);
        toast.error('Не удалось загрузить устройство');
      } finally {
        setLoading(false);
      }
    };
    loadDevice();
  }, [id]);

  const handleCopy = () => {
    if (device?.configLink) {
      navigator.clipboard.writeText(device.configLink);
      setCopied(true);
      toast.success('Ссылка скопирована!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveName = async () => {
    if (!deviceName.trim()) return;
    setIsEditing(false);
    // Здесь можно добавить сохранение на бэкенд
    toast.success('Название обновлено');
  };

  if (loading) {
    return (
      <div className="deviceDetailPage">
        <div className="loadingScreen">
          <div className="loadingSpinner"></div>
          <p>Загрузка устройства...</p>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="deviceDetailPage">
        <div className="errorScreen">
          <AlertCircle size={48} />
          <h2>Устройство не найдено</h2>
          <button onClick={() => navigate(-1)}>Вернуться назад</button>
        </div>
      </div>
    );
  }

  return (
    <div className="deviceDetailPage">
      <div className="deviceDetailHeader">
        <button className="backButton" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Настройки устройства</h1>
      </div>

      {/* Карточка устройства сверху */}
      <div className="deviceProfileCard">
        <div className="deviceProfileIcon">
          <Smartphone size={48} />
        </div>
        <div className="deviceProfileInfo">
          {isEditing ? (
            <div className="deviceNameEdit">
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                autoFocus
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              />
              <button onClick={handleSaveName} className="saveNameBtn">
                <Check size={18} />
              </button>
            </div>
          ) : (
            <div className="deviceNameDisplay">
              <h2>{device.name}</h2>
              <button onClick={() => setIsEditing(true)} className="editNameBtn">
                ✏️
              </button>
            </div>
          )}
          <p className="deviceProfileModel">{device.model}</p>
          <div className="deviceProfileStatus">
            <span className={`statusBadge ${device.isActive ? 'active' : 'inactive'}`}>
              {device.isActive ? '● Активно' : '○ Неактивно'}
            </span>
            {device.isActive && (
              <span className="daysBadge">⏳ {device.daysLeft || 30} дн.</span>
            )}
          </div>
        </div>
      </div>

      {/* Блок с конфигурацией */}
      <div className="configCard">
        <h3 className="configCardTitle">Конфигурация</h3>
        <p className="configCardDescription">
          Скопируйте ссылку и вставьте в приложение HitProxy или HitVPN
        </p>
        
        <div className="configLinkContainer">
          <code className="configLinkCode">{device.configLink}</code>
          <button 
            className={`copyLinkBtn ${copied ? 'copied' : ''}`} 
            onClick={handleCopy}
          >
            <Copy size={18} />
            {copied ? 'Скопировано!' : 'Копировать'}
          </button>
        </div>
      </div>

      {/* Сетка действий */}
      <div className="actionsGrid">
        <div className="actionCard warning">
          <div className="actionIcon">
            <RefreshCw size={24} />
          </div>
          <h4>Не работает VPN?</h4>
          <p>Замените настройки устройства</p>
          <button className="actionBtn warning">Заменить</button>
        </div>

        <div className="actionCard danger">
          <div className="actionIcon">
            <Trash2 size={24} />
          </div>
          <h4>Удалить устройство</h4>
          <p>Это действие нельзя отменить</p>
          <button className="actionBtn danger">Удалить</button>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="deviceInfoFooter">
        <p>Подключено: {device.date || '12.02.26'}</p>
        <p>ID: {id}</p>
      </div>
    </div>
  );
}