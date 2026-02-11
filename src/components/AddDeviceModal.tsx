import { motion } from "framer-motion";
import Button from "../ui/Button";

type Props = {
  onClose: () => void;
};

export default function AddDeviceModal({ onClose }: Props) {
  return (
    <div className="sheetOverlay" onClick={onClose}>
      <motion.div
        className="sheet"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 400 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h3 className="sheetTitle">Добавить устройство</h3>

        <input className="sheetInput" placeholder="Например: iPhone 15" />

        <Button variant="primary">Добавить</Button>
        <Button onClick={onClose}>Отмена</Button>
      </motion.div>
    </div>
  );
}
