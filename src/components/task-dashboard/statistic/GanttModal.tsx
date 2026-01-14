"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useGetTaskStatisticDetail,
  useLoadUserTasks,
} from "@/hooks/data/task-dashboard.data";
import "@/styles/GanttModal.css";

interface GanttTask {
  rawPercent?: number;
  taskName?: string;
  name?: string;
  startDate: Date;
  endDate: Date;
  dayLeft: number;
  percent: number;
  status: "overdue" | "late" | "warning" | "doing" | "4";
  handleTime?: number;
}

interface GanttModalProps {
  show: boolean;
  selectedOrgId: any;
  onClose: () => void;
  filterParams?: {
    weekCheck: boolean;
    monthCheck: boolean;
    yearCheck: boolean;
    fromDate: string;
    toDate: string;
  };
  selectedUsers: { orgId: string; orgName: string } | null;
  isStatisticDetail?: boolean;
  taskName?: string;
  isV2?: boolean;
}

const STATUS_ITEMS = [
  { className: "lg-overdue", label: "Quá hạn" },
  { className: "lg-late", label: "Trễ hạn" },
  { className: "lg-warning", label: "Sắp tới hạn" },
  { className: "lg-doing", label: "Đang thực hiện" },
  { className: "lg-done", label: "Hoàn thành" },
  { className: "lg-done-overdue", label: "Hoàn thành quá hạn" },
] as const;

export default function GanttModal({
  show,
  selectedOrgId,
  onClose,
  filterParams,
  selectedUsers,
  isStatisticDetail = false,
  taskName,
  isV2 = false,
}: GanttModalProps) {
  const [ganttTasks, setGanttTasks] = useState<GanttTask[]>([]);
  const [ganttHoveredTask, setGanttHoveredTask] = useState<GanttTask | null>(
    null
  );
  const [ganttTooltipStyle, setGanttTooltipStyle] = useState<any>({});
  const modalRef = useRef<HTMLDivElement>(null);

  // Hooks
  const loadUserTasksMutation = useLoadUserTasks(isV2 ?? false);
  const getTaskStatisticDetailMutation = useGetTaskStatisticDetail(
    isV2 ?? false
  );

  useEffect(() => {
    if (show && selectedOrgId) {
      loadGanttTasks(selectedOrgId);
    }
  }, [show, selectedOrgId, filterParams]);

  const loadGanttTasks = async (userId: any) => {
    try {
      const raw = isStatisticDetail
        ? await getTaskStatisticDetailMutation.mutateAsync({
            orgId: userId,
            startDate: filterParams?.fromDate || "",
            endDate: filterParams?.toDate || "",
          })
        : await loadUserTasksMutation.mutateAsync({
            userId,
            weekCheck: filterParams?.weekCheck || false,
            monthCheck: filterParams?.monthCheck || false,
            yearCheck: filterParams?.yearCheck || false,
            fromDate: filterParams?.fromDate || "",
            toDate: filterParams?.toDate || "",
          });

      // Xử lý data có thể là nested array (data: [[...]])
      let arr: any[] = [];
      if (isStatisticDetail && Array.isArray(raw)) {
        // Nếu là nested array, flatten nó
        arr = raw.flat().filter((item) => item != null);
      } else {
        arr = Array.isArray(raw) ? raw : raw ? [raw] : [];
      }

      // map + phân loại
      const mapped = arr.map((t: any) => classifyTaskByHandleTime(t));

      // Sắp xếp: Quá hạn → Trễ hạn → Đang thực hiện → Hoàn thành
      const order: Record<string, number> = {
        overdue: 0,
        late: 1,
        doing: 2,
        "4": 3,
        warning: 2,
      };
      mapped.sort((a: any, b: any) => {
        const oa = order[a.status] == null ? 99 : order[a.status];
        const ob = order[b.status] == null ? 99 : order[b.status];
        if (oa !== ob) return oa - ob;
        return (b.percent || 0) - (a.percent || 0);
      });

      setGanttTasks(mapped);
      setGanttHoveredTask(null);
    } catch (e) {
      setGanttTasks([]);
    }
  };

  /* === Phân loại dùng handleTime hoặc progress ===
     Quy tắc:
     - status == '4' hoặc done == true → xanh lá
     - % >= 100 → Quá hạn (đỏ)
     - 75 < % < 100 → Trễ hạn (cam)
     - 50 < % <= 75 → Sắp tới hạn (vàng) → vẫn xếp vào "Đang thực hiện" trong legend theo yêu cầu
     - % <= 50 → Đang thực hiện (xanh dương)
     - handleTime 130 → hiển thị 100%
     - Với isStatisticDetail: sử dụng progress thay vì handleTime
  */
  const classifyTaskByHandleTime = (task: any): GanttTask => {
    const start = new Date(Number(task.startDate) || Date.now());
    const end = new Date(Number(task.endDate) || Date.now());

    // Với isStatisticDetail, sử dụng progress thay vì handleTime
    let raw: number;
    if (isStatisticDetail && task.progress !== undefined) {
      raw = Number(task.progress);
    } else {
      raw = Number(task.handleTime);
    }
    const usedPct = isNaN(raw) ? 0 : raw; // có thể > 100

    const MAX_HANDLE_TIME_FOR_DISPLAY = 120;

    const normalizedPct = (usedPct / MAX_HANDLE_TIME_FOR_DISPLAY) * 100;
    const displayPct = Math.max(0, Math.min(100, normalizedPct)); // clamp để vẽ chiều rộng

    const dayLeft =
      typeof task.dayLeft === "number"
        ? task.dayLeft
        : Number(task.dayLeft) || 0;

    let status = "doing";

    // Với isStatisticDetail, kiểm tra done hoặc status
    const isCompleted = isStatisticDetail
      ? task.done === true || String(task.status) === "4"
      : String(task.status) === "4";

    if (isCompleted) {
      // Đã hoàn thành
      if (dayLeft < 0 || usedPct > 100) {
        status = "done-overdue"; // Hoàn thành quá hạn (hồng)
      } else {
        status = "4"; // Hoàn thành đúng hạn (xanh lá)
      }
    } else {
      // Đang thực hiện
      if (dayLeft < 0 || usedPct >= 100) {
        status = "overdue"; // Quá hạn (đỏ)
      } else if (usedPct > 75) {
        status = "late"; // Trễ hạn > 3/4 (cam)
      } else if (usedPct > 50) {
        status = "warning"; // Sắp tới hạn > 50% (vàng)
      } else {
        status = "doing"; // Đang thực hiện < 50% (xanh dương)
      }
    }

    return {
      ...task,
      name: task.taskName || task.name || "Công việc",
      startDate: start,
      endDate: end,
      dayLeft: dayLeft,
      percent: displayPct,
      rawPercent: usedPct,
      status,
    };
  };

  /* === Tooltip === */
  const onGanttTaskHover = (task: GanttTask, ev: React.MouseEvent) => {
    setGanttHoveredTask(task);

    // Lấy rect của item và modal
    const itemRect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const modalRect = modalRef.current?.getBoundingClientRect();

    if (modalRect) {
      // Tính vị trí tương đối trong modal
      const top = itemRect.top - modalRect.top;
      const left = itemRect.left - modalRect.left;

      // Đặt tooltip phía trên item
      setGanttTooltipStyle({
        top: top + "px",
        left: left + itemRect.width / 2 + "px",
      });
    }
  };

  const onGanttTaskLeave = () => {
    setGanttHoveredTask(null);
  };

  /* === Màu theo trạng thái === */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "#EF4444"; // Đỏ - Quá hạn (đang thực hiện)
      case "late":
        return "#F59E0B"; // Cam - Trễ hạn > 3/4
      case "warning":
        return "#FCD34D"; // Vàng - Sắp tới hạn > 50%
      case "doing":
        return "#3B82F6"; // Xanh dương - Đang thực hiện < 50%
      case "4":
        return "#10B981"; // Xanh lá - Hoàn thành đúng hạn
      case "done-overdue":
        return "#EC4899"; // Hồng - Hoàn thành quá hạn
      default:
        return "#9CA3AF";
    }
  };

  const closeGanttChart = () => {
    setGanttHoveredTask(null);
    onClose();
  };

  const formatDate = (date: Date): string => {
    const dd = ("0" + date.getDate()).slice(-2);
    const mm = ("0" + (date.getMonth() + 1)).slice(-2);
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const modalHeight = useMemo(() => {
    const headerHeight = 48;
    const legendHeight = 40;
    const ganttHeaderHeight = 45;
    const rowHeight = 45;
    const padding = 16;
    const emptyStateHeight = 150;

    let tasksHeight: number;
    if (ganttTasks.length === 0) {
      tasksHeight = emptyStateHeight;
    } else {
      tasksHeight = ganttTasks.length * rowHeight;
    }

    const totalHeight =
      headerHeight + legendHeight + ganttHeaderHeight + tasksHeight + padding;
    const maxHeight =
      typeof window !== "undefined" ? window.innerHeight * 0.9 : 800;
    const minHeight = 300;

    return Math.min(Math.max(totalHeight, minHeight), maxHeight);
  }, [ganttTasks.length]);

  return (
    <Dialog open={show} onOpenChange={closeGanttChart}>
      <DialogContent
        ref={modalRef}
        className="max-w-[95vw] w-[1400px] max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col"
        style={{ height: `${modalHeight}px` }}
      >
        <DialogHeader className="px-4 py-3 border-b bg-gray-50 shrink-0">
          <DialogTitle className="text-base font-bold">
            Tình hình thực hiện công việc
            {selectedUsers && (
              <span className="text-sm font-bold">
                {" "}
                - {selectedUsers.orgName}
              </span>
            )}
            {taskName && (
              <span className="text-md font-bold text-blue-500">
                {" "}
                - {taskName}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <div className="gantt-legend shrink-0">
            {STATUS_ITEMS.map((item) => (
              <span key={item.className} className={`lg ${item.className}`}>
                <i></i>
                {item.label}
              </span>
            ))}
          </div>

          {/* 1 container cuộn chung */}
          <div
            className="gantt-scroller flex-1 min-h-0"
            style={{ overflowY: "auto", overflowX: "hidden" }}
          >
            <div className="gantt-row gantt-row--head">
              <div className="cell cell-name cell-name--head">Công việc</div>
              <div className="cell cell-chart cell-chart--head">
                <div className="chart-head">
                  <div className="mh">Đang thực hiện</div>
                </div>
                <div className="chart-lines">
                  <div className="v50">
                    <span>Sắp tới hạn</span>
                  </div>
                  <div className="v100">
                    <span>Quá hạn</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Các hàng dữ liệu */}
            {ganttTasks.map((t, index) => (
              <div className="gantt-row" key={index}>
                <div className="cell cell-name" title={t.name}>
                  <span className="cell-name-text">{t.name}</span>
                </div>
                <div className="cell cell-chart">
                  <div className="chart-lines"></div>
                  <div
                    className="bar"
                    style={{
                      width: `${t.percent}%`,
                      background: getStatusColor(t.status),
                    }}
                    onMouseEnter={(e) => {
                      onGanttTaskHover(t, e);
                    }}
                    onMouseLeave={(e) => {
                      onGanttTaskLeave();
                    }}
                  >
                    <div className="bar-las">
                      {(t.rawPercent || t.percent).toFixed(2)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* tooltip - đặt ngoài container có overflow-hidden */}
        {ganttHoveredTask && (
          <div
            className="gantt-tip"
            style={{
              top: ganttTooltipStyle.top,
              left: ganttTooltipStyle.left,
            }}
          >
            <div className="tip-box">
              <div className="tline">
                <b>Ngày giao việc:</b> {formatDate(ganttHoveredTask.startDate)}
              </div>
              <div className="tline">
                <b>Kết thúc:</b> {formatDate(ganttHoveredTask.endDate)}
              </div>
              {ganttHoveredTask.status !== "4" && (
                <div className="tline">
                  <b>{ganttHoveredTask.dayLeft < 0 ? "Quá hạn" : "Còn lại:"}</b>{" "}
                  {ganttHoveredTask.dayLeft < 0
                    ? -ganttHoveredTask.dayLeft
                    : ganttHoveredTask.dayLeft}{" "}
                  ngày
                </div>
              )}
              {ganttHoveredTask.status === "4" && (
                <div className="tline">
                  <b>Trạng thái:</b> Hoàn thành
                </div>
              )}
            </div>
            <div className="tip-arrow"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
