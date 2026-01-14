"use client";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";

export interface ChartUnitFilterProps {
  open: boolean;
  onClose: () => void;
  units: {
    orgId: string;
    orgName: string;
    completedTaskCount?: number;
    notCompletedTaskCount?: number;
    outOfDateTaskCount?: number;
  }[];
  hiddenOrgIds: string[];
  setHiddenOrgIds: (ids: string[]) => void;
}

export default function ChartUnitFilterDialog({
  open,
  onClose,
  units,
  hiddenOrgIds,
  setHiddenOrgIds,
}: ChartUnitFilterProps) {
  const [localHidden, setLocalHidden] = useState<string[]>(hiddenOrgIds);

  useEffect(() => {
    setLocalHidden(hiddenOrgIds);
  }, [hiddenOrgIds, open]);

  const handleToggle = (orgId: string) => {
    setLocalHidden((prev) =>
      prev.includes(orgId)
        ? prev.filter((id) => id !== orgId)
        : [...prev, orgId]
    );
  };

  const handleSelectAll = () => setLocalHidden([]);
  const handleDeselectAll = () => setLocalHidden(units.map((u) => u.orgId));
  const handleApply = () => {
    setHiddenOrgIds(localHidden);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className={cn(
        "absolute right-0 top-full z-50 mt-2 w-[350px] md:w-[420px]"
      )}
    >
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl p-5 border border-gray-200 min-w-[320px] font-sans"
        )}
      >
        <div className={cn("flex items-center justify-between mb-3")}>
          <div
            className={cn(
              "flex items-center gap-2 text-amber-600 font-semibold"
            )}
          >
            <Filter className="w-4 h-4" />
            <span>Lọc đơn vị</span>
            <span
              className={cn(
                "ml-2 bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-bold"
              )}
            >
              {units.length - localHidden.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className={cn("text-gray-400 hover:text-red-500 text-xl font-bold")}
          >
            ×
          </button>
        </div>

        <div className={cn("flex gap-4 mb-3 text-sm")}>
          <button
            onClick={handleSelectAll}
            className="text-blue-600 hover:underline font-medium"
          >
            Chọn tất cả
          </button>
          <span className={cn("text-gray-300")}>|</span>
          <button
            onClick={handleDeselectAll}
            className={cn("text-red-600 hover:underline font-medium")}
          >
            Bỏ chọn tất cả
          </button>
        </div>

        <div className={cn("max-h-64 overflow-y-auto space-y-2 mb-3 pr-1")}>
          {units.map((unit) => {
            const completed = unit.completedTaskCount ?? 0;
            const inProgress = unit.notCompletedTaskCount ?? 0;
            const overdue = unit.outOfDateTaskCount ?? 0;

            const totalTasks = completed + overdue;

            const isHidden = localHidden.includes(unit.orgId);

            return (
              <div
                key={unit.orgId}
                className={cn(
                  "rounded-lg border px-4 py-2 flex flex-col gap-1 relative cursor-pointer transition-all duration-150",
                  isHidden
                    ? "bg-gray-50 border-gray-200 opacity-60"
                    : "bg-amber-50 border-amber-300 hover:bg-amber-100"
                )}
                onClick={() => handleToggle(unit.orgId)}
                tabIndex={0}
                role="button"
                aria-pressed={!isHidden}
              >
                <div className={cn("flex items-center gap-2")}>
                  <span
                    className={cn(
                      "inline-block w-2 h-2 rounded-full bg-amber-400"
                    )}
                  />
                  <span
                    className={cn(
                      "font-semibold text-gray-800 truncate max-w-[170px]"
                    )}
                  >
                    {unit.orgName}
                  </span>
                  <span
                    className={cn(
                      "ml-auto text-xs font-semibold select-none px-2 py-0.5 rounded",
                      isHidden
                        ? "bg-gray-200 text-gray-600"
                        : "bg-green-100 text-green-700"
                    )}
                  >
                    {isHidden ? "Ẩn" : "Hiện"}
                  </span>
                </div>

                <div
                  className={cn(
                    "flex flex-wrap gap-x-2 gap-y-1 text-xs pl-5 mt-1"
                  )}
                >
                  <span
                    className={cn(
                      "font-bold text-yellow-700 bg-yellow-100 rounded px-1.5 py-0.5"
                    )}
                    title="Tổng nhiệm vụ = Hoàn thành + Quá hạn"
                  >
                    {totalTasks} nhiệm vụ
                  </span>

                  <span
                    className={cn(
                      "font-bold text-green-700 bg-green-100 rounded px-1.5 py-0.5"
                    )}
                  >
                    {completed} hoàn thành
                  </span>

                  <span
                    className={cn(
                      "font-bold text-blue-700 bg-blue-100 rounded px-1.5 py-0.5"
                    )}
                  >
                    {inProgress} đang xử lý
                  </span>

                  <span
                    className={cn(
                      "font-bold text-orange-700 bg-orange-100 rounded px-1.5 py-0.5"
                    )}
                  >
                    {overdue} quá hạn
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className={cn("flex justify-end gap-2 mt-4")}>
          <button
            onClick={onClose}
            className={cn(
              "px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
            )}
          >
            Hủy
          </button>
          <button
            onClick={handleApply}
            className={cn(
              "px-3 py-1 rounded bg-amber-500 text-white hover:bg-amber-600 font-semibold shadow"
            )}
          >
            Áp dụng
          </button>
        </div>

        <div className={cn("mt-2 text-xs text-gray-700")}>
          Đang ẩn <b>{localHidden.length}</b> đơn vị:{" "}
          {units
            .filter((u) => localHidden.includes(u.orgId))
            .map((u) => u.orgName)
            .join(", ") || "Không có"}
        </div>
      </div>
    </div>
  );
}
