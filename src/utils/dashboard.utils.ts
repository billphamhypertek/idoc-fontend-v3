import { DASHBOARD_COLORS } from "@/utils/color.utils";
import { formatDate } from "@/utils/datetime.utils";

export interface Document {
  id: string;
  title: string;
  type: "incoming" | "outgoing";
  priority: string;
  status: string;
  from?: string;
  to?: string;
  handlingType?: "main" | "coordinate";
  urgentName?: string;
  numberArrivalStr?: string;
  dateArrival?: string;
  numberOrSign?: string;
  createDate?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignedBy?: string;
  assignees?: string[];
  deadline?: string;
  status: string;
}

export interface ScheduleItem {
  id: number;
  time: string;
  title: string;
  location: string;
  participants: string;
  startTimeStr?: string;
  endTimeStr?: string;
  address?: string;
  description?: string;
  statusName?: string;
  meetingCalendar?: boolean;
  unitCalendar?: boolean;
}

/**
 * Transform document data to match dashboard Document interface
 */
export const transformDocument = (
  doc: any,
  type: "incoming" | "outgoing"
): Document => {
  const baseDocument = {
    id: doc.docId?.toString() || "",
    title: doc.preview || "",
    status: doc.docStatusName || "",
    to: doc.orgExe || "",
  };

  if (type === "incoming") {
    return {
      ...baseDocument,
      type: "incoming",
      priority:
        doc.urgentName === "Khẩn"
          ? "Khẩn"
          : doc.urgentName === "Hỏa tốc"
            ? "Hỏa tốc"
            : "Thường",
      from: doc.placeSend || "",
      handlingType: doc.typeProcess === "MAIN" ? "main" : "coordinate",
      urgentName: doc.urgentName || "",
      numberArrivalStr: doc.numberArrivalStr || "",
      dateArrival: doc.dateArrival || "",
    };
  } else {
    return {
      ...baseDocument,
      type: "outgoing",
      priority:
        doc.urgent?.name === "Khẩn"
          ? "Khẩn"
          : doc.urgent?.name === "Hỏa tốc"
            ? "Hỏa tốc"
            : "Thường",
      from: doc.userEnter?.fullName || "",
      handlingType: "main",
      urgentName: doc.urgent?.name || "",
      numberOrSign: doc.numberOrSign || "",
      createDate: doc.createDate || "",
    };
  }
};

/**
 * Filter documents based on security level
 */
export const filterDocumentsBySecurity = (
  docs: any[],
  filter: "all" | "regular" | "confidential"
) => {
  if (filter === "all") return docs;
  return docs.filter((doc) => {
    const isConfidential =
      doc.urgentName === "Mật" || doc.urgent?.name === "Mật";
    return filter === "confidential" ? isConfidential : !isConfidential;
  });
};

/**
 * Generic filter function for search queries
 */
export const filterByQuery = (
  items: any[],
  query: string,
  fields: string[]
) => {
  if (!query) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      return (
        value &&
        typeof value === "string" &&
        value.toLowerCase().includes(lowerQuery)
      );
    })
  );
};

/**
 * Filter schedule items by time period
 */
export const filterSchedulesByTime = (
  items: ScheduleItem[],
  period: "morning" | "afternoon"
) => {
  return items.filter((item) => {
    if (!item.startTimeStr) return false;

    // Lấy phần thời gian từ "start - end" hoặc "dd/MM/yyyy HH:mm"
    const startPart = item.startTimeStr.split(" - ")[0].trim();
    const timeToken = startPart.split(" ").pop() || startPart; // lấy "HH:mm"
    const hour = parseInt(timeToken.split(":")[0], 10);

    if (Number.isNaN(hour)) return false;

    // Sáng: 00:00 - 11:59 | Chiều: từ 12:00 trở đi
    return period === "morning" ? hour >= 0 && hour <= 11 : hour >= 12;
  });
};

/**
 * Filter schedule items by type (board vs unit)
 */
export const filterSchedulesByType = (
  items: ScheduleItem[],
  type: "board" | "unit"
) => {
  return items.filter((item) => {
    if (type === "board") {
      return (
        item.meetingCalendar === true ||
        (item.meetingCalendar === false && item.unitCalendar === false)
      );
    } else {
      return (
        item.unitCalendar === true ||
        (item.meetingCalendar === false && item.unitCalendar === false)
      );
    }
  });
};

/**
 * Get priority color class name
 */
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "Hỏa tốc":
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "Thường":
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Khẩn":
    case "urgent":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Mật":
      return "bg-purple-100 text-purple-800 border-purple-200";
  }
};

/**
 * Get role status color class name
 */
export const getRoleStatusColor = (status: string) => {
  switch (status) {
    case "Mới":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Đang xử lý":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Hoàn thành":
      return "bg-green-100 text-green-800 border-green-200";
    case "Chờ xử lý":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Quá hạn":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

/**
 * Format date for display with relative labels
 */
export const formatDateForDisplay = (date: Date | null, isClient: boolean) => {
  if (!isClient) return "Đang tải...";
  if (!date) return "Chưa chọn ngày";

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString())
    return `Hôm nay (${formatDate(date, "dd/MM/yyyy")})`;
  if (date.toDateString() === tomorrow.toDateString())
    return `Ngày mai (${formatDate(date, "dd/MM/yyyy")})`;
  if (date.toDateString() === yesterday.toDateString())
    return `Hôm qua (${formatDate(date, "dd/MM/yyyy")})`;
  return formatDate(date, "dd/MM/yyyy");
};

export const formatTaskDate = (date: number | string | Date): string => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return "";
  }
};

export const getDaysUntilDue = (endDate: number | string | Date): number => {
  try {
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return 0;
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
};

export const getColorComplexity = (complexity: string): string => {
  switch (complexity) {
    case "Mức 1":
    case "Mức 2":
      return DASHBOARD_COLORS.complexityLow;
    case "Mức 3":
      return DASHBOARD_COLORS.complexityMedium;
    case "Mức 4":
      return DASHBOARD_COLORS.complexityHigh;
    default:
      return DASHBOARD_COLORS.complexityLow;
  }
};

export const TaskStatusLabel: Record<number, string> = {
  0: "Mới giao",
  1: "Đang thực hiện",
  2: "Từ chối",
  3: "Chờ đánh giá",
  4: "Hoàn thành",
  5: "Bị hủy",
};

export const getInitials = (fullName: string, take: number = 2): string => {
  if (!fullName) return "";
  const parts = fullName
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return "";
  }
  return parts
    .slice(-take)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
};

export const getCollaborators = (combination?: string): string[] => {
  if (!combination) return [];
  return combination
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name.length > 0);
};
