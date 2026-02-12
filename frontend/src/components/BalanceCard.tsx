import { useBalance } from '../hooks/useBalance';

export default function BalanceCard() {
  const { balance, daysLeft, loading } = useBalance();

  if (loading) {
    return (
      <div className="balanceContainer">
        <div className="balanceAmount">...</div>
        <div className="balanceHint">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="balanceContainer">
      <div className="balanceAmount">{balance} ₽</div>
      <div className="balanceHint">Хватит на ≈{daysLeft} дней</div>
    </div>
  );
}