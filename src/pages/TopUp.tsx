import { useState } from "react";

export default function TopUp() {
  const [selected, setSelected] = useState(100);

  const amounts = [100, 200, 300, 400, 500, 700, 800, 900, 1000];

  return (
    <div className="container">
      {/* Верхняя панель */}
      <div className="topBar">

        
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
