import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, RefreshCw, Trash2, Smartphone, Check, AlertCircle, Edit2 } from 'lucide-react';
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

  // Конвертируем ID в число
  const deviceId = id ? parseInt(id) : null;

  useEffect(() => {
    if (!deviceId) {
      navigate('/');
      return;
    }
    loadDevice();
  }, [deviceId]);

  const loadDevice = async () => {
    try {
      setLoading(true);
      const devices = await api.devices.getAll();
      const currentDevice = devices.find((d: any) => d.id === deviceId);
      if (currentDevice) {
        setDevice(currentDevice);
        setDeviceName(currentDevice.name);
      } else {
        toast.error('Устройство не найдено');
        navigate('/');
      }
    } catch (error) {
      console.error('Failed to load device:', error);
      toast.error('Не удалось загрузить устройство');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (device?.configLink) {
      navigator.clipboard.writeText(device.configLink);
      setCopied(true);
      toast.success('Ссылка скопирована!', {
        icon: '📋',
        duration: 2000
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ✅ ЗАМЕНА ССЫЛКИ (ТОКЕНА)
  const handleReplaceLink = async () => {
    if (!deviceId) return;
    
    toast.loading('Генерируем новую ссылку...', { 
      id: 'replace',
      icon: '🔄'
    });
    
    try {
      // 👇 РЕАЛЬНЫЙ API ЗАПРОС ДЛЯ ЗАМЕНЫ ССЫЛКИ
      await api.devices.replace(deviceId);
      
      // Обновляем данные устройства
      const devices = await api.devices.getAll();
      const updatedDevice = devices.find((d: any) => d.id === deviceId);
      setDevice(updatedDevice);
      
      toast.success('✅ Новая ссылка сгенерирована!', { 
        id: 'replace',
        duration: 3000,
        icon: '🔗'
      });
      
    } catch (error) {
      toast.error('❌ Ошибка при генерации ссылки', { 
        id: 'replace',
        duration: 3000
      });
    }
  };

  // ✅ СОХРАНЕНИЕ ИМЕНИ
  const handleSaveName = async () => {
    if (!deviceId) return;
    if (!deviceName.trim()) {
      toast.error('Имя не может быть пустым');
      return;
    }

    toast.loading('Сохраняем название...', { 
      id: 'rename',
      icon: '✏️'
    });
    
    try {
      // 👇 РЕАЛЬНЫЙ API ЗАПРОС ДЛЯ ОБНОВЛЕНИЯ ИМЕНИ
      await api.devices.updateName(deviceId, deviceName);
      
      setDevice({ ...device, name: deviceName });
      setIsEditing(false);
      
      toast.success('✅ Название обновлено!', { 
        id: 'rename',
        duration: 2000,
        icon: '✅'
      });
      
    } catch (error) {
      toast.error('❌ Ошибка при сохранении', { 
        id: 'rename',
        duration: 3000
      });
    }
  };

  // ✅ УДАЛЕНИЕ УСТРОЙСТВА ИЗ БД
  const handleDelete = () => {
    if (!deviceId) return;
    
    toast.custom((t: any) => (
      <div className="deleteConfirmCard">
        <div className="deleteConfirmIcon">🗑️</div>
        <div className="deleteConfirmContent">
          <div className="deleteConfirmTitle">Удалить устройство?</div>
          <div className="deleteConfirmDescription">
            Это действие нельзя отменить. Все данные будут потеряны.
          </div>
          <div className="deleteConfirmActions">
            <button 
              className="deleteConfirmCancel"
              onClick={() => toast.dismiss(t.id)}
            >
              Отмена
            </button>
            <button 
              className="deleteConfirmConfirm"
              onClick={async () => {
                toast.dismiss(t.id);
                toast.loading('Удаляем устройство...', { 
                  id: 'delete',
                  icon: '🗑️'
                });
                
                try {
                  // 👇 РЕАЛЬНЫЙ API ЗАПРОС ДЛЯ УДАЛЕНИЯ
                  await api.devices.delete(deviceId);
                  
                  toast.success('✅ Устройство удалено!', { 
                    id: 'delete',
                    duration: 2000,
                    icon: '✅'
                  });
                  
                  // Возвращаемся на главную через секунду
                  setTimeout(() => navigate('/'), 1000);
                  
                } catch (error) {
                  console.error('Delete error:', error);
                  toast.error('❌ Ошибка при удалении', { 
                    id: 'delete',
                    duration: 3000
                  });
                }
              }}
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    ), { 
      duration: Infinity,
      position: 'top-center'
    });
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

      {/* Карточка устройства с редактированием имени */}
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
                placeholder="Введите название"
              />
              <button onClick={handleSaveName} className="saveNameBtn">
                <Check size={18} />
              </button>
            </div>
          ) : (
            <div className="deviceNameDisplay">
              <h2>{device.name}</h2>
              <button onClick={() => setIsEditing(true)} className="editNameBtn">
                <Edit2 size={16} />
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

      {/* Блок с ссылкой и кнопкой замены */}
      <div className="configCard">
        <h3 className="configCardTitle">Конфигурация</h3>
        <p className="configCardDescription">
          Скопируйте ссылку и вставьте в приложение HitProxy или HitVPN
        </p>
        
        <div className="configLinkContainer">
          <code className="configLinkCode">{device.configLink}</code>
          <div className="configActions">
            <button 
              className={`copyLinkBtn ${copied ? 'copied' : ''}`} 
              onClick={handleCopy}
            >
              <Copy size={18} />
              {copied ? 'Скопировано!' : 'Копировать'}
            </button>
            <button 
              className="replaceLinkBtn"
              onClick={handleReplaceLink}
              title="Сгенерировать новую ссылку"
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Кнопка удаления */}
      <div className="deleteCard" onClick={handleDelete}>
        <div className="deleteCardIcon">
          <Trash2 size={24} />
        </div>
        <div className="deleteCardContent">
          <h4>Удалить устройство</h4>
          <p>Это действие нельзя отменить</p>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="deviceInfoFooter">
        <p>Подключено: {device.date || '12.02.26'}</p>
        <p>ID: {deviceId}</p>
      </div>
    </div>
  );
}