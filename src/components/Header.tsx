import { MoreHorizontal } from "lucide-react";

type Props = {
  title: string;
  balance?: number;
};

export default function Header({ title, balance }: Props) {
  return (
    <div className="header">
      <h2 className="headerTitle">{title}</h2>

      <div className="headerRight">
        {balance !== undefined && (
          <p className="headerBalance">{balance} ₽</p>
        )}

        <button className="headerMenu">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
}
