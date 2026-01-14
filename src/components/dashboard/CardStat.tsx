import AnimatedNumber from "./AnimatedNumber";
import { cn } from "@/lib/utils";

interface CardStatProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string; // Thêm prop cho text bên dưới value
  bg: string;
  titleColor: string;
  value: number | string;
  valueClass?: string;
  detail?: { label: string; value: number | string; valueClass?: string }[];
}

export function CardStat({
  icon,
  title,
  subtitle,
  bg,
  titleColor,
  value,
  valueClass,
  detail,
}: CardStatProps) {
  return (
    <div className={cn(bg, "rounded-2xl shadow p-7 flex flex-col h-full")}>
      {/* Header với icon và title */}
      <div className={cn("flex items-center gap-2 mb-4")}>
        {icon}
        <span className={cn("text-2xl font-semibold", titleColor)}>
          {title}
        </span>
      </div>

      {/* Value section - cố định vị trí */}
      <div className={cn("flex flex-col items-center mb-4", valueClass)}>
        <AnimatedNumber value={value} />
        {subtitle && (
          <div className={cn("mt-2 text-sm font-medium text-gray-600")}>
            {subtitle}
          </div>
        )}
      </div>

      {/* Detail section - cố định theo top */}
      <div className={cn("mt-4")}>
        {detail && (
          <div className={cn("space-y-1")}>
            {detail.map((d, idx) => (
              <div key={idx} className={cn("flex justify-between text-sm")}>
                <span className={cn("text-gray-500")}>{d.label}</span>
                <span className={cn(d.valueClass)}>{d.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
