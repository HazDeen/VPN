import { useBalance } from '../hooks/useBalance';

export default function BalanceCard() {
  const { balance, daysLeft, loading } = useBalance();

  if (loading) {
    return <div className="balanceContainer">Загрузка...</div>;
  }

  return (
    <div className="balanceContainer">
      <div className="balanceAmount">{balance} ₽</div>
      <div className="balanceHint">Хватит на ≈{daysLeft} дней</div>
    </div>
  );
}