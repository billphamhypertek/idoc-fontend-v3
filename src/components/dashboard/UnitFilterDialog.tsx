import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type UnitFilterItem = {
  orgId: string;
  orgName: string;
  completedTaskCount?: number;
  notCompletedTaskCount?: number;
  outOfDateTaskCount?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  units: UnitFilterItem[];
  hiddenOrgIds: string[];
  setHiddenOrgIds: (ids: string[]) => void;
};

export default function UnitFilterDialog({
  open,
  onClose,
  units,
  hiddenOrgIds,
  setHiddenOrgIds,
}: Props) {
  const [localHidden, setLocalHidden] = useState<string[]>(hiddenOrgIds);

  const handleToggle = (orgId: string) => {
    setLocalHidden((prev) =>
      prev.includes(orgId)
        ? prev.filter((id) => id !== orgId)
        : [...prev, orgId]
    );
  };

  const handleSelectAll = () => {
    setLocalHidden([]);
  };
  const handleDeselectAll = () => {
    setLocalHidden(units.map((u) => u.orgId));
  };
  const handleApply = () => {
    setHiddenOrgIds(localHidden);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
      )}
    >
      <div className={cn("bg-white rounded-lg shadow-lg p-6 w-full max-w-md")}>
        <div className={cn("flex justify-between items-center mb-4")}>
          <span className={cn("font-semibold text-lg")}>Chọn đơn vị để ẩn</span>
          <button
            onClick={onClose}
            className={cn("text-gray-500 hover:text-red-500")}
          >
            ✕
          </button>
        </div>
        <div className={cn("flex gap-4 mb-2 text-sm")}>
          <button
            onClick={handleSelectAll}
            className={cn("text-blue-600 hover:underline")}
          >
            Chọn tất cả
          </button>
          <button
            onClick={handleDeselectAll}
            className={cn("text-red-600 hover:underline")}
          >
            Bỏ chọn tất cả
          </button>
        </div>
        <div className={cn("max-h-64 overflow-y-auto space-y-2 mb-2")}>
          {units.map((unit) => (
            <div
              key={unit.orgId}
              className={cn(
                "flex items-center justify-between border rounded px-3 py-2",
                localHidden.includes(unit.orgId)
                  ? "bg-gray-100 border-gray-300"
                  : "bg-yellow-50 border-yellow-300"
              )}
            >
              <div>
                <span className={cn("font-medium")}>{unit.orgName}</span>
                <span className={cn("ml-2 text-xs flex gap-1 flex-wrap")}>
                  <span
                    className={cn(
                      "font-bold text-yellow-700 bg-yellow-100 rounded px-1.5 py-0.5"
                    )}
                  >
                    {(unit.completedTaskCount ?? 0) +
                      (unit.notCompletedTaskCount ?? 0) +
                      (unit.outOfDateTaskCount ?? 0)}{" "}
                    nhiệm vụ
                  </span>
                  <span
                    className={cn(
                      "font-bold text-green-700 bg-green-100 rounded px-1.5 py-0.5"
                    )}
                  >
                    {unit.completedTaskCount ?? 0} hoàn thành
                  </span>
                  <span
                    className={cn(
                      "font-bold text-blue-700 bg-blue-100 rounded px-1.5 py-0.5"
                    )}
                  >
                    {unit.notCompletedTaskCount ?? 0} đang xử lý
                  </span>
                  <span
                    className={cn(
                      "font-bold text-orange-700 bg-orange-100 rounded px-1.5 py-0.5"
                    )}
                  >
                    {unit.outOfDateTaskCount ?? 0} quá hạn
                  </span>
                </span>
              </div>
              <button
                onClick={() => handleToggle(unit.orgId)}
                className={cn("ml-2 text-xs text-blue-600 hover:underline")}
              >
                {localHidden.includes(unit.orgId) ? "Hiện" : "Ẩn"}
              </button>
            </div>
          ))}
        </div>
        <div className={cn("flex justify-end gap-2 mt-4")}>
          <button
            onClick={onClose}
            className={cn("px-3 py-1 rounded bg-gray-200 hover:bg-gray-300")}
          >
            Hủy
          </button>
          <button
            onClick={handleApply}
            className={cn(
              "px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
            )}
          >
            Áp dụng
          </button>
        </div>
        <div className={cn("mt-2 text-xs text-gray-500")}>
          Đang ẩn {localHidden.length} đơn vị:{" "}
          {units
            .filter((u) => localHidden.includes(u.orgId))
            .map((u) => u.orgName)
            .join(", ") || "Không có"}
        </div>
      </div>
    </div>
  );
}
