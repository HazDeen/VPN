type Props = {
  balance: number;
  days: number;
};

export default function BalanceCard({ balance, days }: Props) {
  return (
    <div className="card center">
      <p className="title">Баланс</p>
      <h1 className="balance">
        {balance} <span>₽</span>
      </h1>
      <p className="subtitle">Хватит на ≈{days} дней</p>
    </div>
  );
}
