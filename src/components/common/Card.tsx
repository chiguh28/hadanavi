import type { ReactNode, MouseEventHandler } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-bg-card p-6 shadow-sm ${className}`.trim()}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
