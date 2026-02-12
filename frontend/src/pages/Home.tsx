import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useBalance } from '../hooks/useBalance';
import { useDevices } from '../hooks/useDevices';
import BalanceCard from "../components/BalanceCard";
import DevicesCard from "../components/DevicesCard";
import ActionButtons from "../components/ActionButtons";
import AddDeviceModal from "../components/AddDeviceModal";
import type { DeviceType } from '../types/device';

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { addDevice } = useDevices();
  const { refetch: refetchBalance } = useBalance();

  const handleAddDevice = async (name: string, type: DeviceType, customName: string) => {
    try {
      await addDevice(name, customName, type);
      setShowAddModal(false);
      refetchBalance();
    } catch (error) {
      alert('Не удалось добавить устройство');
    }
  };

  return (
    <div className="container">
      <h1 className="screenTitle">VPN</h1>
      
      <BalanceCard />
      
      <ActionButtons />
      
      <DevicesCard onAddClick={() => setShowAddModal(true)} />
      
      <AnimatePresence mode="wait">
        {showAddModal && (
          <AddDeviceModal 
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddDevice}
          />
        )}
      </AnimatePresence>
    </div>
  );
}