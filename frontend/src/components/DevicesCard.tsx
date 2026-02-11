
import { Plus } from "lucide-react";
import DeviceCard from "./DeviceCard";


type Props = {
  onAddClick: () => void; // делаем обязательным
};

const MOCK_DEVICES = [
  {
    id: 1,
    name: 'iPhone 13',
    customName: 'Моя мобилка',
    type: 'iPhone' as const,
    date: '12.02.26',
    isActive: true,
  }
];

export default function DevicesCard({ onAddClick }: Props) {
  const devices = MOCK_DEVICES;

  return (
    <div className="devicesCard">
      {/* Хедер карточки */}
      <div className="devicesCardHeader">
        <div className="devicesCardTitle">
          <h3 className="sectionTitle">Мои устройства</h3>
          <span className="devicesCount">{devices.length}</span>
        </div>
        <button className="addButton" onClick={onAddClick}>
          <Plus size={18} />
          Добавить
        </button>
      </div>

      {/* Список устройств */}
      <div className="devicesList">
        {devices.map(device => (
          <DeviceCard 
            key={device.id} 
            {...device} 
          />
        ))}
      </div>

      {/* Информация о тарифе */}
      <div className="tariffInfo">
        Тариф 300 ₽/мес за одно устройство
      </div>
    </div>
  );
}