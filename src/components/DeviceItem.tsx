type Props = {
  name: string;
  date: string;
};

export default function DeviceItem({ name, date }: Props) {
  return (
    <div className="deviceItem">
      <div className="icon"></div>

      <div className="info">
        <p className="deviceName">{name}</p>
        <p className="deviceDate">{date}</p>
      </div>
    </div>
  );
}
