import type { ReactNode } from "react";


type Props = {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
};

export default function Button({
  children,
  onClick,
  variant = "secondary",
}: Props) {
  return (
    <button className={`uiBtn ${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
