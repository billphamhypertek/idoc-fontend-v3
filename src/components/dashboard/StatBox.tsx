import { cn } from "@/lib/utils";
import React from "react";

interface StatBoxProps {
  color: "green" | "blue" | "yellow" | "orange";
  value: number;
  label: string;
  className?: string;
  valueClass?: string;
}

const StatBox: React.FC<StatBoxProps> = ({
  color,
  value,
  label,
  className,
  valueClass,
}) => {
  const [display, setDisplay] = React.useState(0);
  const ref = React.useRef<number>(0);
  React.useEffect(() => {
    ref.current = 0;
    const step = Math.max(1, Math.floor(value / 30));
    const interval = setInterval(() => {
      ref.current += step;
      if (ref.current >= value) {
        setDisplay(value);
        clearInterval(interval);
      } else {
        setDisplay(ref.current);
      }
    }, 12);
    return () => clearInterval(interval);
  }, [value]);
  const colorMap = {
    green: "bg-green-50 text-green-700 border-green-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
    orange: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return (
    <div
      className={cn(
        `rounded-xl border shadow p-3 flex items-center justify-center transition hover:scale-105 hover:shadow-lg ${colorMap[color]} ${className || ""}`
      )}
    >
      <span
        className={cn(
          valueClass
            ? valueClass
            : "text-3xl font-extrabold animate-pulse !text-black"
        )}
      >
        {display.toLocaleString("vi-VN")}
      </span>
      <span className={cn("font-bold ml-2 !text-black")}>{label}</span>
    </div>
  );
};

export default StatBox;
