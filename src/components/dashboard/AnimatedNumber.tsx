import React from "react";
import { cn } from "@/lib/utils";
interface AnimatedNumberProps {
  value: number | string;
  className?: string;
  duration?: number; // ms
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  className = "",
  duration = 800,
}) => {
  const [display, setDisplay] = React.useState(0);
  const prevValue = React.useRef<number>(0);
  React.useEffect(() => {
    const start = prevValue.current;
    let end =
      typeof value === "number" ? value : parseFloat(value as string) || 0;
    if (isNaN(end)) end = 0;
    // Nếu value thay đổi đột ngột, cập nhật prevValue.current
    if (start !== end) prevValue.current = start;
    const diff = end - start;
    if (diff === 0) {
      setDisplay(end);
      prevValue.current = end;
      return;
    }
    const steps = Math.max(20, Math.floor(duration / 16));
    let current = 0;
    const stepValue = diff / steps;
    const interval = setInterval(() => {
      current++;
      const next = start + stepValue * current;
      if (
        (diff > 0 && next >= end) ||
        (diff < 0 && next <= end) ||
        current >= steps
      ) {
        setDisplay(end);
        clearInterval(interval);
        prevValue.current = end;
      } else {
        setDisplay(next);
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [value, duration]);
  return (
    <span className={cn(className)}>
      {typeof value === "string"
        ? value
        : Math.round(display).toLocaleString("vi-VN")}
    </span>
  );
};

export default AnimatedNumber;
