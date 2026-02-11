import { useNavigate } from 'react-router-dom';
import { PlusCircle, Clock } from 'lucide-react';

export default function ActionButtons() {
  const navigate = useNavigate();

  return (
    <div className="actionsRow">
      <button className="actionBtnSmall" onClick={() => navigate('/topup')}>
        <PlusCircle size={20} />
        Пополнить
      </button>
      <button className="actionBtnSmall" onClick={() => navigate('/history')}>
        <Clock size={20} />
        История
      </button>
    </div>
  );
}