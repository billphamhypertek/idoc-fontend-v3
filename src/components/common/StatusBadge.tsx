"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusBadgeStyle } from "@/utils/status-colors.utils";

type Props = {
  status: string;
  className?: string;
};

export default function StatusBadge({ status, className }: Props) {
  const statusConfig: Record<
    string,
    { variant: "outline"; className: string; style?: React.CSSProperties }
  > = {
    "Chờ duyệt": {
      variant: "outline",
      className:
        "text-yellow-700 border-yellow-300 bg-yellow-100 rounded-md px-2 py-1",
    },
    "Đã duyệt": {
      variant: "outline",
      className:
        "text-green-700 border-green-300 bg-green-100 rounded-md px-2 py-1",
    },
    "Đang xử lý": {
      variant: "outline",
      className: "rounded-md px-2 py-1 border",
      style: getStatusBadgeStyle("Đang xử lý"),
    },
    "Trả lại": {
      variant: "outline",
      className: "rounded-md px-2 py-1 border",
      style: getStatusBadgeStyle("Trả lại"),
    },
    "Quá hạn": {
      variant: "outline",
      className: "rounded-md px-2 py-1 border",
      style: getStatusBadgeStyle("Quá hạn"),
    },
    "Từ chối": {
      variant: "outline",
      className: "text-red-700 border-red-300 bg-red-100 rounded-md px-2 py-1",
    },
    "Hoàn thành": {
      variant: "outline",
      className:
        "text-gray-700 border-gray-300 bg-gray-100 rounded-md px-2 py-1",
    },
    "Tạo mới": {
      variant: "outline",
      className:
        "text-white border-[#4798e8] bg-[#4798e8] rounded-md px-2 py-1",
    },
  };

  const config = statusConfig[status] || statusConfig["Chờ duyệt"];

  return (
    <span
      className={cn(
        "inline-flex items-center text-xs font-medium border whitespace-nowrap",
        config.className,
        className
      )}
      style={config.style}
    >
      {status}
    </span>
  );
}
