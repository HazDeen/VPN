import { useState } from "react";
import DeviceItem from "./DeviceItem";
import AddDeviceModal from "./AddDeviceModal";

export default function DevicesList() {
  const [showModal, setShowModal] = useState(false);

  const devices = [
    {
      name: "58105716 App (iPhone/iPad)",
      date: "07.02.26",
    },
  ];

  return (
    <div className="card">
      <div className="devicesHeader">
        <div>
          <h3>Мои устройства</h3>
          <p>Подключено: {devices.length}</p>
        </div>

        <button className="addBtn" onClick={() => setShowModal(true)}>
          Добавить
        </button>
      </div>

      {devices.map((d, i) => (
        <DeviceItem key={i} {...d} />
      ))}

      {showModal && <AddDeviceModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
