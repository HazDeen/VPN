import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();

  const history = [
    {
      date: "7 февраля",
      title: "Заменено устройство",
      time: "09:45",
      amount: null,
      icon: "🔄",
    },
    {
      date: "6 февраля",
      title: "Пополнение счёта",
      time: "09:00",
      amount: "+100 ₽",
      icon: "💳",
    },
    {
      date: "10 января",
      title: "Заменено устройство",
      time: "10:45",
      amount: null,
      icon: "🔄",
    },
    {
      date: "5 января",
      title: "Пополнение счёта",
      time: "04:10",
      amount: "+100 ₽",
      icon: "💳",
    },
  ];

  return (
    <div className="container">
      {/* Верх */}
      <div className="topBar">
        <button className="backLink" onClick={() => navigate("/")}>
          ← Назад
        </button>

        <div className="miniBalance">
          Баланс <b>84 ₽</b>
        </div>
      </div>

      <h1 className="pageTitle">История платежей</h1>

      {/* Лента */}
      <div className="historyList">
        {history.map((item, i) => (
          <div key={i}>
            <p className="historyDate">{item.date}</p>

            <div className="historyItem">
              <div className="historyIcon">{item.icon}</div>

              <div className="historyInfo">
                <p className="historyTitle">{item.title}</p>
                <p className="historyTime">{item.time}</p>
              </div>

              {item.amount && (
                <p className="historyAmount">{item.amount}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
