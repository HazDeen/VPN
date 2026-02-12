import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, RefreshCw, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useDevices } from '../hooks/useDevices';
import { toast } from 'sonner';

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deleteDevice, replaceDevice, updateDeviceName } = useDevices();
  const [copied, setCopied] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        toast.error('Не удалось загрузить устройство', {icon: '❌'});
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
      toast.success('Ссылка скопирована!', {
        icon: '🔗',
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReplace = async () => {
    toast.loading('Обновляем настройки...', { id: 'replace',  icon: '⏳', });
    try {
      await replaceDevice(Number(id));
      const devices = await api.devices.getAll();
      const updatedDevice = devices.find((d: any) => d.id === Number(id));
      setDevice(updatedDevice);
      
      toast.success('Настройки успешно обновлены!', {
        id: 'replace',
        duration: 3000,
        icon: '✅',
      });
    } catch (error) {
      console.error('Failed to replace device:', error);
      toast.error('Не удалось обновить настройки', {
        id: 'replace',
        icon: '❌',
        duration: 3000,
      });
    }
  };

  const handleDelete = async () => {
    // 👇 ИСПОЛЬЗУЕМ any ВМЕСТО Toast, ТАК КАК ТИП НЕ НУЖЕН
    toast.custom((t: any) => (
      <div className="deleteConfirmToast">
        <div className="deleteConfirmIcon">🗑️</div>
        <div className="deleteConfirmContent">
          <div className="deleteConfirmTitle">Удалить устройство?</div>
          <div className="deleteConfirmDescription">
            Это действие нельзя отменить
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
                toast.loading('Удаляем устройство...', { id: 'delete' });

                try {
                  await deleteDevice(Number(id));
                  toast.success('Устройство удалено', {
                    id: 'delete',
                    duration: 3000,
                    icon: '✅',
                  });
                  setTimeout(() => navigate('/'), 1000);
                } catch (error) {
                  console.error('Failed to delete device:', error);
                  toast.error('Не удалось удалить устройство', {
                    id: 'delete',
                    icon: '❌',
                    duration: 3000,
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
      position: 'top-center',
    });
  };

    // ✅ СОХРАНЕНИЕ ПО ENTER
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Предотвращаем отправку формы
      e.currentTarget.blur(); // Убираем фокус с инпута
      await handleUpdateName(); // Сохраняем название
    }
  };

  // ✅ СОХРАНЕНИЕ НАЗВАНИЯ (общее для onBlur и Enter)
  const handleUpdateName = async () => {
    if (!deviceName.trim()) {
      setDeviceName(device.name); // Восстанавливаем старое название
      toast.error('Название не может быть пустым');
      return;
    }

    if (deviceName === device.name) return;
    
    toast.loading('Сохраняем название...', { id: 'rename' });
    try {
      await updateDeviceName(Number(id), deviceName);
      const devices = await api.devices.getAll();
      const updatedDevice = devices.find((d: any) => d.id === Number(id));
      setDevice(updatedDevice);
      toast.success('Название обновлено', {
        id: 'rename',
        duration: 2000,
        icon: '✅',
      });
    } catch (error) {
      console.error('Failed to update device name:', error);
      toast.error('Не удалось обновить название', {
        id: 'rename',
        icon: '❌',
        duration: 3000,
      });
      setDeviceName(device.name);
    }
  };

  if (loading) {
    return <div className="deviceDetailPage">Загрузка...</div>;
  }

  if (!device) {
    return <div className="deviceDetailPage">Устройство не найдено</div>;
  }

  return (
    <div className="deviceDetailPage">
      <div className="detailHeader">
        <button className="backButton" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Настройте устройство</h1>
      </div>

      <div className="deviceNameCenter">
        <div className="deviceCustomName">{device.name}</div>
        <div className="deviceModelName">{device.model}</div>
      </div>

      <div className="configSection">
        <div className="configLinkBox">
          <span className="configLink">{device.configLink}</span>
          <button 
            className={`copyButton ${copied ? 'copied' : ''}`} 
            onClick={handleCopy}
          >
            <Copy size={18} />
            {copied ? 'Скопировано!' : 'Скопировать ссылку'}
          </button>
        </div>
      </div>

      <div className="settingsBlock">
        <div className="sectionHeader">НАЗВАНИЕ УСТРОЙСТВА</div>
        <input
          className="sectionInput"
          type="text"
          placeholder="Например, Мой iPhone, iPad дочки"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          onBlur={handleUpdateName}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>

      <div className="settingsBlock warning">
        <div className="sectionHeader">Перестал работать VPN?</div>
        <div className="sectionDescription">
          Попробуйте заменить настройки устройства
        </div>
        <button className="replaceButton" onClick={handleReplace}>
          <RefreshCw size={18} />
          Заменить
        </button>
      </div>

      <div className="settingsBlock delete">
        <div className="sectionDescription">
          Если вы не используете настройки VPN данного устройства
        </div>
        <button className="deleteButton" onClick={handleDelete}>
          <Trash2 size={18} />
          Удалить
        </button>
      </div>
    </div>
  );
}