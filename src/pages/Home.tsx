import BalanceCard from "../components/BalanceCard";
import DevicesList from "../components/DevicesList";
import { useNavigate } from "react-router-dom";
import { CreditCard, Clock } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container">
      {/* Баланс */}
      <BalanceCard balance={84} days={25} />

      {/* Кнопки (новый стиль) */}
      <div className="actionsRow">
        <button
          className="actionBtnSmall"
          onClick={() => navigate("/topup")}
        >
          <CreditCard size={18} />
          Пополнить
        </button>

        <button
          className="actionBtnSmall"
          onClick={() => navigate("/history")}
        >
          <Clock size={18} />
          История
        </button>
      </div>

      {/* Устройства */}
      <DevicesList />
    </div>
  );
}
