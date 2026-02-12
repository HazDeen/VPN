import { useBalance } from '../hooks/useBalance';
import { useAuth } from '../context/AuthContext';

export default function BalanceCard() {
  const { balance, daysLeft, loading } = useBalance();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="balanceContainer">
        <div className="balanceAmount">...</div>
        <div className="balanceHint">Загрузка...</div>
      </div>
    );
  }

  // Если баланс 0, но у пользователя есть баланс - показываем его
  const displayBalance = balance === 0 && user?.balance ? user.balance : balance;
  const displayDays = daysLeft === 0 && user?.balance ? 30 : daysLeft;

  return (
    <div className="balanceContainer">
      <div className="balanceAmount">{displayBalance} ₽</div>
      <div className="balanceHint">Хватит на ≈{displayDays} дней</div>
    </div>
  );
}