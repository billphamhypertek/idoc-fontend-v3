"use client";

interface StatisticCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  borderColor: string;
  iconBgColor: string;
  iconColor: string;
}

export default function StatisticCard({
  title,
  value,
  icon,
  borderColor,
  iconBgColor,
  iconColor,
}: StatisticCardProps) {
  return (
    <div className="relative bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] border-0 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: borderColor }}
      />

      <div className="flex items-center justify-between p-5 pl-6">
        <div className="flex flex-col">
          <div className="text-xs text-[#6b7280]">{title}</div>
          <div className="text-[28px] font-bold text-[#111827] leading-tight">
            {value}
          </div>
        </div>
        <div
          className="flex items-center justify-center rounded-xl"
          style={{
            backgroundColor: iconBgColor,
            width: "40px",
            height: "40px",
          }}
        >
          <div style={{ color: iconColor, fontSize: "20px" }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
