type Props = {
  balance: number;
  days: number;
};

export default function BalanceCard({ balance, days }: Props) {
  return (
    <div className="balanceContainer">
      <div className="balanceAmount">{balance} ₽</div>
      <div className="balanceHint">Хватит на ≈{days} дней</div>
    </div>
  );
}
