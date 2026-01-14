"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  CircleCheck,
  Clock,
} from "lucide-react";
import StatisticFilter from "./statisticFilter";
import StatisticCard from "./statisticCard";
import StatisticChartContent from "./statisticChartContent";
import GanttModal from "./GanttModal";
import {
  useGetTaskDashboardData,
  useGetTaskDashboardByDepartment,
} from "@/hooks/data/task.data";
import {
  useLoadDepartmentData,
  useLoadDashboardList,
} from "@/hooks/data/task-dashboard.data";
import { handleError } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { usePathname } from "next/navigation";
import { getUserInfo } from "@/utils/token.utils";

interface StatisticContentProps {
  orgIdSelected?: number;
  listUser?: any[];
  idDonVi?: number | number[];
  listPhong?: any[];
  callPhong?: (isDonvi: boolean, id: any) => void;
  callDonvi?: (isDonvi: boolean, id: any) => void;
  callBack?: () => void;
}

interface DrillStackItem {
  level: "department" | "room" | "user";
  id: string;
  label: string;
  barData: any[];
}

export default function StatisticContent({
  orgIdSelected,
  listUser,
  idDonVi,
  listPhong,
  callPhong,
  callDonvi,
  callBack,
}: StatisticContentProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showGanttChart, setShowGanttChart] = useState(false);
  const [selectedOrgForGantt, setSelectedOrgForGantt] = useState<any>(null);
  const [selectedUsersForGantt, setSelectedUsersForGantt] = useState<{
    orgId: string;
    orgName: string;
  } | null>(null);

  const [drillLevel, setDrillLevel] = useState<"department" | "room" | "user">(
    "department"
  );
  const [drillStack, setDrillStack] = useState<DrillStackItem[]>([]);
  const [currentOrgId, setCurrentOrgId] = useState<string>("");
  const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(
    null
  );
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [customBarData, setCustomBarData] = useState<any[] | null>(null);

  const pathname = usePathname();
  const isV2 = useMemo(() => pathname?.includes("task-v2"), [pathname]);

  const userInfo = JSON.parse(getUserInfo() || "{}");
  const currentUserOrgId = userInfo?.org;

  const orgCheck = orgIdSelected ? orgIdSelected : currentUserOrgId;

  // Hooks for data loading
  const loadDepartmentMutation = useLoadDepartmentData(isV2 ?? false);
  const loadDashboardListMutation = useLoadDashboardList(isV2 ?? false);

  const filterParams = useMemo(() => {
    const weekCheck = activeFilter === "week";
    const monthCheck = activeFilter === "month";
    const yearCheck = activeFilter === "year";

    return {
      weekCheck,
      monthCheck,
      yearCheck,
      fromDate: activeFilter === "custom" ? startDate : "",
      toDate: activeFilter === "custom" ? endDate : "",
    };
  }, [activeFilter, startDate, endDate]);

  const normalizeOrgId = (orgId: any) => {
    return orgId && orgId !== "undefined" ? String(orgId) : "";
  };

  const { data: dashboardData, isLoading: isDashboardLoading } =
    useGetTaskDashboardData(
      normalizeOrgId(orgCheck),
      "",
      filterParams.weekCheck,
      filterParams.monthCheck,
      filterParams.yearCheck,
      filterParams.fromDate,
      filterParams.toDate,
      !!orgCheck,
      isV2
    );

  const { data: barChartData, isLoading: isBarChartLoading } =
    useGetTaskDashboardByDepartment(
      normalizeOrgId(orgCheck),
      filterParams.weekCheck,
      filterParams.monthCheck,
      filterParams.yearCheck,
      filterParams.fromDate,
      filterParams.toDate,
      !!orgCheck,
      isV2
    );

  const barData = useMemo(() => {
    if (
      drillLevel !== "department" &&
      customBarData &&
      customBarData.length > 0
    ) {
      return customBarData;
    }

    if (!barChartData || !Array.isArray(barChartData)) return [];

    return barChartData.map((item: any) => ({
      orgId: item.orgId,
      orgName: item.orgName || item.name || "N/A",
      doingBcyTask: item.doingBcyTask || 0,
      doneBcyTask: item.doneBcyTask || 0,
      outDateBcyTask: item.outDateBcyTask || 0,
      totalBcyTask:
        (item.doingBcyTask || 0) +
        (item.doneBcyTask || 0) +
        (item.outDateBcyTask || 0),
      checkUser: item.checkUser,
    }));
  }, [barChartData, customBarData, drillLevel]);

  const statisticCards = useMemo(
    () => [
      {
        title: "Tổng công việc",
        value: dashboardData?.totalBcyTask || 0,
        icon: <BriefcaseBusiness />,
        borderColor: "#4f46e5",
        iconBgColor: "#E0E7FF",
        iconColor: "#4f46e5",
      },
      {
        title: "Đã hoàn thành",
        value: dashboardData?.doneBcyTask || 0,
        icon: <CircleCheck />,
        borderColor: "#10B981",
        iconBgColor: "#D1FAE5",
        iconColor: "#10B981",
      },
      {
        title: "Đang xử lý",
        value: dashboardData?.doingBcyTask || 0,
        icon: <Clock />,
        borderColor: "#F59E0B",
        iconBgColor: "#FEF3C7",
        iconColor: "#F59E0B",
      },
      {
        title: "Quá hạn",
        value: dashboardData?.outDateBcyTask || 0,
        icon: <AlertCircle />,
        borderColor: "#EF4444",
        iconBgColor: "#FEE2E2",
        iconColor: "#EF4444",
      },
    ],
    [dashboardData]
  );

  const resetDrill = () => {
    setDrillLevel("department");
    setDrillStack([]);
    setCustomBarData(null);
    setCurrentOrgId("");
    setActiveDepartmentId(null);
    setActiveRoomId(null);
    setActiveUserId(null);
  };

  const loadBarLevel = async (
    level: "department" | "room" | "user",
    id: string
  ) => {
    const safeId = normalizeOrgId(id);

    if (level === "department") {
      setCustomBarData(null);
      setDrillLevel("department");
      return;
    }

    try {
      const data = await loadDepartmentMutation.mutateAsync({
        orgId: safeId,
        weekCheck: filterParams.weekCheck,
        monthCheck: filterParams.monthCheck,
        yearCheck: filterParams.yearCheck,
        fromDate: filterParams.fromDate,
        toDate: filterParams.toDate,
      });

      if (data && data.length > 0) {
        // Map department data
        const mapped = data.map((d: any) => ({
          orgId: d.orgId,
          orgName: d.orgName || d.name || "N/A",
          doingBcyTask: d.doingBcyTask || 0,
          doneBcyTask: d.doneBcyTask || 0,
          outDateBcyTask: d.outDateBcyTask || 0,
          totalBcyTask:
            (d.doingBcyTask || 0) +
            (d.doneBcyTask || 0) +
            (d.outDateBcyTask || 0),
          checkUser: d.checkUser,
        }));
        setCustomBarData(mapped);
        setDrillLevel(level);
        return;
      }

      // Fallback to list API
      const listData = await loadDashboardListMutation.mutateAsync({
        userIds: safeId,
      });

      if (listData) {
        // Map list data
        const mapped = (Array.isArray(listData) ? listData : []).map(
          (u: any) => ({
            orgId: u.orgId || u.handlerId || u.id,
            orgName:
              u.name ||
              u.handlerName ||
              u.fullName ||
              u.userFullName ||
              u.userName ||
              "N/A",
            doingBcyTask: u.doingBcyTask || 0,
            doneBcyTask: u.doneBcyTask || 0,
            outDateBcyTask: u.outDateBcyTask || 0,
            totalBcyTask:
              u.count ||
              u.totalBcyTask ||
              (u.doingBcyTask || 0) +
                (u.doneBcyTask || 0) +
                (u.outDateBcyTask || 0),
            checkUser: u.checkUser,
          })
        );
        setCustomBarData(mapped);
        setDrillLevel(level);
      }
    } catch (error) {
      handleError(error);
    }
  };

  // Go back to previous level
  const goBack = () => {
    callBack?.();
    if (!drillStack || drillStack.length === 0) {
      resetDrill();
      return;
    }

    const prev = drillStack[drillStack.length - 1];
    setDrillStack(drillStack.slice(0, -1));
    setDrillLevel(prev.level);
    setCustomBarData(prev.barData);
    setCurrentOrgId(prev.id);

    setActiveDepartmentId(null);
    setActiveRoomId(null);
    setActiveUserId(null);
  };

  // Check if bar is active
  const isBarActive = (item: any): boolean => {
    const id = String(item?.orgId || item?.handlerId || item?.id || "");
    if (!id) return false;

    if (drillLevel === "department") return activeDepartmentId === id;
    if (drillLevel === "room") return activeRoomId === id;
    return activeUserId === id;
  };

  const onFilterChange = (filter: string, from?: string, to?: string) => {
    setActiveFilter(filter);
    if (filter === "custom" && from && to) {
      setStartDate(from);
      setEndDate(to);
    } else {
      setStartDate("");
      setEndDate("");
    }
  };

  const onBarClick = async (dept: any, index: number) => {
    if (!dept) return;

    // === V2 logic ===
    if (isV2) {
      let nextLevel: "department" | "room" | "user" = "department";

      if (drillLevel === "department") {
        nextLevel = "room";
      } else if (drillLevel === "room") {
        nextLevel = "user";
      }

      const targetId =
        dept?.orgId ||
        dept?.handlerId ||
        dept?.id ||
        dept?.org ||
        dept?.orgIdDonVi ||
        null;

      if (!targetId) {
        ToastUtils.error("Không tìm thấy id để drill xuống");
        return;
      }

      if (dept?.checkUser === true || drillLevel === "user") {
        setSelectedOrgForGantt(targetId);
        setSelectedUsersForGantt({
          orgId: targetId,
          orgName: dept?.orgName || dept?.name || dept?.fullName || "N/A",
        });
        setShowGanttChart(true);
        return;
      }

      setDrillStack([
        ...drillStack,
        {
          level: drillLevel,
          id: currentOrgId || "",
          label: "",
          barData: barData.slice(),
        },
      ]);

      setCurrentOrgId(String(targetId));

      if (drillLevel === "department") {
        setActiveDepartmentId(String(targetId));
        setActiveRoomId(null);
        setActiveUserId(null);
        callDonvi?.(true, targetId);
      } else if (drillLevel === "room") {
        setActiveRoomId(String(targetId));
        setActiveUserId(null);
        callPhong?.(false, targetId);
      } else {
        setActiveUserId(String(targetId));
      }

      await loadBarLevel(nextLevel, String(targetId));

      // if (nextLevel === "user" && drillLevel === "department") {
      //   callDonvi?.(true, targetId);
      //   setTimeout(() => callPhong?.(false, targetId), 150);
      // }
      return;
    }

    // === Legacy (non-V2) logic, giữ nguyên hành vi cũ ===
    const nextLevel: "department" | "room" | "user" =
      listUser && listUser.length > 0
        ? "user"
        : listPhong && listPhong.length > 0
          ? "room"
          : "department";

    if (
      (nextLevel === "user" && listUser && listUser.length > 0) ||
      dept?.checkUser
    ) {
      const targetId = dept?.orgId || dept?.handlerId || dept?.id || null;
      setSelectedOrgForGantt(targetId);
      setSelectedUsersForGantt({
        orgId: targetId,
        orgName: dept?.orgName || dept?.name || dept?.fullName || "N/A",
      });
      setShowGanttChart(true);
      return;
    }

    setDrillStack([
      ...drillStack,
      {
        level: nextLevel,
        id: currentOrgId || "",
        label: "",
        barData: barData.slice(),
      },
    ]);

    const targetId =
      (dept &&
        (dept.orgId ||
          dept.handlerId ||
          dept.id ||
          dept.org ||
          dept.orgIdDonVi ||
          dept.orgId)) ||
      null;

    if (targetId) {
      setCurrentOrgId(String(targetId));

      if (nextLevel === "department") {
        setActiveDepartmentId(String(targetId));
        setActiveRoomId(null);
        setActiveUserId(null);
        callDonvi?.(true, targetId);
      } else if (nextLevel === "room") {
        setActiveRoomId(String(targetId));
        setActiveUserId(null);
        callPhong?.(false, targetId);
      }

      await loadBarLevel(nextLevel, String(targetId));

      if (nextLevel === "user" && drillLevel === "department") {
        callDonvi?.(true, targetId);
        setTimeout(() => callPhong?.(false, targetId), 150);
      }
    } else {
      ToastUtils.error("Không tìm thấy id để drill xuống");
    }
  };

  const closeGanttChart = () => {
    setShowGanttChart(false);
    setSelectedOrgForGantt(null);
  };

  useEffect(() => {
    if (orgCheck) {
      resetDrill();
      setActiveDepartmentId(null);
      setActiveRoomId(null);
      setActiveUserId(null);
    }
  }, [orgCheck]);

  useEffect(() => {
    resetDrill();
  }, [activeFilter, startDate, endDate]);

  useEffect(() => {
    if (idDonVi) {
      const deptId =
        Array.isArray(idDonVi) && idDonVi.length > 0
          ? String(idDonVi[0])
          : String(idDonVi);

      setDrillLevel("department");
      setActiveDepartmentId(deptId);
      setActiveRoomId(null);
      setActiveUserId(null);
      setCurrentOrgId(deptId);
      setCustomBarData(null);

      if (Array.isArray(idDonVi) && idDonVi.length > 0) {
        loadBarLevel("room", deptId);
      }
    }
  }, [idDonVi]);

  useEffect(() => {
    if (listPhong && listPhong.length > 0 && currentOrgId) {
      setDrillLevel("room");
    }
  }, [listPhong]);

  return (
    <div className="flex flex-col gap-7 w-full">
      <StatisticFilter
        totalTasks={dashboardData?.totalBcyTask || 0}
        onFilterChange={onFilterChange}
        isV2={isV2}
      />

      <div className="grid grid-cols-4 gap-4">
        {statisticCards.map((card) => (
          <StatisticCard
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            borderColor={card.borderColor}
            iconBgColor={card.iconBgColor}
            iconColor={card.iconColor}
          />
        ))}
      </div>

      <StatisticChartContent
        barData={barData}
        dashboardData={dashboardData}
        onBarClick={onBarClick}
        isBarActive={isBarActive}
        callBack={goBack}
      />

      <GanttModal
        show={showGanttChart}
        selectedOrgId={selectedOrgForGantt}
        onClose={closeGanttChart}
        filterParams={filterParams}
        selectedUsers={selectedUsersForGantt}
        isV2={isV2}
      />
    </div>
  );
}
