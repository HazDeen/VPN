import { NavLink } from "react-router-dom";
import { Home, CreditCard, Clock } from "lucide-react";

export default function TabBar() {
  return (
    <div className="tabbar">
      <NavLink to="/" className="tabItem">
        <Home size={20} />
        <span>Главная</span>
      </NavLink>

      <NavLink to="/topup" className="tabItem">
        <CreditCard size={20} />
        <span>Оплата</span>
      </NavLink>

      <NavLink to="/history" className="tabItem">
        <Clock size={20} />
        <span>История</span>
      </NavLink>
    </div>
  );
}
