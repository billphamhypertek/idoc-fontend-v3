import React from "react";
import { cn } from "@/lib/utils";
import { FileText, Users, UserCheck, Paperclip } from "lucide-react";
import type { OrgUnit } from "@/definitions/types/orgunit.type";

interface Props {
  trackingRows: OrgUnit[];
}

export default function DocInStatsSummary({ trackingRows }: Props) {
  if (!trackingRows.length) return null;
  // Khối lượng lớn nhất
  const maxUnit = trackingRows.reduce(
    (max, cur) =>
      (cur.normalInDocOut ?? 0) + (cur.secretInDocOut ?? 0) >
      (max.normalInDocOut ?? 0) + (max.secretInDocOut ?? 0)
        ? cur
        : max,
    trackingRows[0]
  );
  const maxTotal =
    (maxUnit.normalInDocOut ?? 0) + (maxUnit.secretInDocOut ?? 0);
  const totalDen = trackingRows.reduce(
    (sum, r) => sum + ((r.normalInDocOut ?? 0) + (r.secretInDocOut ?? 0)),
    0
  );
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-1 gap-4 mt-2 text-sm")}>
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
          <Paperclip className={cn("w-6 h-6 text-blue-600")} />
        </div>
        <span>
          Khối lượng lớn nhất <b>{maxUnit.orgName}</b> xử lý <b>{maxTotal}</b>{" "}
          văn bản đến
        </span>
      </div>
    </div>
  );
}
