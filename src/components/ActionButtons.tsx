import { useNavigate } from "react-router-dom";

export default function ActionButtons() {
  const navigate = useNavigate();

  return (
    <div className="actions">
      <button className="btn" onClick={() => navigate("/topup")}>
        ➕ Пополнить
      </button>

      <button className="btn" onClick={() => navigate("/history")}>
        🕒 История
      </button>
    </div>
  );
}
