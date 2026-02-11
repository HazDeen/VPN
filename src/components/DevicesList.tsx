import { useState } from "react";
import AddDeviceModal from "./AddDeviceModal";
import DeviceCard from "./DeviceCard";

export default function DevicesList() {
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="card">
      <div className="devicesHeader">
        <div>
          <h3>Мои устройства</h3>
          <p>Подключено: 1</p>
        </div>

        <button className="addBtnPremium" onClick={() => setShowModal(true)}>
          Добавить
        </button>
      </div>

      <DeviceCard
        name="58105716 App (iPhone/iPad)"
        daysLeft={25}
        active={true}
      />

      {showModal && <AddDeviceModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
