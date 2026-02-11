// components/DeviceCard.tsx
import { useNavigate } from 'react-router-dom';
import { Smartphone, Laptop, Monitor, Cpu, ChevronRight } from 'lucide-react';

type Props = {
  id: number;
  name: string;
  customName?: string;
  type: 'iPhone' | 'Android' | 'Mac' | 'PC' | 'Other';
  date: string;
  isActive: boolean;
};

const getDeviceIcon = (type: Props['type']) => {
  switch (type) {
    case 'iPhone':
    case 'Android':
      return Smartphone;
    case 'Mac':
      return Laptop;
    case 'PC':
      return Monitor;
    default:
      return Cpu;
  }
};

export default function DeviceCard({ id, name, customName, type, date, isActive }: Props) {
  const navigate = useNavigate();
  const Icon = getDeviceIcon(type);

  return (
    <div 
      className="deviceCard" 
      onClick={() => navigate(`/device/${id}`)}
    >
      <div className="deviceIcon">
        <Icon size={22} />
      </div>
      
      <div className="deviceInfo">
        <div className="deviceNameRow">
          <div className="deviceNameWrapper">
            <span className="deviceName">{customName || name}</span>
            {/* ТОЧКА ТУТ — СРАЗУ ПОСЛЕ НАЗВАНИЯ */}
            {isActive ? (
              <span className="activeDot" />
            ) : (
              <span className="inactiveDot" />
            )}
          </div>
          <span className="deviceOriginalName">{name}</span>
        </div>
        <span className="deviceDate">{date}</span>
      </div>
      
      <ChevronRight size={20} className="deviceChevron" />
    </div>
  );
}