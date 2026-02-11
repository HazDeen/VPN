import { Smartphone } from "lucide-react";

type Props = {
  name: string;
  date: string;
};

export default function DeviceItem({ name, date }: Props) {
  return (
    <div className="deviceRow">
      <div className="deviceIcon">
        <Smartphone size={20} />
      </div>

      <div className="deviceText">
        <p className="deviceName">{name}</p>
        <p className="deviceDate">{date}</p>
      </div>
    </div>
  );
}
