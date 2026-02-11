import { useNavigate } from "react-router-dom";

type Props = {
  name: string;
  daysLeft: number;
  active: boolean;
};

export default function DeviceCard({ name, daysLeft, active }: Props) {
    const navigate = useNavigate();
    return (
        <div className="deviceCard">
        <div className="deviceTop">
            <p className="deviceTitle">{name}</p>

            <span className={`status ${active ? "on" : "off"}`}>
            {active ? "Активно" : "Не активно"}
            </span>
        </div>

        <p className="deviceDays">
            Осталось: <b>{daysLeft} дней</b>
        </p>

        <button className="buyBtn" onClick={() => navigate("/topup")}>Купить подписку</button>
        </div>
    );
    }
