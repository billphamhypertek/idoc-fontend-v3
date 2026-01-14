import React from "react";
import { cn } from "@/lib/utils";

export interface DepartmentFilterPanelProps {
  selectedDepartmentIds: string[];
  departmentList: { departmentName: string; departmentInfo?: string }[];
  onClosePanel: () => void;
  onShowAllDepartments: () => void;
  onHideAllDepartments: () => void;
  onToggleDepartment: (departmentName: string) => void;
}

export const L = {
  dashboard: {
    chon_don_vi_de_hien: "Chọn đơn vị để hiển thị",
    bo_chon: "Bỏ chọn",
    da_chon: "Đã chọn",
  },
};

export const DepartmentFilterPanel = (props: DepartmentFilterPanelProps) => {
  const selectedSet = new Set(props.selectedDepartmentIds);
  const hiddenCount = props.selectedDepartmentIds.length;
  return (
    <div
      className={cn(
        "absolute right-4 top-12 z-20 w-[520px] max-w-[96vw] rounded-2xl border border-gray-200 bg-white shadow-xl"
      )}
    >
      <div
        className={cn("flex items-center justify-between px-4 py-3 border-b")}
      >
        <div className="font-semibold">{L.dashboard.chon_don_vi_de_hien}</div>
        <button
          className={cn("p-1 rounded hover:bg-gray-100")}
          onClick={props.onClosePanel}
        ></button>
      </div>
      <div className={cn("px-4 py-2 flex items-center gap-3 border-b")}>
        <button
          onClick={props.onShowAllDepartments}
          className={cn("text-blue-600 text-sm font-semibold hover:underline")}
        >
          Hiện tất cả
        </button>
        <span className={cn("text-gray-300")}>|</span>
        <button
          onClick={props.onHideAllDepartments}
          className={cn("text-rose-600 text-sm font-semibold hover:underline")}
        >
          Ẩn tất cả
        </button>
        <span className={cn("ml-auto text-xs text-gray-500")}>
          {hiddenCount} đơn vị đã ẩn
        </span>
      </div>
      <div className={cn("max-h-[320px] overflow-auto divide-y")}>
        {props.departmentList.map((u) => {
          const isHidden = selectedSet.has(u.departmentName);
          return (
            <div
              key={u.departmentName}
              className={cn(
                "flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-gray-50"
              )}
              onClick={() => props.onToggleDepartment(u.departmentName)}
            >
              <div className={cn("flex items-start gap-3")}>
                <span
                  className={cn(
                    "mt-1 inline-block h-2.5 w-2.5 rounded-full",
                    isHidden ? "bg-gray-300" : "bg-amber-400"
                  )}
                />
                <div>
                  <div className={cn("font-medium")}>{u.departmentName}</div>
                  <div className={cn("text-sm text-gray-600")}>
                    {u.departmentInfo}
                  </div>
                </div>
              </div>
              <div className={cn("text-sm text-gray-500")}>
                {isHidden ? L.dashboard.bo_chon : L.dashboard.da_chon}
              </div>
            </div>
          );
        })}
      </div>
      <div className={cn("px-4 py-3 text-sm text-gray-700 border-t")}>
        Chọn đơn vị để ẩn/hiện trên biểu đồ
      </div>
    </div>
  );
};
