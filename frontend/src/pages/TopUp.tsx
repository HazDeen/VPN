import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { useBalance } from '../hooks/useBalance';
import { toast } from 'sonner';

const PRESET_AMOUNTS = [100, 300, 500];

export default function TopUp() {
  const navigate = useNavigate();
  const { balance, refetch: refetchBalance } = useBalance();
  const [selected, setSelected] = useState<number | 'custom'>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    const amount = selected === 'custom' ? Number(customAmount) : selected;
    
    if (!amount || amount < 1) {
      toast.error('Введите корректную сумму');
      return;
    }

    setLoading(true);
    try {
      // ✅ ТЕСТОВАЯ ОПЛАТА - ПРОСТО ПОКАЗЫВАЕМ УВЕДОМЛЕНИЕ
      toast.success(`✅ Баланс пополнен на ${amount} ₽ (тестовый режим)`, {
        icon: '💰',
        duration: 3000,
      });
      
      // Обновляем баланс через рефетч
      await refetchBalance();
      
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('❌ Ошибка пополнения');
    } finally {
      setLoading(false);
    }
  };

  const newBalance = (balance || 0) + (selected === 'custom' ? Number(customAmount) || 0 : selected);

  return (
    <div className="topupPage">
      <div className="topupHeader">
        <button className="backButton" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>Пополнение баланса</h1>
      </div>

      <div className="balancePreview">
        <span className="previewLabel">Баланс после пополнения</span>
        <span className="previewAmount">{newBalance} ₽</span>
      </div>

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

      <div className="infoMessage">
        <p>⚡ Тестовый режим</p>
        <p className="small">Деньги зачисляются без реальной оплаты</p>
      </div>

      <button 
        className="payButton"
        onClick={handlePay}
        disabled={loading || (selected === 'custom' && !customAmount)}
      >
        <CreditCard size={20} />
        {loading ? 'Обработка...' : 'Пополнить'}
      </button>
    </div>
  );
}