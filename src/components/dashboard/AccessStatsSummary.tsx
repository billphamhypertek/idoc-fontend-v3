import React from "react";
import { cn } from "@/lib/utils";
import { Award, BarChart2, AlertTriangle } from "lucide-react";
import type { OrgUnit } from "@/definitions/types/orgunit.type";

interface Props {
  trackingRows: OrgUnit[];
}

export default function AccessStatsSummary({ trackingRows }: Props) {
  if (!trackingRows.length) return null;
  // Đơn vị dẫn đầu
  const maxUnit = trackingRows.reduce((max, cur) => {
    const maxRate =
      (max.totalUser ?? 0) ? (max.loginUser ?? 0) / (max.totalUser ?? 1) : 0;
    const curRate =
      (cur.totalUser ?? 0) ? (cur.loginUser ?? 0) / (cur.totalUser ?? 1) : 0;
    return curRate > maxRate ? cur : max;
  }, trackingRows[0]);
  const maxRate =
    (maxUnit.totalUser ?? 0)
      ? (((maxUnit.loginUser ?? 0) / (maxUnit.totalUser ?? 1)) * 100).toFixed(1)
      : "0.0";
  // Tỷ lệ trung bình
  const totalUser = trackingRows.reduce(
    (sum, r) => sum + (r.totalUser ?? 0),
    0
  );
  const totalLogin = trackingRows.reduce(
    (sum, r) => sum + (r.loginUser ?? 0),
    0
  );
  const avgRate = totalUser
    ? ((totalLogin / totalUser) * 100).toFixed(1)
    : "0.0";
  // Cần cải thiện: số đơn vị có tỉ lệ < 80%
  const needImprove = trackingRows.filter((r) => {
    const total = r.totalUser ?? 0;
    const login = r.loginUser ?? 0;
    return total && (login / total) * 100 < 80;
  }).length;
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm")}>
      <div
        className={cn(
          "bg-green-50 rounded-2xl border border-green-100 shadow-md p-4 flex items-center gap-3 transition hover:shadow-lg"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-9 bg-white rounded-full shadow mr-2"
          )}
        >
          <Award className={cn("w-6 h-6 text-green-600")} />
        </div>
        <span>
          Đơn vị dẫn đầu <b>{maxUnit.orgName}</b> đạt tỷ lệ truy cập cao nhất:{" "}
          <b>{maxRate}%</b>
        </span>
      </div>
      <div
        className={cn(
          "bg-blue-50 rounded-2xl border border-blue-100 shadow-md p-4 flex items-center gap-3 transition hover:shadow-lg"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-9 bg-white rounded-full shadow mr-2"
          )}
        >
          <BarChart2 className={cn("w-6 h-6 text-blue-600")} />
        </div>
        <span>
          Tỷ lệ trung bình <b>{avgRate}%</b> toàn Ban
        </span>
      </div>
      <div
        className={cn(
          "bg-orange-50 rounded-2xl border border-orange-100 shadow-md p-4 flex items-center gap-3 transition hover:shadow-lg"
        )}
      >
        <div
          className={cn(
            "flex items-center justify-center w-10 h-9 bg-white rounded-full shadow mr-2"
          )}
        >
          <AlertTriangle className={cn("w-6 h-6 text-orange-500")} />
        </div>
        <span>
          {needImprove === 0
            ? "Không có đơn vị cần cải thiện"
            : `Cần cải thiện ${needImprove} đơn vị có tỷ lệ truy cập dưới 80%`}
        </span>
      </div>
    </div>
  );
}
