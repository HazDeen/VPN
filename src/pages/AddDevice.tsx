import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddDevice() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  function handleAdd() {
    if (!name.trim()) return;

    alert("Устройство добавлено: " + name);

    navigate("/");
  }

  return (
    <div className="modalWrap">
      <div className="modalCard">
        <h2 className="modalTitle">Добавить устройство</h2>

        <input
          className="modalInput"
          placeholder="Например: iPhone 15"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button className="modalBtn" onClick={handleAdd}>
          Добавить
        </button>

        <button
          className="modalCancel"
          onClick={() => navigate("/")}
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
