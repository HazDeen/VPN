// pages/Home.tsx
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BalanceCard from "../components/BalanceCard";
import DevicesCard from "../components/DevicesCard";
import ActionButtons from "../components/ActionButtons";
import AddDeviceModal from "../components/AddDeviceModal";

export default function Home() {
  const [showAddModal, setShowAddModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleAddDevice = (name: string, type: string, customName: string) => {
    console.log('Добавляем устройство:', { name, type, customName });
    setShowAddModal(false);
  };

  return (
    <div className="container">
      {/* Хедер с кнопкой темы */}
      <div className="homeHeader">
        <h1 className="screenTitle">VPN</h1>
        <button className="themeButton" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
        </button>
      </div>
      
      <BalanceCard balance={84} days={25} />
      
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