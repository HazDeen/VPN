// components/AddDeviceModal.tsx
import { motion } from "framer-motion";
import { useState } from "react";
import { Smartphone, Laptop, Monitor, Cpu, Plus, X } from "lucide-react";

type Props = {
  onClose: () => void;
  onAdd?: (deviceName: string, deviceType: string, customName: string) => void;
};

const DEVICE_TYPES = [
  { id: "iPhone", label: "iPhone", icon: Smartphone },
  { id: "Android", label: "Android", icon: Smartphone },
  { id: "Mac", label: "Mac", icon: Laptop },
  { id: "PC", label: "PC", icon: Monitor },
  { id: "Other", label: "Другое", icon: Cpu },
];

export default function AddDeviceModal({ onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [customName, setCustomName] = useState("");
  const [selectedType, setSelectedType] = useState("iPhone");
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (onAdd) {
      onAdd(name, selectedType, customName);
    }
    handleClose();
  };

  return (
    <motion.div 
      className="modalOverlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClose}
    >
      <div className="modalBackdrop" />
      
      <motion.div
        className="modalSheet"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: "100%" }}
        animate={{ y: isClosing ? "100%" : 0 }}
        transition={{ 
          type: "spring", 
          damping: 30, 
          stiffness: 300,
          mass: 1
        }}
      >
        <motion.div 
          className="modalHandle" 
          onClick={handleClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        />
        
        <h2 className="modalTitle">Добавить новое устройство</h2>

        <div className="modalDescription">
          <p className="modalPrice">
            Стоимость 300 ₽/мес за каждое дополнительное устройство.
          </p>
          <p className="modalNote">
            Вы сможете удалить это устройство через 24 часа.
          </p>
        </div>

        <div className="modalField">
          <label className="modalLabel">
            Название устройства <span className="modalLabelHint">(как оно будет отображаться)</span>
          </label>
          <input
            className="modalInput"
            placeholder="Например: Моя мобилка"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            autoFocus
          />
        </div>

        <div className="modalField">
          <label className="modalLabel">Модель устройства</label>
          <input
            className="modalInput"
            placeholder="Например: iPhone 13"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="deviceTypeSelector">
          <label className="modalLabel">Тип устройства</label>
          <div className="deviceTypeGrid">
            {DEVICE_TYPES.map((type) => {
              const Icon = type.icon;
              return (
                <motion.button
                  key={type.id}
                  className={`deviceTypeBtn ${selectedType === type.id ? "active" : ""}`}
                  onClick={() => setSelectedType(type.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon size={24} />
                  <span>{type.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* КНОПКИ В ОДНУ ЛИНИЮ */}
        <div className="modalActionsRow">
          <motion.button
            className="modalSubmitBtn"
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <Plus size={18} />
            Добавить за 300 ₽
          </motion.button>
          
          <motion.button
            className="modalCancelBtn"
            onClick={handleClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            <X size={18} />
            Отмена
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}