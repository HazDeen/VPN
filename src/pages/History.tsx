// pages/History.tsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowDownCircle, RefreshCw, PlusCircle } from 'lucide-react';

const MOCK_TRANSACTIONS = [
  {
    date: '7 ФЕВРАЛЯ',
    items: [
      { 
        time: '09:45', 
        description: 'Заменено устройство', 
        amount: null, 
        type: 'replace',
        icon: RefreshCw,
        iconColor: '#FF9F0A'
      }
    ]
  },
  {
    date: '6 ФЕВРАЛЯ',
    items: [
      { 
        time: '09:00', 
        description: 'Пополнение счёта', 
        amount: 100, 
        type: 'topup',
        icon: ArrowDownCircle,
        iconColor: '#34C759'
      }
    ]
  },
  {
    date: '10 ЯНВАРЯ',
    items: [
      { 
        time: '10:45', 
        description: 'Заменено устройство', 
        amount: null, 
        type: 'replace',
        icon: RefreshCw,
        iconColor: '#FF9F0A'
      }
    ]
  },
  {
    date: '5 ЯНВАРЯ',
    items: [
      { 
        time: '04:10', 
        description: 'Пополнение счёта', 
        amount: 100, 
        type: 'topup',
        icon: ArrowDownCircle,
        iconColor: '#34C759'
      }
    ]
  }
];

export default function History() {
  const navigate = useNavigate();

  return (
    <div className="historyPage">
      <div className="historyHeader">
        <button className="backButton" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1>История платежей</h1>
        <button className="topupSmallButton" onClick={() => navigate('/topup')}>
          <PlusCircle size={20} />
          <span>84 ₽</span>
        </button>
      </div>

      <div className="transactionsList">
        {MOCK_TRANSACTIONS.map((group, idx) => (
          <div key={idx} className="transactionGroup">
            <div className="transactionDate">{group.date}</div>
            {group.items.map((item, itemIdx) => {
              const Icon = item.icon;
              return (
                <div key={itemIdx} className="transactionRow">
                  <div className="transactionIcon" style={{ background: `${item.iconColor}10` }}>
                    <Icon size={20} color={item.iconColor} />
                  </div>
                  <div className="transactionInfo">
                    <span className="transactionDesc">{item.description}</span>
                    <span className="transactionTime">{item.time}</span>
                  </div>
                  {item.amount && (
                    <span className="transactionAmount positive">
                      +{item.amount} ₽
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}