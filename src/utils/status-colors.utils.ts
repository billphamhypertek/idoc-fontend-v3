/**
 * Unified Status Colors Configuration
 * Cấu hình màu sắc đồng nhất cho tất cả các trạng thái trong hệ thống
 */

// Màu sắc cho trạng thái xử lý công việc
export const STATUS_COLORS = {
  "Đang xử lý": {
    background: "#fecaca", // red-200
    text: "#991b1b", // red-800
    border: "#fca5a5", // red-300
  },
  "Trả lại": {
    background: "#fef08a", // yellow-200
    text: "#854d0e", // yellow-900
    border: "#fde047", // yellow-300
  },
  "Quá hạn": {
    background: "#dc2626", // red-600
    text: "#ffffff", // white
    border: "#dc2626", // red-600
  },
} as const;

// Màu sắc cho deadline/hạn xử lý
export const DEADLINE_COLORS = {
  "Hạn xử lý không quá 3 ngày": {
    background: "#2563eb", // blue-600
    text: "#ffffff", // white
    border: "#2563eb", // blue-600
  },
  "Hạn xử lý hơn 3 ngày": {
    background: "#000000", // black
    text: "#ffffff", // white
    border: "#000000", // black
  },
  "Quá hạn": {
    background: "#dc2626", // red-600
    text: "#ffffff", // white
    border: "#dc2626", // red-600
  },
} as const;

/**
 * Get status color classes for work status
 */
export const getStatusColorClasses = (status: string): string => {
  const config = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  if (!config) return "bg-gray-100 text-gray-800 border-gray-300";
  return `text-${getColorName(config.text)} border-${getColorName(config.border)}`;
};

/**
 * Get status background color
 */
export const getStatusBgColor = (status: string): string => {
  const config = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  return config?.background || "#f3f4f6";
};

/**
 * Get status text color
 */
export const getStatusTextColor = (status: string): string => {
  const config = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  return config?.text || "#1f2937";
};

/**
 * Get deadline color classes
 */
export const getDeadlineColorClasses = (
  daysLeft: number
): {
  background: string;
  text: string;
  border: string;
  label: string;
} => {
  if (daysLeft < 0) {
    return {
      ...DEADLINE_COLORS["Quá hạn"],
      label: "Quá hạn",
    };
  } else if (daysLeft <= 3) {
    return {
      ...DEADLINE_COLORS["Hạn xử lý không quá 3 ngày"],
      label: "Hạn xử lý không quá 3 ngày",
    };
  } else {
    return {
      ...DEADLINE_COLORS["Hạn xử lý hơn 3 ngày"],
      label: "Hạn xử lý hơn 3 ngày",
    };
  }
};

/**
 * Get deadline badge style
 */
export const getDeadlineBadgeStyle = (
  daysLeft: number
): React.CSSProperties => {
  const colors = getDeadlineColorClasses(daysLeft);
  return {
    backgroundColor: colors.background,
    color: colors.text,
    borderColor: colors.border,
  };
};

/**
 * Get status badge style
 */
export const getStatusBadgeStyle = (status: string): React.CSSProperties => {
  const config = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  if (!config) {
    return {
      backgroundColor: "#f3f4f6",
      color: "#1f2937",
      borderColor: "#d1d5db",
    };
  }
  return {
    backgroundColor: config.background,
    color: config.text,
    borderColor: config.border,
  };
};

/**
 * Helper to convert hex color to Tailwind color name
 */
function getColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    "#991b1b": "red-800",
    "#854d0e": "yellow-900",
    "#ffffff": "white",
    "#000000": "black",
    "#1f2937": "gray-800",
  };
  return colorMap[hex.toLowerCase()] || "gray-600";
}

/**
 * Unified badge component props
 */
export interface StatusBadgeProps {
  status: string;
  className?: string;
}

/**
 * Get unified badge classes
 */
export const getUnifiedBadgeClasses = (status: string): string => {
  const config = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
  if (!config) {
    return "inline-flex items-center px-2 py-1 text-xs font-medium border rounded-md whitespace-nowrap bg-gray-100 text-gray-800 border-gray-300";
  }

  return `inline-flex items-center px-2 py-1 text-xs font-medium border rounded-md whitespace-nowrap`;
};

export const getStatusColor = (status: string) => {
  const colorMap = {
    "Dự thảo": "bg-cyan-100 text-cyan-800 border-cyan-200",
    "Đang xử lý": "border",
    "Chờ ban hành": "bg-amber-100 text-amber-800 border-amber-200",
    "Đã ban hành": "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Bị trả lại": "border",
    "Thu hồi xử lý": "bg-orange-100 text-orange-800 border-orange-200",
    "Thu hồi ban hành": "bg-gray-100 text-gray-800 border-gray-200",
    "Thu hồi": "bg-orange-100 text-orange-800 border-orange-200",
    "Chờ xử lý": "bg-sky-100 text-sky-800 border-sky-200",
  };
  return (
    colorMap[status as keyof typeof colorMap] ||
    "bg-gray-50 text-gray-800 border-gray-200"
  );
};

export const getStatusStyle = (
  status: string
): React.CSSProperties | undefined => {
  if (status === "Đang xử lý") {
    return {
      backgroundColor: "#fecaca",
      color: "#991b1b",
      borderColor: "#fca5a5",
    };
  }
  if (status === "Bị trả lại") {
    return {
      backgroundColor: "#fef08a",
      color: "#854d0e",
      borderColor: "#fde047",
    };
  }
  return undefined;
};
