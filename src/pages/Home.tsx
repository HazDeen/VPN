import BalanceCard from "../components/BalanceCard";
import ActionButtons from "../components/ActionButtons";
import DevicesList from "../components/DevicesList";

export default function Home() {
  return (
    <div className="container">
      <BalanceCard balance={84} days={25} />
      <ActionButtons />
      <DevicesList />
    </div>
  );
}
