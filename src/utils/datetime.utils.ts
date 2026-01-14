import { endOfWeek, startOfWeek } from "date-fns";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import localeData from "dayjs/plugin/localeData";

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(localeData);

dayjs.locale("en", {
  weekStart: 1,
});

export const formatDateTime = (
  date: Date | null,
  time: Date | null
): string => {
  if (date && time) {
    const dateStr = date.toISOString().split("T")[0];
    const hour = time.getHours().toString().padStart(2, "0");
    const minute = time.getMinutes().toString().padStart(2, "0");
    const second = "01";
    return `${dateStr}T${hour}:${minute}:${second}`;
  } else if (date && !time) {
    const dateStr = date.toISOString().split("T")[0];
    return `${dateStr}T00:00:00`;
  } else if (!date && time) {
    const hour = time.getHours().toString().padStart(2, "0");
    const minute = time.getMinutes().toString().padStart(2, "0");
    const second = "01";
    return `2000-01-01T${hour}:${minute}:${second}`;
  } else {
    return "";
  }
};
export function formatDate(
  input: Date | number | string | null | undefined,
  format: string = "DD/MM/YYYY"
): string | "" {
  if (!input) return "";

  let date: Date;
  if (typeof input === "number") {
    date = new Date(input);
  } else if (typeof input === "string") {
    date = new Date(input);
  } else {
    date = input;
  }

  // Check if date is valid
  if (isNaN(date.getTime())) return "";

  const pad = (n: number) => n.toString().padStart(2, "0");

  const map: { [key: string]: string } = {
    DD: pad(date.getDate()),
    dd: pad(date.getDate()),
    MM: pad(date.getMonth() + 1),
    YYYY: date.getFullYear().toString(),
    yyyy: date.getFullYear().toString(),
    YY: date.getFullYear().toString().slice(-2),
    yy: date.getFullYear().toString().slice(-2),
  };

  return format.replace(/DD|dd|MM|YYYY|yyyy|YY|yy/g, (matched) => map[matched]);
}

// Convenience function for consistent date formatting across the app
export const formatDateVN = (input: Date | number | string | null): string => {
  return formatDate(input, "DD/MM/YYYY");
};

// Function to format datetime with time
export const formatDateTimeVN = (
  input: Date | number | string | null,
  containSecond: boolean = false
): string => {
  if (!input) return "";

  let date: Date;
  if (typeof input === "number") {
    date = new Date(input);
  } else if (typeof input === "string") {
    date = new Date(input);
  } else {
    date = input;
  }

  if (isNaN(date.getTime())) return "";

  const dateStr = formatDateVN(date);
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };

  if (containSecond) {
    timeOptions.second = "2-digit";
  }

  const timeStr = date.toLocaleTimeString("vi-VN", timeOptions);

  return containSecond ? `${timeStr} ${dateStr}` : `${dateStr} ${timeStr}`;
};

export const getWeekOfYear = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};
export const getWeekYear = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return d.getUTCFullYear();
};

export const isToday = (dateStr: string): boolean => {
  if (!dateStr || typeof dateStr !== "string") return false;
  const today = new Date();
  const [day, month, year] = dateStr.split("/").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toDateString() === today.toDateString();
};

// Function to check if a date is today or in the future
export const isCheckDate = (date: string | Date): boolean => {
  const inputDate = new Date(date);
  const today = new Date();

  // Create new Date objects to avoid modifying the original dates
  const inputDateNormalized = new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate()
  );
  const todayNormalized = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  return inputDateNormalized >= todayNormalized;
};

export const extractDateFromVietnameseString = (dateStr: string): string => {
  const match = dateStr.match(/(\d{2}\/\d{2}\/\d{4})/);
  return match ? match[1] : dateStr;
};

// Week calculation utilities
export const getWeekDates = (week: number, year: Date) => {
  const startDate = startOfWeek(year, { weekStartsOn: 1 });
  const endDate = endOfWeek(year, { weekStartsOn: 1 });
  return { startDate, endDate };
};

export const getPassTime = (dateString: string): string => {
  const now = new Date();
  const resultDate = new Date(dateString);
  const diff = now.getTime() - resultDate.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
  const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));

  if (years > 0) {
    return `${years} năm trước`;
  } else if (months > 0) {
    return `${months} tháng trước`;
  } else if (days > 0) {
    return `${days} ngày trước`;
  } else if (hours > 0) {
    return `${hours} giờ trước`;
  } else if (minutes > 0) {
    return `${minutes} phút trước`;
  } else {
    return "Vừa xong";
  }
};

export const countDateUntilNow = (timestamp: number) => {
  // Normalize both dates to 00:00 UTC (bỏ qua giờ phút giây)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(
    new Date(timestamp).getFullYear(),
    new Date(timestamp).getMonth(),
    new Date(timestamp).getDate()
  );
  // Tính số ngày chênh lệch
  const millisPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((target.getTime() - today.getTime()) / millisPerDay);
};

export const getYearsList = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1990; year--) {
    years.push({ value: year.toString(), label: year.toString() });
  }
  return years;
};

export const getCurrentWeekNumber = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  );
  const weekNumber = Math.ceil((days + start.getDay() + 1) / 7);
  return weekNumber;
};

export const getWeeksList = () => {
  const currentYear = new Date().getFullYear();
  return getWeeksListForYear(currentYear);
};

export const getWeeksListForYear = (year: number) => {
  const weeks = [];

  // Tính số tuần trong năm (có thể là 52 hoặc 53)
  const lastDay = new Date(year, 11, 31);
  const startOfYear = new Date(year, 0, 1);
  const daysInYear =
    Math.ceil(
      (lastDay.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    ) + 1;
  const weeksInYear = Math.ceil(daysInYear / 7);

  for (let week = 1; week <= weeksInYear; week++) {
    weeks.push({ value: week.toString(), label: `${week}` });
  }

  return weeks;
};
export const convertStringDateToNgbDate = (
  date: string,
  needTransform = false
): { year: number; month: number; day: number } | null => {
  if (!date || typeof date !== "string") return null;
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
};

// Common helpers to parse/format YYYY-MM-DD consistently across app
export const parseDateStringYMD = (value: string | undefined): Date | null => {
  if (!value || typeof value !== "string") return null;
  const [y, m, d] = value.split("-").map((v) => parseInt(v, 10));
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export const formatDateYMD = (date: Date | null): string => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const formatDateWithFormat = (
  date: Date | null,
  format: string = "yyyy-mm-dd"
): string => {
  if (!date) return "";

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  switch (format) {
    case "dd/mm/yyyy":
      return `${d}/${m}/${y}`;
    case "mm/dd/yyyy":
      return `${m}/${d}/${y}`;
    case "yyyy-mm-dd":
      return `${y}-${m}-${d}`;
    case "dd-mm-yyyy":
      return `${d}-${m}-${y}`;
    case "mm-dd-yyyy":
      return `${m}-${d}-${y}`;
    case "dd/mm/yy":
      return `${d}/${m}/${String(y).slice(-2)}`;
    case "dd.mm.yyyy":
      return `${d}.${m}.${y}`;
    case "yyyy/mm/dd":
      return `${y}/${m}/${d}`;
    default:
      return `${y}-${m}-${d}`;
  }
};
