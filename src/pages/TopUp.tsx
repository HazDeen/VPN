import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TopUp() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(100);

  const amounts = [100, 200, 300, 400, 500, 700, 800, 900, 1000];

  return (
    <div className="container">
      {/* Верхняя панель */}
      <div className="topBar">

        <div className="miniBalance">
          Баланс <b>84 ₽</b>
        </div>
      </div>

      {/* Заголовок */}
      <h1 className="pageTitle">Пополнение баланса</h1>
      <p className="pageSubtitle">
        Зачисление средств может занять до 15 минут!
      </p>

      {/* Карточка */}
      <div className="card payCard">
        <h2 className="bigAmount">{selected} ₽</h2>
        <p className="subtitle">Выберите сумму</p>

        {/* Сетка */}
        <div className="amountGrid">
          {amounts.map((a) => (
            <button
              key={a}
              className={`amountBtn ${selected === a ? "active" : ""}`}
              onClick={() => setSelected(a)}
            >
              {a} ₽
            </button>
          ))}
        </div>

        <p className="hintText">
          Пополнение баланса является разовой операцией (не подписка). Мы не
          имеем доступа к вашим платежным данным.
        </p>

        {/* Кнопка оплаты */}
        <button className="payBtn">
          Выбрать способ оплаты
        </button>
      </div>
    </div>
  );
}
