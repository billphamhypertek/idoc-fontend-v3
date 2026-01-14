import { Constant } from "@/definitions/constants/constant";
import { getDateLeftUtils } from "./common.utils";
import { getDeadlineColorClasses } from "./status-colors.utils";

export interface DeadlineWarning {
  id: number;
  name: string;
  numberOfDays: number;
  color: string;
  dayLeft: number;
}

export const DEADLINE_WARNINGS: DeadlineWarning[] = [
  {
    id: 2,
    name: "Hạn xử lý không quá 3 ngày",
    numberOfDays: 3,
    color: "blue",
    dayLeft: 0,
  },
  {
    id: 4,
    name: "Hạn xử lý hơn 3 ngày",
    numberOfDays: 100000,
    color: "black",
    dayLeft: 3,
  },
  {
    id: 3,
    name: "Quá hạn",
    numberOfDays: 0,
    color: "red",
    dayLeft: -1,
  },
  {
    id: 5,
    name: "Đang xử lý",
    numberOfDays: -1,
    color: "#f9acac",
    dayLeft: -1,
  },
  {
    id: 6,
    name: "Trả lại",
    numberOfDays: -1,
    color: "#fbeb9a",
    dayLeft: -1,
  },
];

export const getDeadlineWarning = (task: any): DeadlineWarning | null => {
  const daysLeft = getDateLeftUtils({
    ...task,
    deadline: task.endDate ?? task.deadline,
  });

  if (daysLeft < 0) {
    return null;
  }

  const warning = DEADLINE_WARNINGS.sort((a, b) =>
    a.numberOfDays < b.numberOfDays ? -1 : 1
  ).find((item) => item.numberOfDays >= daysLeft);

  return warning || null;
};

export const addDeadlineWarningToTasks = (tasks: any[]): any[] => {
  return tasks.map((task) => ({
    ...task,
    deadlineWarning: getDeadlineWarning(task),
  }));
};

export const getDeadlineWarningClasses = (
  color: string,
  type: "text" | "badge" | "icon" = "text"
): string => {
  switch (color) {
    case "red":
      switch (type) {
        case "text":
          return "text-red-600";
        case "badge":
          return "bg-red-100 text-red-800 hover:bg-red-200";
        case "icon":
          return "bg-red-500";
        default:
          return "text-red-600";
      }
    case "blue":
      switch (type) {
        case "text":
          return "text-blue-600";
        case "badge":
          return "bg-blue-100 text-blue-800 hover:bg-blue-200";
        case "icon":
          return "bg-blue-600";
        default:
          return "text-blue-600";
      }
    case "black":
      switch (type) {
        case "text":
          return "text-gray-800";
        case "badge":
          return "bg-gray-100 text-gray-800 hover:bg-gray-200";
        case "icon":
          return "bg-gray-500";
        default:
          return "text-gray-800";
      }
    case "#f9acac":
      switch (type) {
        case "text":
          return "text-green-600";
        case "badge":
          return "bg-green-100 text-green-800 hover:bg-green-200";
        case "icon":
          return "bg-green-500";
        default:
          return "text-green-600";
      }
    case "#fbeb9a":
      switch (type) {
        case "text":
          return "text-yellow-600";
        case "badge":
          return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
        case "icon":
          return "bg-yellow-500";
        default:
          return "text-yellow-600";
      }
    default:
      switch (type) {
        case "text":
          return "text-gray-600";
        case "badge":
          return "bg-gray-100 text-gray-800 hover:bg-gray-200";
        case "icon":
          return "bg-gray-500";
        default:
          return "text-gray-600";
      }
  }
};

/**
 * Get deadline badge style with unified colors
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
 * Get deadline badge style by color name (for backward compatibility)
 */
export const getDeadlineBadgeStyleByColor = (
  color: string
): React.CSSProperties => {
  switch (color) {
    case "red":
      return {
        backgroundColor: "#dc2626",
        color: "#ffffff",
        borderColor: "#dc2626",
      };
    case "blue":
      return {
        backgroundColor: "#2563eb",
        color: "#ffffff",
        borderColor: "#2563eb",
      };
    case "black":
      return {
        backgroundColor: "#000000",
        color: "#ffffff",
        borderColor: "#000000",
      };
    default:
      return {
        backgroundColor: "#f3f4f6",
        color: "#1f2937",
        borderColor: "#d1d5db",
      };
  }
};
