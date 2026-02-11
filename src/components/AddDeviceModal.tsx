type Props = {
  onClose: () => void;
};

export default function AddDeviceModal({ onClose }: Props) {
  return (
    <div className="modalOverlay">
      <div className="modalCard">
        <h3>Добавить устройство</h3>

        <input
          className="input"
          placeholder="Название устройства (например iPhone)"
        />

        <button className="modalBtn">Добавить</button>
        <button className="modalClose" onClick={onClose}>
          Отмена
        </button>
      </div>
    </div>
  );
}
