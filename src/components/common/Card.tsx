import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`rounded-xl bg-bg-card p-6 shadow-sm ${className}`.trim()}>
      {children}
    </div>
  );
}
