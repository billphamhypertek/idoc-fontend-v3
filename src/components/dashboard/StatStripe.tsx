import { cn } from "@/lib/utils";
import React from "react";

interface StatStripeProps {
  value: number | string;
  label: string;
  rightLabel?: string;
  colorClass?: string;
  style?: React.CSSProperties;
}

export const StatStripe = ({
  value,
  label,
  rightLabel,
  colorClass = "border-gray-200",
  style,
}: StatStripeProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-xl px-4 py-3 text-sm border",
        colorClass
      )}
      style={style}
    >
      <div className={cn("flex items-center gap-3")}>
        <div>
          <div className={cn("text-lg font-bold")}>{value}</div>
          <div className={cn("text-sm")}>{label}</div>
        </div>
      </div>
      {rightLabel ? <div className={cn("opacity-80")}>{rightLabel}</div> : null}
    </div>
  );
};
