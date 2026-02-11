import { Outlet, useLocation } from "react-router-dom";
import Header from "../components/Header";
import TabBar from "../components/TabBar";

export default function Layout() {
  const location = useLocation();

  const titles: Record<string, string> = {
    "/": "VPN",
    "/topup": "Пополнение",
    "/history": "История",
  };

  return (
    <div className="appShell">
      <Header title={titles[location.pathname]} balance={84} />

      <div className="pageContent">
        <Outlet />
      </div>

      <TabBar />
    </div>
  );
}
