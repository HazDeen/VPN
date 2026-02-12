// pages/TopUp.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useBalance } from '../hooks/useBalance';

const PRESET_AMOUNTS = [100, 300, 500];

export default function TopUp() {
  const navigate = useNavigate();
  const { balance } = useBalance();
  const [selected, setSelected] = useState<number | 'custom'>(100);
  const [customAmount, setCustomAmount] = useState('');

  const handlePay = () => {
    const amount = selected === 'custom' ? Number(customAmount) : selected;
    console.log('Оплата:', amount);
  };

  const currentBalance = typeof balance === 'number' ? balance : 0;
  const newBalance = currentBalance + (selected === 'custom' ? Number(customAmount) || 0 : selected);

  return (
    <div className="topupPage">
      <div className="topupHeader">
        <button className="backButton" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Пополнение баланса</h1>
      </div>

      <div className="topupContent">
        {/* Блок с балансом */}
        <div className="balancePreview">
          <span className="previewLabel">Баланс после пополнения</span>
          <span className="previewAmount">{newBalance} ₽</span>
        </div>

        {/* Выбор суммы */}
        <div className="amountSelector">
          <p className="selectorTitle">Выберите сумму</p>
          
          <div className="amountGrid">
            {PRESET_AMOUNTS.map((amount) => (
              <button
                key={amount}
                className={`amountChip ${selected === amount ? 'active' : ''}`}
                onClick={() => setSelected(amount)}
              >
                {amount} ₽
              </button>
            ))}
          </div>

          <button
            className={`customChip ${selected === 'custom' ? 'active' : ''}`}
            onClick={() => setSelected('custom')}
          >
            Другое
          </button>

          {selected === 'custom' && (
            <input
              type="number"
              className="customAmountInput"
              placeholder="Введите сумму"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              autoFocus
            />
          )}
        </div>

        {/* КРАСИВЫЙ БЛОК С КОММЕНТАРИЕМ */}
        <div className="infoCard">
          <div className="infoIcon">ℹ️</div>
          <div className="infoText">
            <p className="infoMain">Пополнение баланса является разовой операцией (не подписка).</p>
            <p className="infoSecondary">Мы не имеем доступа к вашим платежным данным.</p>
          </div>
        </div>

        {/* Кнопка оплаты */}
        <button 
          className="payButton"
          onClick={handlePay}
          disabled={selected === 'custom' && !customAmount}
        >
          <CreditCard size={20} />
          Выбрать способ оплаты
        </button>
      </div>
    </div>
  );
}