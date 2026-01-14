import React from "react";
import { cn } from "@/lib/utils";

interface Theme {
  bg?: string;
  titleColor?: string;
  iconColor?: string;
  valueColor?: string;
  subLabelColor?: string;
  itemValueColors?: string[];
}

interface ThemedStatCardProps {
  theme: Theme;
  icon?: React.ReactNode;
  title: string;
  value: number | string;
  subItems?: { label: string; value: number | string }[];
}

export const ThemedStatCard = ({
  theme,
  icon,
  title,
  value,
  subItems,
}: ThemedStatCardProps) => {
  return (
    <div
      className={cn("rounded-xl bg-white border border-gray-200 shadow-lg p-4")}
      style={{ background: theme.bg }}
    >
      <div className={cn("flex flex-col space-y-1.5")}>
        <div
          className={cn(
            "h4 font-semibold leading-none tracking-tight flex items-center gap-2 text-[18px]"
          )}
          style={{ color: theme.titleColor }}
        >
          <span className={cn("w-4 h-4")} style={{ color: theme.iconColor }}>
            {icon}
          </span>
          {title}
        </div>
      </div>
      <div className={cn("space-y-1 p-0 mt-3")}>
        <div className={cn("text-center mb-2")}>
          <span
            className={cn("text-3xl font-bold")}
            style={{ color: theme.valueColor }}
          >
            {value}
          </span>
        </div>
        {subItems && (
          <div className={cn("space-y-1 text-sm")}>
            {subItems.map((it, idx) => (
              <div key={idx} className={cn("flex justify-between")}>
                <span style={{ color: theme.subLabelColor }}>{it.label}</span>
                <span
                  className={cn("font-medium")}
                  style={{
                    color: theme.itemValueColors?.[idx] ?? theme.valueColor,
                  }}
                >
                  {it.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
