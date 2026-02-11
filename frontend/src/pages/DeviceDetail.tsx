// pages/DeviceDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy } from 'lucide-react';
import { useState } from 'react';

export default function DeviceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [deviceName, setDeviceName] = useState('Моя мобилка');

  console.debug('Device ID:', id);

  const device = {
    model: 'iPhone 13',
    fullName: '58105716 App (iPhone/iPad)',
    configLink: 'https://hvpn.io/ATUwTfqUrhrudNUCU6kFBzC...'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(device.configLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="deviceDetailPage">
      <div className="detailHeader">
        <button className="backButton" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Настройте устройство</h1>
      </div>

      <div className="deviceNameCenter">
        <div className="deviceCustomName">{deviceName}</div>
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
            {copied ? 'Скопировано' : 'Скопировать ссылку'}
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
        />
      </div>

      <div className="settingsBlock warning">
        <div className="sectionHeader">Перестал работать VPN?</div>
        <div className="sectionDescription">
          Попробуйте заменить настройки устройства
        </div>
        <button className="replaceButton">
          Заменить
        </button>
      </div>

      <div className="settingsBlock delete">
        <div className="sectionDescription">
          Если вы не используете настройки VPN данного устройства
        </div>
        <button className="deleteButton">
          Удалить
        </button>
      </div>
    </div>
  );
}