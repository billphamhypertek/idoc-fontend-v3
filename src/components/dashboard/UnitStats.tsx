"use client";

import { CardStat } from "./CardStat";
import { cn } from "@/lib/utils";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import {
  Building2,
  CalendarRange,
  FileText,
  Send,
  Users,
  Filter,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  Percent,
  Shield,
  FileCheck,
  Upload,
  X,
  ChevronDown,
  Paperclip,
} from "lucide-react";
import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react"; // [FIX] thêm useRef, useEffect, useCallback
import { Section } from "./Section";
import { DateRangePicker } from "./DateRangePicker";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  useGetDashboardTracking,
  useGetTaskStatistic,
} from "@/hooks/data/dashboard.data";
import type { OrgUnit, DateRange } from "../../definitions/types/orgunit.type";
import DocOutStatsSummary from "./DocOutStatsSummary";
import DocInStatsSummary from "./DocInStatsSummary";
import AccessStatsSummary from "./AccessStatsSummary";
import ChartUnitFilterDialog from "./ChartUnitFilterDialog";
import StatBox from "./StatBox";
import OrgTreeSelect from "@/components/dashboard/OrgTreeSelect";
import type { OrgTreeNode } from "@/definitions/types/orgunit.type";

type ChartUnit = {
  orgId: string;
  orgName: string;
  completedTaskCount?: number;
  notCompletedTaskCount?: number;
  outOfDateTaskCount?: number;
};

// Memoized components for performance optimization
const TitleSection = React.memo<{ title: string; subtitle: string }>(
  ({ title, subtitle }) => (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-extrabold text-blue-800 tracking-tight flex items-center justify-center">
        <BarChart3 className="w-4 h-4 mr-1 text-blue-500" />
        {title}
      </h2>
      <span className="text-xs text-gray-500 text-center">{subtitle}</span>
    </div>
  )
);

const LegendButton = React.memo<{
  label: string;
  color: string;
  visible: boolean;
  onToggle: () => void;
}>(({ label, color, visible, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`flex items-center gap-1 px-2 py-1 rounded transition ${
      visible ? "opacity-100" : "opacity-40 line-through"
    }`}
    title="Bấm để ẩn/hiện"
  >
    <span
      className="inline-block w-4 h-4 rounded"
      style={{ background: color }}
    />
    <span>{label}</span>
  </button>
));

const FilterButton = React.memo<{
  count: number;
  onClick: () => void;
}>(({ count, onClick }) => (
  <button
    className="flex items-center gap-1 px-3 py-1 rounded border border-amber-300 bg-amber-50 text-amber-700 font-semibold hover:bg-amber-100 transition"
    onClick={onClick}
    type="button"
  >
    <Filter className="w-4 h-4 mr-1" />
    Lọc đơn vị
    <span className="ml-2 bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 text-xs font-bold">
      {count}
    </span>
  </button>
));

const CloseButton = React.memo<{ onClick: () => void }>(({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="h-10 px-2 rounded-lg border border-gray-200 hover:border-red-300 text-gray-500 hover:text-red-500 hover:bg-gray-50 transition-colors shrink-0 flex items-center justify-center"
    title="Xoá chọn đơn vị"
  >
    <X className="w-4 h-4" />
  </button>
));

TitleSection.displayName = "TitleSection";
LegendButton.displayName = "LegendButton";
FilterButton.displayName = "FilterButton";
CloseButton.displayName = "CloseButton";

export default function UnitStats() {
  const BAN_CO_YEU_CHINH_PHU_ID = "2";

  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    BAN_CO_YEU_CHINH_PHU_ID
  );
  const [cardsOrgId, setCardsOrgId] = useState<string>(BAN_CO_YEU_CHINH_PHU_ID);
  const effectiveCardsOrgId = React.useMemo(() => {
    if (selectedOrgId === "") return "";
    if (selectedOrgId === BAN_CO_YEU_CHINH_PHU_ID)
      return BAN_CO_YEU_CHINH_PHU_ID;
    return cardsOrgId || BAN_CO_YEU_CHINH_PHU_ID;
  }, [selectedOrgId, cardsOrgId]);

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [hiddenOrgIds, setHiddenOrgIds] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("year");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });

  const [orgSelectKey, setOrgSelectKey] = useState(0);
  const chartFilterRef = useRef<HTMLDivElement | null>(null);
  const orgSelectRef = useRef<HTMLDivElement | null>(null);

  const closeAllDropdowns = useCallback(() => {
    setFilterDialogOpen(false);
    setOrgSelectKey((k) => k + 1); // remount OrgTreeSelect -> đóng ngay
  }, []);

  useEffect(() => {
    if (!filterDialogOpen) return;
    const handleDown = (e: MouseEvent) => {
      if (!chartFilterRef.current) return;
      if (!chartFilterRef.current.contains(e.target as Node)) {
        setFilterDialogOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDown);
    return () => document.removeEventListener("mousedown", handleDown);
  }, [filterDialogOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!orgSelectRef.current) return;
      if (!orgSelectRef.current.contains(e.target as Node)) {
        setOrgSelectKey((k) => k + 1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== helper
  const toDate = (d?: Date | string) =>
    d ? (d instanceof Date ? d : new Date(d)) : undefined;
  const safeFromDate = toDate(dateRange.from);
  const safeToDate = toDate(dateRange.to);
  const nz = (v?: number | null) => v ?? 0;
  const isTotalRow = (name?: string) =>
    (name ?? "").trim().toUpperCase() === "TỔNG SỐ TOÀN BAN";

  const handlePeriodChange = (period: string) => {
    const now = new Date();
    let from = new Date(now.getFullYear(), 0, 1);
    let to = new Date(now.getFullYear(), 11, 31); // Mặc định cuối năm

    if (period === "quarter") {
      const q = Math.floor(now.getMonth() / 3);
      from = new Date(now.getFullYear(), q * 3, 1);
      to = new Date(now.getFullYear(), q * 3 + 3, 0); // Ngày cuối quý
    } else if (period === "month") {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Ngày cuối tháng
    } else if (period === "week") {
      const day = now.getDay();
      const diff = (day + 6) % 7; // Monday-first
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
      from.setDate(now.getDate() - diff);
      to = new Date(from);
      to.setDate(from.getDate() + 6); // Chủ nhật cuối tuần
    } else if (period === "year") {
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(now.getFullYear(), 11, 31);
    } else if (period === "custom") {
      from = (dateRange.from as Date) ?? now;
      to = (dateRange.to as Date) ?? now;
    }

    setSelectedPeriod(period);
    setDateRange({ from, to });
  };

  const { data: trackingDataAll, isLoading: loadingTrackingAll } =
    useGetDashboardTracking(BAN_CO_YEU_CHINH_PHU_ID, safeFromDate, safeToDate);

  const { data: trackingData, isLoading: loadingTracking } =
    useGetDashboardTracking(selectedOrgId || "", safeFromDate, safeToDate);

  const { data: trackingDataCards, isLoading: loadingTrackingCards } =
    useGetDashboardTracking(effectiveCardsOrgId, safeFromDate, safeToDate);

  const { data: taskStatisticData, isLoading: loadingTaskStatistic } =
    useGetTaskStatistic(
      selectedOrgId || BAN_CO_YEU_CHINH_PHU_ID,
      safeFromDate,
      safeToDate
    );

  const isLoading =
    loadingTrackingAll ||
    loadingTracking ||
    loadingTaskStatistic ||
    loadingTrackingCards;

  const orgOptions = Array.isArray(trackingDataAll?.data)
    ? (trackingDataAll.data as OrgUnit[])
        .filter((item) => item.orgName && !isTotalRow(item.orgName))
        .map((item) => ({
          orgId: String(item.orgId),
          orgName: item.orgName || String(item.orgId),
        }))
    : [];

  const trackingRows: OrgUnit[] = useMemo(() => {
    const raw = (trackingData as { data?: OrgUnit[] })?.data;
    return Array.isArray(raw) ? raw : [];
  }, [trackingData]);

  const trackingRowsCards: OrgUnit[] = useMemo(() => {
    const raw = (trackingDataCards as { data?: OrgUnit[] })?.data;
    return Array.isArray(raw) ? raw : [];
  }, [trackingDataCards]);

  const rowForCards: OrgUnit | undefined = useMemo(() => {
    if (!trackingRowsCards.length) return undefined;

    if (effectiveCardsOrgId === "") {
      return (
        trackingRowsCards.find((r) => isTotalRow(r.orgName)) ??
        trackingRowsCards[0]
      );
    }

    const byId = trackingRowsCards.find(
      (r) => String(r.orgId) === String(effectiveCardsOrgId)
    );

    return (
      byId ??
      trackingRowsCards.find((r) => !isTotalRow(r.orgName)) ??
      trackingRowsCards[0]
    );
  }, [trackingRowsCards, effectiveCardsOrgId]);

  type ChartRow = {
    orgId: string;
    orgName: string;
    completedTaskCount?: number;
    notCompletedTaskCount?: number;
    outOfDateTaskCount?: number;
    totalTasks: number;
  };

  const chartData: ChartRow[] = useMemo(() => {
    const raw: OrgUnit[] = Array.isArray(taskStatisticData?.data)
      ? (taskStatisticData.data as OrgUnit[])
      : [];
    return raw
      .filter(
        (it) =>
          it.orgName &&
          !isTotalRow(it.orgName) &&
          !hiddenOrgIds.includes(String(it.orgId))
      )
      .map((it) => {
        const completed = nz(it.completedTaskCount);
        const overdue = nz(it.outOfDateTaskCount);
        const notCompleted = nz(it.notCompletedTaskCount);
        return {
          orgId: String(it.orgId),
          orgName: it.orgName,
          completedTaskCount: completed,
          notCompletedTaskCount: notCompleted,
          outOfDateTaskCount: overdue,
          totalTasks: completed + overdue,
        };
      });
  }, [taskStatisticData, hiddenOrgIds]);

  const chartStats = useMemo(() => {
    // Kiểm tra chartData hợp lệ
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0) {
      return {
        total: 0,
        completed: 0,
        processing: 0,
        overdue: 0,
        efficiency: "0.0",
      };
    }

    let completed = 0,
      processing = 0,
      overdue = 0;

    for (const row of chartData) {
      // Kiểm tra row hợp lệ và các field
      if (row && typeof row === "object") {
        completed += Number(row.completedTaskCount) || 0;
        processing += Number(row.notCompletedTaskCount) || 0;
        overdue += Number(row.outOfDateTaskCount) || 0;
      }
    }

    const total = Number(completed) + Number(processing) + Number(overdue); // Tổng tất cả nhiệm vụ
    const efficiency =
      total > 0 ? ((Number(completed) / total) * 100).toFixed(1) : "0.0";

    const result = {
      total: isNaN(total) ? 0 : total,
      completed: isNaN(completed) ? 0 : completed,
      processing: isNaN(processing) ? 0 : processing,
      overdue: isNaN(overdue) ? 0 : overdue,
      efficiency,
    };

    // Debug logging tạm thời
    console.log("Debug chartStats:", {
      chartDataLength: chartData?.length,
      rawData: chartData?.slice(0, 3),
      calculation: { completed, processing, overdue, total, efficiency },
      result,
    });

    return result;
  }, [chartData]);

  // Tính toán max value động cho YAxis với bước nhảy nhỏ hơn
  const maxValue = useMemo(() => {
    if (!chartData || !Array.isArray(chartData) || chartData.length === 0)
      return 16;

    // Kiểm tra và filter data hợp lệ
    const validTasks = chartData
      .filter(
        (d) => d && typeof d.totalTasks === "number" && !isNaN(d.totalTasks)
      )
      .map((d) => d.totalTasks);

    if (validTasks.length === 0) return 16;

    const maxTotalTasks = Math.max(...validTasks);

    // Làm tròn lên với bước nhảy nhỏ để chart đẹp hơn
    const ranges = [2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 40, 50];
    for (const range of ranges) {
      if (maxTotalTasks <= range) return range;
    }

    // Với số lớn hơn, làm tròn lên theo bước 6-8
    return Math.ceil(maxTotalTasks / 8) * 8;
  }, [chartData]);

  // Tạo ticks động với bước nhảy = 2
  const yAxisTicks = useMemo(() => {
    const step = 2; // Bước nhảy cố định = 2
    const ticks = [];
    for (let i = 0; i <= maxValue; i += step) {
      ticks.push(i);
    }
    return ticks.length > 12 ? [0, maxValue / 2, maxValue] : ticks;
  }, [maxValue]);

  // Columns definition for tables
  const outboundColumns: Column<OrgUnit>[] = useMemo(
    () => [
      {
        header: (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Đơn vị</span>
          </div>
        ),
        accessor: "orgName",
        className: "font-medium text-left",
      },
      {
        header: (
          <div className="flex items-center gap-2 justify-center">
            <FileCheck className="w-4 h-4 text-orange-500" />
            <span className="font-semibold text-orange-500">Giấy</span>
          </div>
        ),
        accessor: (item) => nz(item.scanDocOut),
        className: "text-orange-500 font-semibold text-center",
      },
      {
        header: (
          <div className="flex items-center gap-2 justify-center">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-600">Toàn trình</span>
          </div>
        ),
        accessor: (item) => nz(item.fullProcessDocOut),
        className: "text-green-600 font-semibold text-center",
      },
      {
        header: (
          <div className="flex items-center gap-2 justify-center">
            <AlertCircle className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-purple-600">
              Không toàn trình
            </span>
          </div>
        ),
        accessor: (item) => nz(item.signedDocOut),
        className: "text-purple-600 font-semibold text-center",
      },
      {
        header: (
          <div className="flex items-center gap-2 justify-center">
            <Send className="w-4 h-4 text-blue-700" />
            <span className="font-semibold text-blue-700">Gửi trong ban</span>
          </div>
        ),
        accessor: (item) => nz(item.normalInDocOut),
        className: "text-blue-700 font-semibold text-center",
      },
      {
        header: (
          <div className="flex items-center gap-2 justify-center">
            <Upload className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-indigo-600">Gửi ngoài ban</span>
          </div>
        ),
        accessor: (item) => nz(item.normalOutDocOut),
        className: "text-indigo-600 font-semibold text-center",
      },
      {
        header: (
          <div className="flex items-center gap-2 justify-center">
            <Paperclip className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-600">VB thường</span>
          </div>
        ),
        accessor: (item) => nz(item.normalDoc),
        className: "text-blue-600 font-semibold text-center",
      },
      {
        header: (
          <div className="flex items-center gap-2 justify-center">
            <BarChart3 className="w-4 h-4 text-gray-700" />
            <span className="font-bold text-gray-700">Tổng VB đi</span>
          </div>
        ),
        accessor: (item) => nz(item.totalDocOut),
        className: "font-bold text-gray-700 text-center bg-gray-50",
      },
    ],
    []
  );

  // Columns definition for inbound documents table
  const inboundColumns: Column<OrgUnit>[] = useMemo(
    () => [
      {
        header: (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Đơn vị</span>
          </div>
        ),
        accessor: "orgName",
        className: "font-medium text-left",
      },
      {
        header: (
          <div className="flex items-center gap-2 justify-center">
            <FileCheck className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-600">Số lượng</span>
          </div>
        ),
        accessor: (item) => nz(item.digitalHandleDoc),
        className: "text-blue-600 font-bold text-center",
      },
      {
        header: (
          <div className="flex items-center gap-2 justify-center">
            <Paperclip className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-600">Văn thư</span>
          </div>
        ),
        accessor: (item) => nz(item.vtDoc),
        className: "text-blue-600 font-semibold text-center",
      },
      {
        header: (
          <div className="flex flex-col items-center gap-1 justify-center">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-orange-500 text-center">
                Trưởng phòng
              </span>
            </div>
            <span className="font-semibold text-orange-500 text-center">
              hành chính
            </span>
          </div>
        ),
        accessor: (item) => nz(item.tphcDoc),
        className: "text-orange-500 font-semibold text-center",
      },
      {
        header: (
          <div className="flex flex-col items-center gap-1 justify-center">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600 text-center">
                Lãnh đạo
              </span>
            </div>
            <span className="font-semibold text-green-600 text-center">
              đơn vị
            </span>
          </div>
        ),
        accessor: (item) => nz(item.lddvDoc),
        className: "text-green-600 font-semibold text-center",
      },
      {
        header: (
          <div className="flex flex-col items-center gap-1 justify-center">
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span className="font-semibold text-red-500 text-center">
                Lãnh đạo
              </span>
            </div>
            <span className="font-semibold text-red-500 text-center">
              phòng
            </span>
          </div>
        ),
        accessor: (item) => nz(item.ldpDoc),
        className: "text-red-500 font-semibold text-center",
      },
      {
        header: (
          <div className="flex flex-col items-center gap-1 justify-center">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="font-semibold text-gray-500 text-center">
                Trợ lý,
              </span>
            </div>
            <span className="font-semibold text-gray-500 text-center">
              Nhân viên
            </span>
          </div>
        ),
        accessor: (item) => nz(item.nvDoc),
        className: "text-gray-500 font-semibold text-center",
      },
    ],
    []
  );

  // Columns definition for system access table
  const accessColumns: Column<OrgUnit>[] = useMemo(
    () => [
      {
        header: (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">Đơn vị</span>
          </div>
        ),
        accessor: "orgName",
        className: "font-medium text-left",
      },
      {
        header: (
          <div className="flex flex-col items-center gap-1 justify-center">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-blue-600 text-center">
                Tổng số TK
              </span>
            </div>
            <span className="font-semibold text-blue-600 text-center">
              đã cấp
            </span>
          </div>
        ),
        accessor: (item) => nz(item.totalUser),
        className: "text-blue-600 font-semibold text-center",
      },
      {
        header: (
          <div className="flex flex-col items-center gap-1 justify-center">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-green-600 text-center">
                Số TK
              </span>
            </div>
            <span className="font-semibold text-green-600 text-center">
              truy cập
            </span>
          </div>
        ),
        accessor: (item) => nz(item.loginUser),
        className: "text-green-600 font-semibold text-center",
      },
      {
        header: (
          <div className="flex flex-col items-center gap-1 justify-center">
            <div className="flex items-center gap-1">
              <Percent className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-orange-500 text-center">
                Tỉ lệ
              </span>
            </div>
            <span className="font-semibold text-orange-500 text-center">
              truy cập (%)
            </span>
          </div>
        ),
        accessor: (item) => {
          const totalUser = nz(item.totalUser);
          const loginUser = nz(item.loginUser);
          return totalUser
            ? ((loginUser / totalUser) * 100).toFixed(2)
            : "0.00";
        },
        className: "text-orange-500 font-bold text-center",
      },
    ],
    []
  );

  // Memoized StatBoxes để tránh re-render không cần thiết
  const statBoxesMemo = useMemo(
    () => (
      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 mb-6")}>
        <StatBox
          color="green"
          value={chartStats.total}
          label="Tổng nhiệm vụ"
          className={cn(
            "transition-all duration-300 text-base md:text-sm min-h-[60px] md:min-h-[50px]",
            "!bg-[#FFF8DC] !border-0 !shadow-none !text-[#C19A6B]"
          )}
          valueClass={cn("text-xl font-extrabold !text-[#C19A6B]")}
        />
        <StatBox
          color="blue"
          value={chartStats.completed}
          label="Đã hoàn thành"
          className={cn(
            "transition-all duration-300 text-base md:text-sm min-h-[60px] md:min-h-[50px]",
            "!bg-[#D1F2EB] !border-0 !shadow-none !text-[#17A589]"
          )}
          valueClass={cn("text-xl font-extrabold !text-[#17A589]")}
        />
        <StatBox
          color="yellow"
          value={chartStats.processing}
          label="Đang xử lý"
          className={cn(
            "transition-all duration-300 text-base md:text-sm min-h-[60px] md:min-h-[50px]",
            "!bg-[#EBF5FB] !border-0 !shadow-none !text-[#5DADE2]"
          )}
          valueClass={cn("text-xl font-extrabold !text-[#5DADE2]")}
        />
        <StatBox
          color="orange"
          value={chartStats.overdue}
          label="Quá hạn"
          className={cn(
            "transition-all duration-300 text-base md:text-sm min-h-[60px] md:min-h-[50px]",
            "!bg-[#FADBD8] !border-0 !shadow-none !text-[#EC7063]"
          )}
          valueClass={cn("text-xl font-extrabold !text-[#EC7063]")}
        />
      </div>
    ),
    [chartStats]
  );

  const [seriesVisible, setSeriesVisible] = useState({
    total: true,
    completed: true,
    processing: true,
    overdue: true,
  });
  const toggleSeries = (key: keyof typeof seriesVisible) =>
    setSeriesVisible((s) => ({ ...s, [key]: !s[key] }));

  if (isLoading) {
    return (
      <div className={cn("flex justify-center items-center min-h-[200px]")}>
        <div
          className={cn(
            "w-8 h-9 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
          )}
        />
      </div>
    );
  }

  const cardTotalDoc = nz(rowForCards?.totalDoc);
  const cardNormalDoc = nz(rowForCards?.normalDoc);
  const cardSecretDoc = nz(rowForCards?.secretDoc);

  const cardTotalDocOut = nz(rowForCards?.totalDocOut);
  const cardScanDocOut = nz(rowForCards?.scanDocOut);
  const cardFullProcess = nz(rowForCards?.fullProcessDocOut);
  const cardInternalSend = nz(rowForCards?.normalInDocOut);
  const cardExternalSend = nz(rowForCards?.normalOutDocOut);

  const cardTotalUser = nz(rowForCards?.totalUser);
  const cardLoginUser = nz(rowForCards?.loginUser);
  const cardNotLogin = Math.max(cardTotalUser - cardLoginUser, 0);
  const cardAccessRate = cardTotalUser
    ? ((cardLoginUser / cardTotalUser) * 100).toFixed(2)
    : "0.00";

  return (
    <div className={cn("space-y-8")}>
      {/* Advanced Filters with improved UI */}
      <div className="flex flex-wrap gap-6 items-start">
        {/* Đơn vị */}
        <div className="flex flex-col gap-3 flex-shrink-0" ref={orgSelectRef}>
          <OrgTreeSelect
            key={orgSelectKey}
            value={selectedOrgId}
            onChange={(node: OrgTreeNode) => {
              setSelectedOrgId(node.id);
              setCardsOrgId(
                node.type === "org"
                  ? node.id
                  : node.parentId || BAN_CO_YEU_CHINH_PHU_ID
              );
            }}
            placeholder={
              selectedOrgId === ""
                ? "Tổng toàn ban"
                : (orgOptions.find((u) => u.orgId === selectedOrgId)?.orgName ??
                  "Tất cả đơn vị")
            }
          />
        </div>

        {/* Kỳ */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              onMouseDown={closeAllDropdowns}
              className="h-10 w-auto min-w-[160px] px-4 pr-8 rounded-lg border border-blue-300 bg-white text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 hover:border-blue-400 appearance-none shadow-sm"
            >
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm nay</option>
              <option value="custom">Tùy chọn</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>
        {/* Khoảng thời gian */}
        <div className="flex flex-col gap-3 flex-shrink-0">
          <div className="relative">
            <DateRangePicker
              dateRange={dateRange}
              selectedPeriod={selectedPeriod}
              onDateChange={(range) => {
                setDateRange(range);
                setSelectedPeriod("custom");
              }}
              onPeriodChange={(p) => handlePeriodChange(p)}
              className="h-10 w-auto min-w-[200px] px-4 rounded-lg border border-blue-300 bg-white text-blue-700 font-medium focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition-all duration-200 hover:border-blue-400 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* CARDS */}
      <div className={cn("grid grid-cols-1 md:grid-cols-3 gap-6")}>
        <CardStat
          icon={<Paperclip className={cn("w-4 h-4 text-blue-600")} />}
          title="Văn bản đến"
          subtitle="Tổng văn bản"
          bg="bg-blue-50"
          titleColor="text-black"
          valueClass={cn("text-[40px] font-extrabold text-blue-700")}
          value={cardTotalDoc}
          detail={[
            {
              label: "Văn bản thường",
              value: cardNormalDoc,
              valueClass: cn("text-blue-500 font-bold text-lg text-right"),
            },
            {
              label: "Văn bản mật",
              value: cardSecretDoc,
              valueClass: cn("text-blue-400 font-bold text-lg text-right"),
            },
          ]}
        />

        <CardStat
          icon={<Send className={cn("w-4 h-4 text-yellow-600")} />}
          title="Văn bản đi"
          subtitle="Tổng văn bản"
          bg="bg-yellow-50"
          titleColor="text-black"
          valueClass={cn("text-[40px] font-extrabold text-yellow-700")}
          value={cardTotalDocOut}
          detail={[
            {
              label: "Giấy",
              value: cardScanDocOut,
              valueClass: cn("text-orange-500 font-bold text-lg text-right"),
            },
            {
              label: "Toàn trình",
              value: cardFullProcess,
              valueClass: cn("text-emerald-600 font-bold text-lg text-right"),
            },
            {
              label: "Nội bộ",
              value: cardInternalSend,
              valueClass: cn("text-blue-700 font-bold text-lg text-right"),
            },
            {
              label: "Ngoài ban",
              value: cardExternalSend,
              valueClass: cn("text-indigo-600 font-bold text-lg text-right"),
            },
          ]}
        />

        <CardStat
          icon={<Users className={cn("w-4 h-4 text-purple-700")} />}
          title="Truy cập hệ thống"
          subtitle="Tỷ lệ truy cập"
          bg="bg-white"
          titleColor="text-black"
          valueClass={cn("text-[40px] font-extrabold text-purple-700")}
          value={`${cardAccessRate} %`}
          detail={[
            {
              label: "Tổng TK",
              value: cardTotalUser,
              valueClass: cn("text-blue-500 font-bold text-lg text-right"),
            },
            {
              label: "Đã truy cập",
              value: cardLoginUser,
              valueClass: cn("text-emerald-600 font-bold text-lg text-right"),
            },
            {
              label: "Chưa truy cập",
              value: cardNotLogin,
              valueClass: cn("text-gray-400 font-bold text-lg text-right"),
            },
          ]}
        />
      </div>

      {/* ===== CHART + STATBOX ===== */}
      <div
        className={cn(
          "bg-white rounded-xl shadow-lg p-8 border border-gray-100"
        )}
      >
        <div
          className={cn(
            "flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-2"
          )}
        >
          <TitleSection
            title="Phân phối nhiệm vụ theo đơn vị"
            subtitle="Số lượng nhiệm vụ và tiến độ hoàn thành"
          />

          <div className={cn("flex-1")} />
          <div
            className={cn(
              "flex items-center gap-2 relative justify-end min-w-[180px]"
            )}
            ref={chartFilterRef}
          >
            <FilterButton
              count={chartData.length}
              onClick={() => {
                closeAllDropdowns();
                setFilterDialogOpen(true);
              }}
            />
            {filterDialogOpen && (
              <div className={cn("absolute right-0 top-full z-30 mt-2")}>
                <ChartUnitFilterDialog
                  open={true}
                  onClose={() => setFilterDialogOpen(false)}
                  units={
                    Array.isArray(taskStatisticData?.data)
                      ? (taskStatisticData.data as OrgUnit[])
                          .filter(
                            (u) =>
                              u.orgName &&
                              u.orgName.trim().toUpperCase() !==
                                "TỔNG SỐ TOÀN BAN"
                          )
                          .map<ChartUnit>((u) => ({
                            orgId: String(u.orgId),
                            orgName: u.orgName,
                            completedTaskCount:
                              u.completedTaskCount ?? undefined,
                            notCompletedTaskCount:
                              u.notCompletedTaskCount ?? undefined,
                            outOfDateTaskCount:
                              u.outOfDateTaskCount ?? undefined,
                          }))
                      : []
                  }
                  hiddenOrgIds={hiddenOrgIds}
                  setHiddenOrgIds={setHiddenOrgIds}
                />
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className={cn("flex justify-center mb-2")}>
          <div className={cn("flex gap-4 text-sm")}>
            {[
              { key: "total", label: "Tổng nhiệm vụ", color: "#F5DEB3" },
              { key: "completed", label: "Đã hoàn thành", color: "#10B981" },
              { key: "processing", label: "Đang thực hiện", color: "#3B82F6" },
              { key: "overdue", label: "Quá hạn", color: "#EF4444" },
            ].map((i) => (
              <LegendButton
                key={i.key}
                label={i.label}
                color={i.color}
                visible={seriesVisible[i.key as keyof typeof seriesVisible]}
                onToggle={() =>
                  toggleSeries(i.key as keyof typeof seriesVisible)
                }
              />
            ))}
          </div>
        </div>

        <div className={cn("h-[500px]")}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid stroke="#f0f0f0" />
              <XAxis
                dataKey="orgName"
                interval={0}
                angle={chartData.length <= 1 ? 0 : -15}
                textAnchor={chartData.length <= 1 ? "middle" : "end"}
                height={chartData.length <= 1 ? 80 : 120}
                tick={{ fontSize: 12 }}
              />
              <YAxis ticks={yAxisTicks} domain={[0, maxValue]} />
              <Tooltip />
              <Bar
                dataKey="totalTasks"
                name="Tổng nhiệm vụ"
                fill="#F5DEB3"
                hide={!seriesVisible.total}
              />
              <Bar
                dataKey="completedTaskCount"
                name="Đã hoàn thành"
                fill="#10B981"
                hide={!seriesVisible.completed}
              />
              <Bar
                dataKey="notCompletedTaskCount"
                name="Đang thực hiện"
                fill="#3B82F6"
                hide={!seriesVisible.processing}
              />
              <Bar
                dataKey="outOfDateTaskCount"
                name="Quá hạn"
                fill="#EF4444"
                hide={!seriesVisible.overdue}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* StatBoxes */}
        {statBoxesMemo}
        <div
          className={cn(
            "mt-6 bg-gradient-to-l from-green-50 to-green-100 rounded-xl p-6 text-center text-lg font-bold text-green-800 flex items-center justify-center gap-3 border border-green-200 shadow-sm"
          )}
        >
          <TrendingUp className="w-4 h-4 text-green-700" />
          Hiệu suất hoàn thành:{" "}
          <span className={cn("font-bold")}>{chartStats.efficiency}%</span>
        </div>
      </div>

      {/* Bảng văn bản đi */}
      <Section
        title="Tình hình quản lý văn bản đi ở các đơn vị"
        subtitle="Thống kê chi tiết văn bản đi theo từng phòng ban trong Ban Cơ yếu Chính phủ"
        icon={<Send className="w-4 h-4 text-yellow-600" />}
      >
        <Table
          columns={outboundColumns}
          dataSource={trackingRows}
          className="text-sm"
          bgColor="bg-white"
          showPagination={false}
        />
      </Section>

      {/* Bảng văn bản đến */}
      <Section
        title="Tình hình quản lý văn bản đến tại các đơn vị"
        subtitle="Phân công xử lý văn bản đến theo cấp độ trách nhiệm tại từng đơn vị"
        icon={<Paperclip className="w-4 h-4 text-blue-600" />}
      >
        <Table
          columns={inboundColumns}
          dataSource={trackingRows}
          className="text-sm"
          bgColor="bg-white"
          showPagination={false}
        />
      </Section>

      {/* Bảng truy cập */}
      <Section
        title="Thống kê tình hình truy cập hệ thống"
        subtitle="Tình hình sử dụng và truy cập hệ thống quản lý văn bản theo từng đơn vị"
        icon={<Users className="w-4 h-4 text-purple-700" />}
      >
        <Table
          columns={accessColumns}
          dataSource={trackingRows}
          className="text-sm"
          bgColor="bg-white"
          showPagination={false}
        />
      </Section>
    </div>
  );
}
