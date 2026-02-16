import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useBalance } from '../hooks/useBalance';
import { useDevices } from '../hooks/useDevices';
import { useAuth } from '../context/AuthContext';
import BalanceCard from "../components/BalanceCard";
import DevicesCard from "../components/DevicesCard";
import ActionButtons from "../components/ActionButtons";
import AddDeviceModal from "../components/AddDeviceModal";
import { Moon, Sun, LogOut } from 'lucide-react'; // 👈 ДОБАВИЛИ LogOut
import { useTheme } from '../context/ThemeContext';
import type { DeviceType } from '../types/device';

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { addDevice } = useDevices();
  const { refetch: refetchBalance } = useBalance();
  const { logout } = useAuth(); // 👈 ДОБАВИЛИ logout
  const { theme, toggleTheme } = useTheme();

  const handleAddDevice = async (name: string, type: DeviceType, customName: string) => {
    try {
      await addDevice(name, customName, type);
      setShowAddModal(false);
      refetchBalance();
    } catch (error: any) {
      // ошибка показывается в AddDeviceModal через toast
    }
  };

  const handleLogout = () => {
    logout(); // Выход из аккаунта
  };

  return (
    <div className="container">
      <div className="homeHeader">
        <h1 className="screenTitle">VPN</h1>
        <div className="headerButtons">
          <button className="logoutButton" onClick={handleLogout} title="Выйти">
            <LogOut size={22} />
          </button>
          <button className="themeButton" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>
      </div>
            
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