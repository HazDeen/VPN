import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useBalance } from '../hooks/useBalance';
import { useDevices } from '../hooks/useDevices';
import { useAuth } from '../context/AuthContext';
import BalanceCard from "../components/BalanceCard";
import DevicesCard from "../components/DevicesCard";
import ActionButtons from "../components/ActionButtons";
import AddDeviceModal from "../components/AddDeviceModal";
import { Moon, Sun, LogOut, Shield } from 'lucide-react'; // 👈 ДОБАВИЛИ Shield
import { useTheme } from '../context/ThemeContext';
import type { DeviceType } from '../types/device';

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { addDevice } = useDevices();
  const { refetch: refetchBalance } = useBalance();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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
    logout();
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  return (
    <div className="container">
      <div className="homeHeader">
        <h1 className="screenTitle">VPN</h1>
        <div className="headerButtons">
          {/* 👇 КНОПКА АДМИНКИ - ТОЛЬКО ДЛЯ АДМИНОВ */}
          {user?.isAdmin && (
            <button className="adminButton" onClick={handleAdminClick} title="Админ-панель">
              <Shield size={22} />
            </button>
          )}
          
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