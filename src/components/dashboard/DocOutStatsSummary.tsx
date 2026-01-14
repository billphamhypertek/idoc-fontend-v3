import React from "react";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  Award,
  FileText,
  TrendingUp,
  Paperclip,
} from "lucide-react";
import type { OrgUnit } from "@/definitions/types/orgunit.type";

interface Props {
  trackingRows: OrgUnit[];
}

export default function DocOutStatsSummary({ trackingRows }: Props) {
  if (!trackingRows.length) return null;
  // Đơn vị tích cực nhất - lọc ra hàng tổng kết
  const filteredRows = trackingRows.filter(
    (row) => (row.orgName ?? "").trim().toUpperCase() !== "TỔNG SỐ TOÀN BAN"
  );
  if (!filteredRows.length) return null;
  const maxUnit = filteredRows.reduce(
    (max, cur) => ((cur.totalDocOut ?? 0) > (max.totalDocOut ?? 0) ? cur : max),
    filteredRows[0]
  );
  // Tỷ lệ toàn trình
  const totalFull = trackingRows.reduce(
    (sum, r) => sum + (r.fullProcessDocOut ?? 0),
    0
  );
  const totalOut = trackingRows.reduce(
    (sum, r) => sum + (r.totalDocOut ?? 0),
    0
  );
  const percentFull = totalOut
    ? ((totalFull / totalOut) * 100).toFixed(1)
    : "0.0";
  // Số hóa văn bản (tỷ lệ còn dùng giấy)
  const totalPaper = trackingRows.reduce(
    (sum, r) => sum + (r.paperHandleDoc ?? 0),
    0
  );
  const percentPaper = totalOut
    ? ((totalPaper / totalOut) * 100).toFixed(1)
    : "0.0";

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6 mt-3 font-sans")}>
      <div
        className={cn(
          "bg-blue-50 rounded-xl shadow-md flex items-center gap-4 px-6 py-5 min-h-[80px] border border-blue-100"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md mr-2"
          )}
        >
          <Award className={cn("w-8 h-9 text-blue-500")} />
        </div>
      </div>
      <div
        className={cn(
          "bg-green-50 rounded-xl shadow-md flex items-center gap-4 px-6 py-5 min-h-[80px] border border-green-100"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md mr-2"
          )}
        >
          <TrendingUp className={cn("w-8 h-9 text-green-600")} />
        </div>
        <div className={cn("flex flex-col justify-center min-w-0")}>
          <span
            className={cn(
              "font-semibold text-green-700 text-[14px] leading-tight"
            )}
          >
            Tỷ lệ toàn trình
          </span>
          <span className={cn("text-gray-700 text-[13px] mt-1")}>
            <span
              className={cn(
                "font-bold text-green-700 text-[18px] align-middle"
              )}
            >
              {percentFull}%
            </span>
            <span className={cn("ml-1 text-gray-500")}>văn bản toàn trình</span>
          </span>
        </div>
      </div>
      <div
        className={cn(
          "bg-orange-50 rounded-xl shadow-md flex items-center gap-4 px-6 py-5 min-h-[80px] border border-orange-100"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-md mr-2"
          )}
        >
          <Paperclip className={cn("w-8 h-9 text-blue-600")} />
        </div>
        <div className={cn("flex flex-col justify-center min-w-0")}>
          <span
            className={cn(
              "font-semibold text-orange-700 text-[14px] leading-tight"
            )}
          >
            Số hóa văn bản
          </span>
          <span className={cn("text-gray-700 text-[13px] mt-1")}>
            <span
              className={cn(
                "font-bold text-orange-700 text-[18px] align-middle"
              )}
            >
              {percentPaper}%
            </span>
            <span className={cn("ml-1 text-gray-500")}>
              còn dùng văn bản giấy
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
