import { useNavigate } from 'react-router-dom';
import { Smartphone, Laptop, Monitor, Cpu, ChevronRight } from 'lucide-react';
import type { DeviceType } from '../types/device';

type Props = {
  id: number;
  name: string;
  model: string;
  type: DeviceType;
  date: string;
  isActive: boolean;
  configLink: string;
  daysLeft: number;
};

const getDeviceIcon = (type: DeviceType) => {
  switch (type) {
    case 'iPhone':
    case 'Android':
      return Smartphone;
    case 'Mac':
      return Laptop;
    case 'PC':
      return Monitor;
    case 'Other':
      return Cpu;
    default:
      return Smartphone;
  }
};

export default function DeviceCard({ id, name, model, type, date, isActive }: Props) {
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
            <span className="deviceName">{name}</span>
            <span className="deviceOriginalName">{model}</span>
          </div>
          {isActive ? (
            <span className="activeDot" />
          ) : (
            <span className="inactiveDot" />
          )}
        </div>
        <span className="deviceDate">{date}</span>
      </div>
      
      <ChevronRight size={20} className="deviceChevron" />
    </div>
  );
}